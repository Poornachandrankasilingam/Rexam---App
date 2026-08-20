import { PrismaClient } from '@prisma/client';
import app from './app.js';
import { Server } from 'http';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const API_URL = 'http://localhost:5000';
let server: Server;

async function runTests() {
  console.log('🧪 Starting Project Models, Enhanced OTP Login & API End-to-End Tests...\n');
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
    const emails = [testEmail, 'usera@rexam.com', 'userb@rexam.com', 'unregistered@rexam.com'];
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

  // --- UNREGISTERED ACCOUNT OTP LOOKUP TESTS ---

  await test('Unregistered Email - Send OTP Returns 404 Account Not Found', async () => {
    const sendRes = await fetch(`${API_URL}/api/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: 'unregistered@rexam.com', type: 'EMAIL', purpose: 'LOGIN' })
    });
    const sendData = await sendRes.json() as any;

    if (sendRes.status !== 404) {
      throw new Error(`Expected 404 status for unregistered email, got ${sendRes.status}`);
    }
    if (sendData.accountExists !== false) {
      throw new Error(`Expected accountExists = false in 404 response payload`);
    }
  });

  await test('Unregistered Phone - Send OTP Returns 404 Account Not Found', async () => {
    const sendRes = await fetch(`${API_URL}/api/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: '+919999999999', type: 'PHONE', purpose: 'LOGIN' })
    });
    const sendData = await sendRes.json() as any;

    if (sendRes.status !== 404) {
      throw new Error(`Expected 404 status for unregistered phone, got ${sendRes.status}`);
    }
    if (sendData.accountExists !== false) {
      throw new Error(`Expected accountExists = false in 404 response payload`);
    }
  });

  // --- DIRECT REGISTRATION & GOOGLE SIGN-IN TESTS ---

  await test('Direct Registration - User A (No OTP Requirement)', async () => {
    await prisma.user.deleteMany({ where: { email: 'usera@rexam.com' } });

    const regRes = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'usera@rexam.com',
        password: 'password123',
        name: 'User A',
        phone: '+919876543210'
      })
    });
    const regData = await regRes.json() as any;
    if (regRes.status !== 201 || !regData.accessToken) {
      throw new Error(`Direct registration failed for User A: ${JSON.stringify(regData)}`);
    }
  });

  await test('Google Authentication - Sign Up New User (Google Sign-In)', async () => {
    await prisma.user.deleteMany({ where: { email: 'google-test@rexam.com' } });

    const googleRes = await fetch(`${API_URL}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'google-test@rexam.com',
        name: 'Google Aspirant',
        googleId: 'google-uid-12345'
      })
    });
    const googleData = await googleRes.json() as any;

    if (googleRes.status !== 200 || !googleData.accessToken) {
      throw new Error(`Google Sign-In failed: ${JSON.stringify(googleData)}`);
    }

    if (googleData.user.email !== 'google-test@rexam.com') {
      throw new Error(`Expected email google-test@rexam.com, got ${googleData.user.email}`);
    }

    await prisma.user.deleteMany({ where: { email: 'google-test@rexam.com' } });
  });

  await test('Direct Password Reset - Update Password without OTP', async () => {
    const resetRes = await fetch(`${API_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        target: 'usera@rexam.com',
        newPassword: 'newpassword123'
      })
    });
    const resetData = await resetRes.json() as any;

    if (resetRes.status !== 200) {
      throw new Error(`Password reset failed: ${JSON.stringify(resetData)}`);
    }

    // Verify login with new password
    const loginRes = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'usera@rexam.com', password: 'newpassword123' })
    });
    const loginData = await loginRes.json() as any;
    if (loginRes.status !== 200 || !loginData.accessToken) {
      throw new Error(`Login with new password failed: ${JSON.stringify(loginData)}`);
    }
  });

  // --- USER DATA ISOLATION TESTS ---

  let tokenA = '';
  let tokenB = '';

  await test('User Isolation Test - Login User A via Password', async () => {
    const resEmail = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'usera@rexam.com', password: 'newpassword123' })
    });
    const dataEmail = await resEmail.json() as any;
    if (!dataEmail.accessToken) throw new Error('Email login failed for User A');
    tokenA = dataEmail.accessToken;
  });

  await test('User Isolation Test - Register User B Directly (No OTP)', async () => {
    await prisma.user.deleteMany({ where: { email: 'userb@rexam.com' } });

    const regRes = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'userb@rexam.com',
        password: 'password123',
        name: 'User B',
        phone: '+919123456789'
      })
    });
    const regData = await regRes.json() as any;
    if (!regData.accessToken) throw new Error('Registration failed for User B');
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

  await test('Protected Route Test - Unauthenticated Student Endpoint Returns 401', async () => {
    const res = await fetch(`${API_URL}/api/student/dashboard`);
    if (res.status !== 401 && res.status !== 403) {
      throw new Error(`Expected 401/403 for unauthenticated request, got ${res.status}`);
    }
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
