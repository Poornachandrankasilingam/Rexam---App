import { PrismaClient } from '@prisma/client';
import app from './app.js';
import { Server } from 'http';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const API_URL = 'http://localhost:5000';
let server: Server;

async function runTests() {
  console.log('🧪 Starting Project Models, Secure OTP & API End-to-End Tests...\n');
  server = app.listen(5000);
  let testsPassed = 0;
  let totalTests = 0;

  const test = async (name: string, fn: () => Promise<void>) => {
    totalTests++;
    try {
      console.log(`⏳ Testing: ${name}...`);
      await fn();
      console.log(`✅ Passed: ${name}\n`);
      testsPassed++;
    } catch (error: any) {
      console.error(`❌ Failed: ${name}`);
      console.error(`   Error: ${error.message || error}\n`);
    }
  };

  // --- PRISMA DB / MODEL TESTS ---
  
  await test('Prisma Database Connectivity', async () => {
    await prisma.$connect();
  });

  const testEmail = 'test-prisma-model@rexam.com';

  await test('User & OTP Model Cleanup (Prerequisite)', async () => {
    const emails = [testEmail, 'usera@rexam.com', 'userb@rexam.com', 'api-test-user@rexam.com'];
    await prisma.otpVerification.deleteMany({ where: { target: { in: emails } } });
    await prisma.activityLog.deleteMany({ where: { user: { email: { in: emails } } } });
    await prisma.result.deleteMany({ where: { user: { email: { in: emails } } } });
    await prisma.exam.deleteMany({ where: { createdBy: { email: { in: emails } } } });
    await prisma.user.deleteMany({ where: { email: { in: emails } } });
  });

  await test('API - Health Check Endpoint (/health)', async () => {
    const res = await fetch(`${API_URL}/health`);
    if (!res.ok) throw new Error(`Health check returned status ${res.status}`);
    const data = await res.json() as any;
    if (data.status !== 'ok') throw new Error(`Expected status 'ok', got: ${data.status}`);
  });

  // --- SECURE OTP TESTS ---

  await test('Secure OTP Test - Zero Exposure in API Response', async () => {
    const sendRes = await fetch(`${API_URL}/api/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: 'usera@rexam.com', type: 'EMAIL', purpose: 'REGISTRATION' })
    });
    const sendData = await sendRes.json() as any;

    if (sendRes.status !== 200) {
      throw new Error(`Send OTP failed with status ${sendRes.status}`);
    }

    if (sendData.otpCode || sendData.otp) {
      throw new Error('SECURITY VIOLATION: Plain text OTP was exposed in API JSON response!');
    }

    if (!sendData.targetMasked) {
      throw new Error('Expected targetMasked in response payload');
    }
  });

  await test('Secure OTP Test - Hashed Storage in Database', async () => {
    const record = await prisma.otpVerification.findFirst({
      where: { target: 'usera@rexam.com', purpose: 'REGISTRATION' },
      orderBy: { createdAt: 'desc' }
    });

    if (!record) throw new Error('No OtpVerification record found in database');
    if (!record.otpHash || record.otpHash.length < 20) {
      throw new Error('SECURITY VIOLATION: OTP was not stored as a valid bcrypt hash string!');
    }
  });

  let validOtpForA = '';

  await test('Secure OTP Test - Verify Valid OTP & Register User A', async () => {
    // Generate known hashed OTP record directly for User A registration testing
    const testOtp = '123456';
    const otpHash = await bcrypt.hash(testOtp, 10);

    await prisma.otpVerification.deleteMany({ where: { target: 'usera@rexam.com' } });
    await prisma.otpVerification.create({
      data: {
        target: 'usera@rexam.com',
        type: 'EMAIL',
        otpHash,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        attempts: 0,
        verified: false,
        purpose: 'REGISTRATION'
      }
    });

    // Verify OTP API
    const verifyRes = await fetch(`${API_URL}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: 'usera@rexam.com', otpCode: '123456', purpose: 'REGISTRATION' })
    });
    const verifyData = await verifyRes.json() as any;

    if (verifyRes.status !== 200) {
      throw new Error(`Verify OTP failed: ${JSON.stringify(verifyData)}`);
    }

    // Now complete registration
    const regRes = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'usera@rexam.com',
        password: 'password123',
        name: 'User A',
        phone: '9876543210',
        verificationType: 'EMAIL'
      })
    });

    const regData = await regRes.json() as any;
    if (regRes.status !== 201 || !regData.accessToken) {
      throw new Error(`Registration failed for User A: ${JSON.stringify(regData)}`);
    }
  });

  await test('Secure OTP Test - Incorrect OTP Attempt Counter & Lockout', async () => {
    // Create OTP record for invalid test
    const otpHash = await bcrypt.hash('888888', 10);
    await prisma.otpVerification.deleteMany({ where: { target: 'lockout-test@rexam.com' } });
    await prisma.otpVerification.create({
      data: {
        target: 'lockout-test@rexam.com',
        type: 'EMAIL',
        otpHash,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        attempts: 0,
        verified: false,
        purpose: 'REGISTRATION'
      }
    });

    // Submit wrong OTP
    const wrongRes = await fetch(`${API_URL}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: 'lockout-test@rexam.com', otpCode: '000000', purpose: 'REGISTRATION' })
    });

    if (wrongRes.status !== 400) {
      throw new Error('Expected 400 Bad Request for incorrect OTP');
    }

    // Check attempts count in DB
    const record = await prisma.otpVerification.findFirst({ where: { target: 'lockout-test@rexam.com' } });
    if (!record || record.attempts !== 1) {
      throw new Error(`Expected attempts = 1, got ${record?.attempts}`);
    }

    // Clean up lockout test record
    await prisma.otpVerification.deleteMany({ where: { target: 'lockout-test@rexam.com' } });
  });

  // --- USER A vs USER B DATA ISOLATION TESTS ---

  let tokenA = '';
  let tokenB = '';

  await test('User Isolation Test - Login User A', async () => {
    const resEmail = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'usera@rexam.com', password: 'password123' })
    });
    const dataEmail = await resEmail.json() as any;
    if (!dataEmail.accessToken) throw new Error('Email login failed for User A');
    tokenA = dataEmail.accessToken;
  });

  await test('User Isolation Test - Register User B with Verified OTP', async () => {
    const testOtp = '654321';
    const otpHash = await bcrypt.hash(testOtp, 10);

    await prisma.otpVerification.deleteMany({ where: { target: 'userb@rexam.com' } });
    await prisma.otpVerification.create({
      data: {
        target: 'userb@rexam.com',
        type: 'EMAIL',
        otpHash,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        attempts: 0,
        verified: false,
        purpose: 'REGISTRATION'
      }
    });

    await fetch(`${API_URL}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: 'userb@rexam.com', otpCode: '654321', purpose: 'REGISTRATION' })
    });

    const regRes = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'userb@rexam.com',
        password: 'password123',
        name: 'User B',
        phone: '9123456789',
        verificationType: 'EMAIL'
      })
    });
    const regData = await regRes.json() as any;
    if (!regData.accessToken) throw new Error('Login failed for User B');
    tokenB = regData.accessToken;
  });

  await test('User Isolation Test - User A Completes 3 Exams', async () => {
    const examsToComplete = [
      { examTitle: 'Quant Speed Test', score: 40, totalMarks: 50, correct: 20, incorrect: 5, timeSpent: 300 },
      { examTitle: 'Reasoning Challenge', score: 30, totalMarks: 40, correct: 15, incorrect: 5, timeSpent: 240 },
      { examTitle: 'Verbal Ability Test', score: 20, totalMarks: 30, correct: 10, incorrect: 5, timeSpent: 180 }
    ];

    for (const ex of examsToComplete) {
      const res = await fetch(`${API_URL}/api/student/results`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenA}`
        },
        body: JSON.stringify(ex)
      });
      if (res.status !== 201) {
        const errData = await res.json();
        throw new Error(`Failed to save test result for User A: ${JSON.stringify(errData)}`);
      }
    }
  });

  await test('User Isolation Test - Verify User B Sees 0 Exams & Clean Empty State', async () => {
    const res = await fetch(`${API_URL}/api/student/dashboard`, {
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    const data = await res.json() as any;

    if (res.status !== 200) throw new Error(`Dashboard fetch failed for User B`);
    if (data.stats.totalExams !== 0) throw new Error(`Expected User B totalExams to be 0, got ${data.stats.totalExams}`);
    if (data.hasAttemptedExams !== false) throw new Error(`Expected hasAttemptedExams to be false for User B`);
  });

  await test('Clean Up User A & User B Test Data', async () => {
    await prisma.otpVerification.deleteMany({
      where: { target: { in: ['usera@rexam.com', 'userb@rexam.com'] } }
    });
    await prisma.activityLog.deleteMany({
      where: { user: { email: { in: ['usera@rexam.com', 'userb@rexam.com'] } } }
    });
    await prisma.result.deleteMany({
      where: { user: { email: { in: ['usera@rexam.com', 'userb@rexam.com'] } } }
    });
    await prisma.exam.deleteMany({
      where: { createdBy: { email: { in: ['usera@rexam.com', 'userb@rexam.com'] } } }
    });
    await prisma.user.deleteMany({
      where: { email: { in: ['usera@rexam.com', 'userb@rexam.com'] } }
    });
  });

  console.log('--------------------------------------------------');
  console.log(`📊 Test Execution Summary: ${testsPassed}/${totalTests} Tests Passed`);
  console.log('--------------------------------------------------');

  if (testsPassed === totalTests) {
    console.log('🎉 ALL TESTS PASSED SUCCESSFULLY!');
    process.exit(0);
  } else {
    console.error('❌ SOME TESTS FAILED.');
    process.exit(1);
  }
}

runTests()
  .catch((err) => {
    console.error('Fatal Test Error:', err);
    process.exit(1);
  })
  .finally(async () => {
    if (server) server.close();
    await prisma.$disconnect();
  });
