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
  phone: z.string().optional().nullable()
});

export const register = async (req: Request, res: Response) => {
    console.log("-----------------------------------------");
    console.log("🚀 Incoming Registration Request");
    console.log("Payload:", JSON.stringify(req.body, null, 2));
    
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

        console.log("🔒 Hashing password...");
        const hashedPassword = await bcrypt.hash(password, 10);

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

/**
 * Flexible Password Login with Email OR Mobile Number
 */
export const login = async (req: Request, res: Response) => {
    console.log("-----------------------------------------");
    console.log("🚀 Incoming Login Request:", req.body.email || req.body.identifier || req.body.phone);
    try {
        const identifier = req.body.identifier || req.body.email || req.body.phone;
        const password = req.body.password;

        if (!identifier || !password) {
            return res.status(400).json({ message: 'Email or Mobile Number and password are required' });
        }

        const cleanIdentifier = identifier.toLowerCase().trim();
        console.log("🔍 Querying user by email or phone:", cleanIdentifier);

        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: cleanIdentifier },
                    { phone: cleanIdentifier }
                ]
            }
        });

        if (!user) {
            console.warn("⚠️ User not found for identifier:", cleanIdentifier);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        console.log("🔑 Comparing passwords...");
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.warn("⚠️ Password mismatch for user:", cleanIdentifier);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        console.log("🎫 Generating JWT tokens...");
        const jwtSecret = process.env.JWT_SECRET || 'rexam_production_jwt_secret_key_2026';
        const refreshSecret = process.env.REFRESH_TOKEN_SECRET || 'rexam_production_refresh_token_secret_2026';

        const accessToken = jwt.sign(
            { id: user.id, role: user.role },
            jwtSecret,
            { expiresIn: '7d' }
        );

        const refreshToken = jwt.sign(
            { id: user.id },
            refreshSecret,
            { expiresIn: '7d' }
        );

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        console.log("✅ Login successful for user:", user.email);
        console.log("-----------------------------------------");
        return res.status(200).json({
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                phone: user.phone
            },
        });
    } catch (error: any) {
        console.error("❌ Login error:", error);
        return res.status(500).json({ message: 'Login failed', error: error.message || String(error) });
    }
};

/**
 * Generate 6-digit OTP for Email or Mobile Number
 */
export const sendOtp = async (req: Request, res: Response) => {
    console.log("-----------------------------------------");
    console.log("🚀 Incoming Send OTP Request:", req.body.identifier || req.body.email || req.body.phone);
    try {
        const identifier = req.body.identifier || req.body.email || req.body.phone;
        if (!identifier) {
            return res.status(400).json({ message: "Email address or Mobile number is required" });
        }

        const cleanIdentifier = identifier.toLowerCase().trim();
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: cleanIdentifier },
                    { phone: cleanIdentifier }
                ]
            }
        });

        if (!user) {
            return res.status(404).json({ message: "User account not found for provided Email or Mobile number" });
        }

        // Generate 6-digit numeric OTP code
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpCodeExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration

        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetCode: otpCode,
                resetCodeExpiry: otpCodeExpiry
            }
        });

        console.log(`🔑 Generated Login OTP for ${user.email} (${user.phone || 'N/A'}): ${otpCode}`);
        console.log(`📬 [OTP SIMULATION] OTP sent to ${cleanIdentifier}`);

        return res.status(200).json({
            message: `OTP sent successfully to ${cleanIdentifier}`,
            otpCode // Returned for testing / fast preview convenience
        });
    } catch (error: any) {
        console.error("❌ Send OTP error:", error);
        return res.status(500).json({ message: "Failed to send OTP", error: error.message || String(error) });
    }
};

/**
 * Verify OTP & Login User Account
 */
export const verifyOtp = async (req: Request, res: Response) => {
    console.log("-----------------------------------------");
    console.log("🚀 Incoming Verify OTP Request:", req.body.identifier, "OTP:", req.body.otpCode || req.body.otp);
    try {
        const identifier = req.body.identifier || req.body.email || req.body.phone;
        const otpCode = req.body.otpCode || req.body.otp;

        if (!identifier || !otpCode) {
            return res.status(400).json({ message: "Email/Mobile Number and OTP code are required" });
        }

        const cleanIdentifier = identifier.toLowerCase().trim();
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: cleanIdentifier },
                    { phone: cleanIdentifier }
                ]
            }
        });

        if (!user || !user.resetCode || !user.resetCodeExpiry) {
            return res.status(400).json({ message: "Invalid or expired OTP code. Please request a new OTP." });
        }

        if (user.resetCode !== String(otpCode).trim()) {
            return res.status(400).json({ message: "Incorrect OTP code. Please check and try again." });
        }

        if (new Date() > new Date(user.resetCodeExpiry)) {
            return res.status(400).json({ message: "OTP code has expired. Please request a new OTP." });
        }

        // Clear OTP code after successful login
        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetCode: null,
                resetCodeExpiry: null
            }
        });

        const jwtSecret = process.env.JWT_SECRET || 'rexam_production_jwt_secret_key_2026';
        const refreshSecret = process.env.REFRESH_TOKEN_SECRET || 'rexam_production_refresh_token_secret_2026';

        const accessToken = jwt.sign(
            { id: user.id, role: user.role },
            jwtSecret,
            { expiresIn: '7d' }
        );

        const refreshToken = jwt.sign(
            { id: user.id },
            refreshSecret,
            { expiresIn: '7d' }
        );

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        console.log(`✅ OTP Verification Successful for ${user.email}`);
        return res.status(200).json({
            message: "OTP verified successfully",
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                phone: user.phone
            }
        });
    } catch (error: any) {
        console.error("❌ Verify OTP error:", error);
        return res.status(500).json({ message: "OTP verification failed", error: error.message || String(error) });
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

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = new Date(Date.now() + 15 * 60 * 1000);

        console.log(`🔑 Generated Reset Code for ${cleanEmail}: ${code}`);

        await prisma.user.update({
            where: { email: cleanEmail },
            data: {
                resetCode: code,
                resetCodeExpiry: expiry
            }
        });

        console.log(`📬 [EMAIL SIMULATION] Sent reset code ${code} to ${cleanEmail}`);
        console.log("-----------------------------------------");

        return res.status(200).json({
            message: 'Reset code generated and sent successfully',
            code
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

        if (user.resetCode !== code) {
            console.warn(`⚠️ Reset code mismatch for user ${cleanEmail}. Expected: ${user.resetCode}, Got: ${code}`);
            return res.status(400).json({ message: 'Invalid verification code' });
        }

        if (new Date() > user.resetCodeExpiry) {
            console.warn(`⚠️ Reset code expired for user ${cleanEmail}`);
            return res.status(400).json({ message: 'Verification code has expired' });
        }

        console.log("🔒 Hashing new password...");
        const hashedPassword = await bcrypt.hash(newPassword, 10);

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
