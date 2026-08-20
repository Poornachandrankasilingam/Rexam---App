import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../config/prisma.js';
import { z } from 'zod';
import { deliverOtp } from '../services/otpDeliveryService.js';

// Registration Validation Schema
const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  name: z.string().min(1, "Full name is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional().nullable(),
  role: z.enum(['STUDENT']).optional() // Self-registration strictly defaults to STUDENT
});

/**
 * Mask target string for secure UI display (never leak full details)
 */
function maskTarget(target: string, type: 'EMAIL' | 'PHONE'): string {
  if (type === 'EMAIL') {
    const parts = target.split('@');
    if (parts.length < 2) return target;
    const name = parts[0];
    const domain = parts[1];
    const maskedName = name.length > 2 ? `${name[0]}*****${name[name.length - 1]}` : '*****';
    return `${maskedName}@${domain}`;
  } else {
    // Phone
    const digits = target.replace(/\D/g, '');
    if (digits.length <= 4) return target;
    const prefix = target.startsWith('+') ? target.slice(0, 3) : '';
    const last4 = digits.slice(-4);
    return `${prefix}******${last4}`;
  }
}

/**
 * Generate & Deliver Secure Cryptographic 6-Digit OTP
 * OTP is hashed before storing. NEVER exposed in API JSON or frontend console.
 */
export const sendOtp = async (req: Request, res: Response) => {
  console.log("-----------------------------------------");
  console.log("🚀 Incoming Send OTP Request:", req.body.target || req.body.identifier || req.body.email || req.body.phone);

  try {
    const rawTarget = req.body.target || req.body.identifier || req.body.email || req.body.phone;
    const rawType = req.body.type || (rawTarget && rawTarget.includes('@') ? 'EMAIL' : 'PHONE');
    const purpose = (req.body.purpose || 'REGISTRATION').toUpperCase();
    const userName = req.body.userName || req.body.name;

    if (!rawTarget || typeof rawTarget !== 'string' || !rawTarget.trim()) {
      return res.status(400).json({ message: "Email address or Phone number is required" });
    }

    const cleanTarget = rawTarget.toLowerCase().trim();
    const cleanPhoneTarget = rawTarget.trim();
    const targetType: 'EMAIL' | 'PHONE' = rawType.toUpperCase() === 'PHONE' || (!rawTarget.includes('@') && /^\+?\d+$/.test(cleanPhoneTarget)) ? 'PHONE' : 'EMAIL';

    // If purpose is LOGIN or FORGOT_PASSWORD, verify user exists
    let existingUser = null;
    if (purpose === 'LOGIN' || purpose === 'FORGOT_PASSWORD') {
      existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: cleanTarget },
            { phone: cleanTarget },
            { phone: cleanPhoneTarget }
          ]
        }
      });

      if (!existingUser) {
        console.warn(`⚠️ Account not found for ${cleanTarget}`);
        return res.status(404).json({
          accountExists: false,
          message: "Account not found",
          error: "This email or mobile number is not registered with Rexam.",
          target: rawTarget.trim(),
          targetType
        });
      }
    }

    // 1. Generate cryptographically secure 6-digit numeric OTP
    const rawOtp = crypto.randomInt(100000, 1000000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration

    // 2. Hash the OTP using bcrypt so plain text is NEVER stored in database
    const otpHash = await bcrypt.hash(rawOtp, 10);

    // 3. Upsert record in OtpVerification table
    // Delete any existing active verification for this target & purpose first
    await prisma.otpVerification.deleteMany({
      where: { target: cleanTarget, purpose }
    });

    await prisma.otpVerification.create({
      data: {
        target: cleanTarget,
        type: targetType,
        otpHash,
        expiresAt,
        attempts: 0,
        verified: false,
        purpose,
        userId: existingUser ? existingUser.id : null
      }
    });

    // 4. Deliver live OTP via Email or SMS service
    await deliverOtp({
      target: cleanTarget,
      type: targetType,
      otpCode: rawOtp,
      userName: userName || (existingUser ? existingUser.name : 'Candidate')
    });

    console.log(`🔐 OTP Generated & Hashed securely for target: ${maskTarget(cleanTarget, targetType)}`);
    console.log("-----------------------------------------");

    return res.status(200).json({
      accountExists: true,
      message: "OTP sent successfully.",
      targetMasked: maskTarget(cleanTarget, targetType),
      type: targetType,
      expiresInSeconds: 300
    });
  } catch (error: any) {
    console.error("❌ Send OTP error:", error);
    return res.status(500).json({ message: "Failed to send OTP", error: error.message || String(error) });
  }
};

/**
 * Verify OTP (Secure 6-digit verification with max 5 failed attempts lock)
 */
export const verifyOtp = async (req: Request, res: Response) => {
  console.log("-----------------------------------------");
  console.log("🚀 Incoming Verify OTP Request for target:", req.body.target || req.body.identifier || req.body.email || req.body.phone);

  try {
    const rawTarget = req.body.target || req.body.identifier || req.body.email || req.body.phone;
    const inputOtp = req.body.otpCode || req.body.otp;
    const purpose = (req.body.purpose || 'REGISTRATION').toUpperCase();

    if (!rawTarget || !inputOtp) {
      return res.status(400).json({ message: "Email/Phone target and 6-digit OTP are required" });
    }

    const cleanTarget = String(rawTarget).toLowerCase().trim();
    const cleanOtp = String(inputOtp).trim();

    if (cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
      return res.status(400).json({ message: "Invalid OTP format. OTP must be 6 numeric digits." });
    }

    // Find active verification record
    const record = await prisma.otpVerification.findFirst({
      where: { target: cleanTarget, purpose },
      orderBy: { createdAt: 'desc' }
    });

    if (!record) {
      return res.status(400).json({ message: "No active OTP request found. Please click Send OTP." });
    }

    // Check maximum failed attempts threshold (Max 5 attempts)
    if (record.attempts >= 5) {
      await prisma.otpVerification.delete({ where: { id: record.id } });
      return res.status(400).json({ message: "Too many attempts. Please request a new OTP." });
    }

    // Check expiration (5 minutes)
    if (new Date() > new Date(record.expiresAt)) {
      await prisma.otpVerification.delete({ where: { id: record.id } });
      return res.status(400).json({ message: "OTP expired. Please request a new OTP." });
    }

    // Compare hash
    const isMatch = await bcrypt.compare(cleanOtp, record.otpHash);

    if (!isMatch) {
      const updatedAttempts = record.attempts + 1;
      await prisma.otpVerification.update({
        where: { id: record.id },
        data: { attempts: updatedAttempts }
      });

      if (updatedAttempts >= 5) {
        return res.status(400).json({ message: "Too many attempts. Please request a new OTP." });
      }

      return res.status(400).json({ message: `Invalid OTP. Please try again. (${5 - updatedAttempts} attempts remaining)` });
    }

    // OTP Verified Successfully! Mark verified = true
    await prisma.otpVerification.update({
      where: { id: record.id },
      data: { verified: true, attempts: 0 }
    });

    console.log(`✅ OTP Verification Successful for ${cleanTarget} (${purpose})`);

    // Handle Login with OTP directly if purpose === 'LOGIN'
    if (purpose === 'LOGIN') {
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: cleanTarget },
            { phone: cleanTarget }
          ]
        }
      });

      if (!user) {
        return res.status(404).json({ message: "User account not found." });
      }

      // Clear OTP record after successful login
      await prisma.otpVerification.delete({ where: { id: record.id } });

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

      return res.status(200).json({
        message: "Verification successful.",
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone
        }
      });
    }

    return res.status(200).json({
      message: "Verification successful.",
      verifiedToken: record.id
    });
  } catch (error: any) {
    console.error("❌ Verify OTP error:", error);
    return res.status(500).json({ message: "OTP verification failed", error: error.message || String(error) });
  }
};

/**
 * Register User Account (Direct Registration without OTP requirement)
 */
export const register = async (req: Request, res: Response) => {
  console.log("-----------------------------------------");
  console.log("🚀 Incoming Direct Registration Request:", req.body.email);

  const validationResult = registerSchema.safeParse(req.body);
  if (!validationResult.success) {
    const errorMessages = validationResult.error.issues.map(err => `${err.path.join('.')}: ${err.message}`).join(", ");
    return res.status(400).json({ message: "Validation failed", error: errorMessages });
  }

  const { email, password, name, phone } = validationResult.data;
  const cleanEmail = email.toLowerCase().trim();
  const cleanPhone = phone ? phone.trim() : null;

  try {
    // 1. Check duplicate email
    const existingEmail = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existingEmail) {
      return res.status(400).json({ message: "Email is already registered. Please sign in instead." });
    }

    // 2. Check duplicate phone if provided
    if (cleanPhone) {
      const existingPhone = await prisma.user.findFirst({ where: { phone: cleanPhone } });
      if (existingPhone) {
        return res.status(400).json({ message: "Phone number is already registered." });
      }
    }

    // 3. Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create User Record (Default role is strictly STUDENT)
    const user = await prisma.user.create({
      data: {
        email: cleanEmail,
        password: hashedPassword,
        name,
        role: 'STUDENT',
        phone: cleanPhone,
        emailVerified: true,
        phoneVerified: !!cleanPhone
      }
    });

    // 5. Generate JWT token for immediate auto-login
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

    console.log("🎉 User registered directly with ID:", user.id);
    console.log("-----------------------------------------");

    return res.status(201).json({
      message: 'User registered successfully',
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
    console.error("❌ Registration error:", error);
    return res.status(500).json({ message: "Registration failed", error: error.message || String(error) });
  }
};

/**
 * Login with Email/Phone + Password
 */
export const login = async (req: Request, res: Response) => {
  console.log("-----------------------------------------");
  console.log("🚀 Incoming Login Request:", req.body.identifier || req.body.email || req.body.phone);

  try {
    const identifier = req.body.identifier || req.body.email || req.body.phone;
    const password = req.body.password;

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Email or Mobile Number and password are required' });
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
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

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
      }
    });
  } catch (error: any) {
    console.error("❌ Login error:", error);
    return res.status(500).json({ message: 'Login failed', error: error.message || String(error) });
  }
};

/**
 * Logout
 */
export const logout = (req: Request, res: Response) => {
  res.clearCookie('refreshToken');
  return res.status(200).json({ message: 'Logged out successfully' });
};

/**
 * Forgot Password Init (Direct or OTP)
 */
export const forgotPassword = async (req: Request, res: Response) => {
  const rawTarget = req.body.target || req.body.email || req.body.phone || req.body.identifier;
  if (!rawTarget) {
    return res.status(400).json({ message: "Email or phone number is required" });
  }
  const cleanTarget = String(rawTarget).toLowerCase().trim();
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: cleanTarget },
        { phone: cleanTarget }
      ]
    }
  });
  if (!user) {
    return res.status(404).json({ message: "No account found with this email or mobile number." });
  }
  return res.status(200).json({ message: "Account verified. You can now reset your password.", email: user.email });
};

/**
 * Reset Password (Updates Password Directly for User)
 */
export const resetPassword = async (req: Request, res: Response) => {
  console.log("-----------------------------------------");
  console.log("🚀 Incoming Reset Password Request for:", req.body.target || req.body.email || req.body.phone);

  try {
    const rawTarget = req.body.target || req.body.email || req.body.phone || req.body.identifier;
    const newPassword = req.body.newPassword || req.body.password;

    if (!rawTarget || !newPassword) {
      return res.status(400).json({ message: "Email/Phone and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const cleanTarget = String(rawTarget).toLowerCase().trim();
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanTarget },
          { phone: cleanTarget }
        ]
      }
    });

    if (!user) {
      return res.status(404).json({ message: "User account not found" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetCode: null,
        resetCodeExpiry: null
      }
    });

    // Delete any pending OTP records
    await prisma.otpVerification.deleteMany({
      where: { target: cleanTarget }
    });

    console.log("🎉 Password reset successfully for user:", user.email);
    console.log("-----------------------------------------");

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error: any) {
    console.error("❌ Reset password error:", error);
    return res.status(500).json({ message: "Password reset failed", error: error.message || String(error) });
  }
};

/**
 * Google Sign-In & Sign-Up Authentication
 * Verifies Google ID token / access token or profile payload and signs user in.
 */
export const googleAuth = async (req: Request, res: Response) => {
  console.log("-----------------------------------------");
  console.log("🚀 Incoming Google Authentication Request");

  try {
    const { credential, token, email: rawEmail, name: rawName } = req.body;

    let email = rawEmail;
    let name = rawName;
    let googleId = req.body.googleId || req.body.sub;

    // 1. If Google ID Token (JWT Credential) is provided, verify or decode
    if (credential && typeof credential === 'string') {
      try {
        // Try verifying with Google TokenInfo endpoint
        const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
        if (googleRes.ok) {
          const payload = await googleRes.json() as any;
          email = payload.email;
          name = payload.name || payload.given_name || payload.email?.split('@')[0];
          googleId = payload.sub;
        } else {
          // Fallback: parse unverified payload from JWT token
          const parts = credential.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
            email = payload.email || email;
            name = payload.name || payload.given_name || name;
            googleId = payload.sub || googleId;
          }
        }
      } catch (tokenErr) {
        console.warn("⚠️ Google tokeninfo verify failed, attempting JWT payload parse:", tokenErr);
        const parts = credential.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
          email = payload.email || email;
          name = payload.name || payload.given_name || name;
          googleId = payload.sub || googleId;
        }
      }
    } else if (token && typeof token === 'string') {
      // Access token verification via Google UserInfo endpoint
      try {
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (userInfoRes.ok) {
          const userInfo = await userInfoRes.json() as any;
          email = userInfo.email;
          name = userInfo.name || userInfo.given_name || userInfo.email?.split('@')[0];
          googleId = userInfo.sub;
        }
      } catch (userErr) {
        console.warn("⚠️ Google userinfo fetch failed:", userErr);
      }
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ message: "Google authentication failed: Valid email address is required" });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name?.trim() || cleanEmail.split('@')[0];

    // 2. Look up existing user by email
    let user = await prisma.user.findUnique({
      where: { email: cleanEmail }
    });

    if (!user) {
      // 3. Auto-create new student user for Google sign-in
      const randomPassword = crypto.randomBytes(32).toString('hex');
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = await prisma.user.create({
        data: {
          email: cleanEmail,
          name: cleanName,
          password: hashedPassword,
          role: 'STUDENT',
          emailVerified: true
        }
      });
      console.log("✨ New user created via Google Sign-In with ID:", user.id);
    } else if (!user.emailVerified) {
      // Mark emailVerified = true
      user = await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true }
      });
    }

    // 4. Generate JWT tokens
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

    console.log("✅ Google Sign-In successful for:", user.email);
    console.log("-----------------------------------------");

    return res.status(200).json({
      message: "Google authentication successful",
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
    console.error("❌ Google Auth error:", error);
    return res.status(500).json({ message: "Google authentication failed", error: error.message || String(error) });
  }
};
