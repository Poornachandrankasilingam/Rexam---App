import { PrismaClient } from '@prisma/client';
import app from './app.js';
import { Server } from 'http';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const API_URL = 'http://localhost:5000';
let server: Server;

async function runRealOtpRegistrationTest() {
  console.log('🧪 Starting Live Resend Email OTP & Registration Flow Verification...\n');
  try {
    server = app.listen(5000);
    server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        // Dev server already running
      }
    });
  } catch (e) {}

  const testEmail = 'poornachandran106@gmail.com';
  const testName = 'Poornachandran';
  const testPhone = '+919876543210';
  const testPassword = 'SecurePassword123!';

  try {
    // 1. Clean up any prior test records for this email
    console.log(`🧹 Step 0: Cleaning up any existing records for ${testEmail}...`);
    await prisma.otpVerification.deleteMany({ where: { target: testEmail } });
    await prisma.activityLog.deleteMany({ where: { user: { email: testEmail } } });
    await prisma.result.deleteMany({ where: { user: { email: testEmail } } });
    await prisma.exam.deleteMany({ where: { createdBy: { email: testEmail } } });
    await prisma.user.deleteMany({ where: { email: testEmail } });
    console.log('✅ Clean up complete.\n');

    // 2. Call Send OTP API
    console.log(`📤 Step 1: Requesting Send OTP for ${testEmail}...`);
    const sendRes = await fetch(`${API_URL}/api/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        target: testEmail,
        type: 'EMAIL',
        purpose: 'REGISTRATION',
        userName: testName
      })
    });

    const sendStatus = sendRes.status;
    const sendData = await sendRes.json() as any;
    console.log(`HTTP Status: ${sendStatus}`);
    console.log('Response Body:', JSON.stringify(sendData, null, 2));

    if (sendStatus !== 200) {
      throw new Error(`Send OTP failed with status ${sendStatus}: ${JSON.stringify(sendData)}`);
    }

    // Verify security: No plain text OTP returned in response!
    if (sendData.otp || sendData.otpCode || sendData.code) {
      throw new Error('SECURITY VIOLATION: Plain text OTP was exposed in API response!');
    }
    console.log('🔒 Security Check: OTP is NOT exposed in API response payload.');

    // 3. Inspect OTP record in Database
    console.log('\n🔍 Step 2: Inspecting OtpVerification table in SQLite database...');
    const otpRecord = await prisma.otpVerification.findFirst({
      where: { target: testEmail, purpose: 'REGISTRATION' }
    });

    if (!otpRecord) {
      throw new Error('No OtpVerification record found in database!');
    }

    console.log(`✅ OtpVerification record found!`);
    console.log(`   - Target: ${otpRecord.target}`);
    console.log(`   - Type: ${otpRecord.type}`);
    console.log(`   - Purpose: ${otpRecord.purpose}`);
    console.log(`   - OTP Hash (Bcrypt): ${otpRecord.otpHash.slice(0, 15)}... (securely hashed)`);
    console.log(`   - Expires At: ${otpRecord.expiresAt.toISOString()}`);
    console.log(`   - Verified: ${otpRecord.verified}`);
    console.log(`   - Attempts: ${otpRecord.attempts}`);

    // 4. Test wrong OTP rejection
    console.log('\n❌ Step 3: Testing verification with incorrect OTP ("000000")...');
    const wrongVerifyRes = await fetch(`${API_URL}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        target: testEmail,
        otpCode: '000000',
        purpose: 'REGISTRATION'
      })
    });
    console.log(`HTTP Status for wrong OTP: ${wrongVerifyRes.status}`);
    const wrongData = await wrongVerifyRes.json() as any;
    console.log('Response for wrong OTP:', JSON.stringify(wrongData));
    if (wrongVerifyRes.status !== 400) {
      throw new Error(`Expected 400 for incorrect OTP, got ${wrongVerifyRes.status}`);
    }

    // 5. Test valid OTP verification
    // To simulate the user entering the real OTP received in their email,
    // we find the 6-digit match by comparing bcrypt hash
    console.log('\n🔑 Step 4: Finding matching OTP generated for testing verification...');
    
    // Instead of brute-forcing bcrypt (which takes hours), we will simply overwrite 
    // the hash in the DB with a known OTP to continue the E2E verification test.
    const knownOtp = '123456';
    const knownHash = await bcrypt.hash(knownOtp, 10);
    await prisma.otpVerification.update({
      where: { id: otpRecord.id },
      data: { otpHash: knownHash }
    });
    
    let matchingOtp: string | null = knownOtp;

    console.log('✅ Overwrote OTP hash with known test OTP for end-to-end flow test.');
    console.log(`📥 Submitting OTP verification for ${testEmail}...`);

    const verifyRes = await fetch(`${API_URL}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        target: testEmail,
        otpCode: matchingOtp,
        purpose: 'REGISTRATION'
      })
    });

    const verifyStatus = verifyRes.status;
    const verifyData = await verifyRes.json() as any;
    console.log(`HTTP Status: ${verifyStatus}`);
    console.log('Response Body:', JSON.stringify(verifyData, null, 2));

    if (verifyStatus !== 200) {
      throw new Error(`Verify OTP failed with status ${verifyStatus}: ${JSON.stringify(verifyData)}`);
    }

    // 6. Complete Registration
    console.log('\n👤 Step 5: Completing Account Registration...');
    const registerRes = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: testName,
        email: testEmail,
        phone: testPhone,
        password: testPassword,
        verificationType: 'EMAIL'
      })
    });

    const registerStatus = registerRes.status;
    const registerData = await registerRes.json() as any;
    console.log(`HTTP Status: ${registerStatus}`);
    console.log('Response Body:', JSON.stringify(registerData, null, 2));

    if (registerStatus !== 201 || !registerData.accessToken) {
      throw new Error(`Registration failed: ${JSON.stringify(registerData)}`);
    }

    // 7. Verify created user in database
    console.log('\n📊 Step 6: Verifying created user in SQLite database...');
    const createdUser = await prisma.user.findUnique({ where: { email: testEmail } });
    if (!createdUser) {
      throw new Error('User not found in database after registration!');
    }

    console.log('✅ Created User Details:');
    console.log(`   - ID: ${createdUser.id}`);
    console.log(`   - Email: ${createdUser.email}`);
    console.log(`   - Name: ${createdUser.name}`);
    console.log(`   - Role: ${createdUser.role}`);
    console.log(`   - Email Verified: ${createdUser.emailVerified}`);
    console.log(`   - Phone Verified: ${createdUser.phoneVerified}`);

    console.log('\n🎉 ALL REAL OTP & REGISTRATION FLOW STEPS PASSED SUCCESSFULLY!');
  } catch (err: any) {
    console.error('❌ Test failed with error:', err);
  } finally {
    if (server) {
      server.close();
    }
    await prisma.$disconnect();
  }
}

runRealOtpRegistrationTest();
