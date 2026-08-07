import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';
import { z } from 'zod';

// Registration Validation Schema
const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required"),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'STUDENT']).optional(),
  phone: z.string().optional()
});

export const register = async (req: Request, res: Response) => {
    console.log("-----------------------------------------");
    console.log("🚀 Incoming Registration Request");
    console.log("Payload:", JSON.stringify(req.body, null, 2));
    
    // 1. Connection check / Database reachability
    try {
        console.log("🔌 Checking database connection...");
        await prisma.$connect();
        console.log("✅ Database connection successful");
    } catch (connectError: any) {
        console.error("❌ Database connection failed:", connectError);
        return res.status(500).json({ 
            message: "Database connection failed", 
            error: connectError.message || String(connectError) 
        });
    }

    // 2. Validate request body
    const validationResult = registerSchema.safeParse(req.body);
    if (!validationResult.success) {
        const errorMessages = validationResult.error.issues.map(err => `${err.path.join('.')}: ${err.message}`).join(", ");
        console.warn("⚠️ Validation failed:", errorMessages);
        return res.status(400).json({
            message: "Validation failed",
            error: errorMessages
        });
    }

    const { email, password, name, role, phone } = validationResult.data;
    const cleanEmail = email.toLowerCase().trim();
    const cleanPhone = phone && phone.trim() !== "" ? phone.trim() : null;
    console.log("✅ Validation succeeded for:", { email: cleanEmail, name, role, phone: cleanPhone });

    try {
        // 3. Duplicate checks
        console.log("🔍 Checking for existing email:", cleanEmail);
        const existingUser = await prisma.user.findUnique({ where: { email: cleanEmail } });
        if (existingUser) {
            console.warn("⚠️ Duplicate email detected:", cleanEmail);
            return res.status(400).json({ message: "Email already exists" });
        }

        if (cleanPhone) {
            console.log("🔍 Checking for existing phone:", cleanPhone);
            const existingUserPhone = await prisma.user.findFirst({ where: { phone: cleanPhone } });
            if (existingUserPhone) {
                console.warn("⚠️ Duplicate phone detected:", cleanPhone);
                return res.status(400).json({ message: "Phone already exists" });
            }
        }

        // 4. Password hashing
        console.log("🔒 Hashing password...");
        const hashedPassword = await bcrypt.hash(password, 10);

        // 5. Create user record
        console.log("📥 Creating user record in database...");
        const user = await prisma.user.create({
            data: {
                email: cleanEmail,
                password: hashedPassword,
                name,
                role: role || 'STUDENT',
                phone: cleanPhone,
            },
        });

        console.log("🎉 User created successfully with ID:", user.id);
        console.log("-----------------------------------------");
        return res.status(201).json({ 
            message: 'User registered successfully', 
            userId: user.id 
        });
    } catch (error: any) {
        console.error("❌ Registration error:", error);
        
        // Differentiate Prisma errors if possible
        if (error.code) {
            return res.status(500).json({
                message: "Prisma database operation failed",
                error: `Prisma Error Code: ${error.code}. Message: ${error.message || String(error)}`
            });
        }
        
        return res.status(500).json({ 
            message: 'Internal server error during registration', 
            error: error.message || String(error) 
        });
    }
};

export const login = async (req: Request, res: Response) => {
    console.log("-----------------------------------------");
    console.log("🚀 Incoming Login Request:", req.body.email);
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const cleanEmail = email.toLowerCase().trim();
        console.log("🔍 Querying user email:", cleanEmail);
        const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
        if (!user) {
            console.warn("⚠️ User not found for email:", cleanEmail);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        console.log("🔑 Comparing passwords...");
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.warn("⚠️ Password mismatch for user:", cleanEmail);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        console.log("🎫 Generating JWT tokens...");
        const accessToken = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET!,
            { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
            { id: user.id },
            process.env.REFRESH_TOKEN_SECRET!,
            { expiresIn: '7d' }
        );

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        console.log("✅ Login successful for user:", cleanEmail);
        console.log("-----------------------------------------");
        return res.status(200).json({
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        });
    } catch (error: any) {
        console.error("❌ Login error:", error);
        return res.status(500).json({ message: 'Login failed', error: error.message || String(error) });
    }
};

export const logout = (req: Request, res: Response) => {
    res.clearCookie('refreshToken');
    return res.status(200).json({ message: 'Logged out successfully' });
};

export const forgotPassword = async (req: Request, res: Response) => {
    console.log("-----------------------------------------");
    console.log("🚀 Incoming Forgot Password Request:", req.body.email);
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const cleanEmail = email.toLowerCase().trim();
        const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
        if (!user) {
            console.warn("⚠️ User not found for email:", cleanEmail);
            return res.status(404).json({ message: 'User with this email does not exist' });
        }

        // Generate a 6-digit random code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry

        console.log(`🔑 Generated Reset Code for ${cleanEmail}: ${code}`);

        await prisma.user.update({
            where: { email: cleanEmail },
            data: {
                resetCode: code,
                resetCodeExpiry: expiry
            }
        });

        // Simulating sending email by logging in console
        console.log(`📬 [EMAIL SIMULATION] Sent reset code ${code} to ${cleanEmail}`);
        console.log("-----------------------------------------");

        return res.status(200).json({
            message: 'Reset code generated and sent successfully',
            code: process.env.NODE_ENV === 'development' ? code : undefined
        });
    } catch (error: any) {
        console.error("❌ Forgot password error:", error);
        return res.status(500).json({ message: 'Forgot password failed', error: error.message || String(error) });
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    console.log("-----------------------------------------");
    console.log("🚀 Incoming Reset Password Request for:", req.body.email);
    try {
        const { email, code, newPassword } = req.body;

        if (!email || !code || !newPassword) {
            return res.status(400).json({ message: 'Email, code, and new password are required' });
        }

        const cleanEmail = email.toLowerCase().trim();
        const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.resetCode || !user.resetCodeExpiry) {
            return res.status(400).json({ message: 'No reset request found for this user' });
        }

        // Check code match
        if (user.resetCode !== code) {
            console.warn(`⚠️ Reset code mismatch for user ${cleanEmail}. Expected: ${user.resetCode}, Got: ${code}`);
            return res.status(400).json({ message: 'Invalid verification code' });
        }

        // Check code expiry
        if (new Date() > user.resetCodeExpiry) {
            console.warn(`⚠️ Reset code expired for user ${cleanEmail}`);
            return res.status(400).json({ message: 'Verification code has expired' });
        }

        // Hash new password
        console.log("🔒 Hashing new password...");
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password and clear reset code fields
        await prisma.user.update({
            where: { email: cleanEmail },
            data: {
                password: hashedPassword,
                resetCode: null,
                resetCodeExpiry: null
            }
        });

        console.log("🎉 Password reset successfully for user:", cleanEmail);
        console.log("-----------------------------------------");
        return res.status(200).json({ message: 'Password has been reset successfully' });
    } catch (error: any) {
        console.error("❌ Reset password error:", error);
        return res.status(500).json({ message: 'Password reset failed', error: error.message || String(error) });
    }
};
