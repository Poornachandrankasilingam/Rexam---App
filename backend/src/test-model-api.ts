import { PrismaClient } from '@prisma/client';
import app from './app.js';
import { Server } from 'http';

const prisma = new PrismaClient();
const API_URL = 'http://localhost:5000';
let server: Server;

async function runTests() {
  console.log('🧪 Starting Project Models & API End-to-End Tests...\n');
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

  await test('User Model Cleanup (Prerequisite)', async () => {
    const emails = [testEmail, 'usera@rexam.com', 'userb@rexam.com', 'api-test-user@rexam.com'];
    await prisma.activityLog.deleteMany({ where: { user: { email: { in: emails } } } });
    await prisma.result.deleteMany({ where: { user: { email: { in: emails } } } });
    await prisma.exam.deleteMany({ where: { createdBy: { email: { in: emails } } } });
    await prisma.user.deleteMany({ where: { email: { in: emails } } });
  });

  let createdUserId = '';

  await test('User Model - Create User in Database', async () => {
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        password: 'hashed_password_123',
        name: 'Test Prisma User',
        role: 'STUDENT',
        phone: '1234567890'
      }
    });

    if (!user.id) throw new Error('User was created but no ID was returned');
    if (user.email !== testEmail) throw new Error(`Expected email ${testEmail}, got ${user.email}`);
    createdUserId = user.id;
  });

  await test('User Model - Query User from Database', async () => {
    const user = await prisma.user.findUnique({
      where: { id: createdUserId }
    });

    if (!user) throw new Error(`Could not find user with ID ${createdUserId}`);
    if (user.name !== 'Test Prisma User') throw new Error(`Expected name 'Test Prisma User', got ${user.name}`);
  });

  await test('User Model - Unique Constraints (Duplicate Email)', async () => {
    try {
      await prisma.user.create({
        data: {
          email: testEmail,
          password: 'another_password',
          name: 'Duplicate User'
        }
      });
      throw new Error('Should have thrown unique constraint error for duplicate email');
    } catch (err: any) {
      if (err.message && err.message.includes('Unique constraint failed')) {
        // Success
      } else if (err.code === 'P2002') {
        // Success
      } else {
        throw err;
      }
    }
  });

  await test('User Model - Delete User from Database', async () => {
    const deleted = await prisma.user.delete({
      where: { id: createdUserId }
    });
    if (!deleted) throw new Error('Delete operation failed');

    const user = await prisma.user.findUnique({
      where: { id: createdUserId }
    });
    if (user) throw new Error('User still exists after deletion');
  });

  // --- HTTP API ENDPOINT TESTS ---

  await test('API - Health Check Endpoint (/health)', async () => {
    const res = await fetch(`${API_URL}/health`);
    if (!res.ok) throw new Error(`Health check returned status ${res.status}`);
    const data = await res.json() as any;
    if (data.status !== 'ok') throw new Error(`Expected status 'ok', got: ${data.status}`);
  });

  // --- USER A vs USER B DATA ISOLATION & DYNAMIC STATS TESTS ---

  let tokenA = '';
  let tokenB = '';

  await test('User Isolation Test - Register & Login User A', async () => {
    await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'usera@rexam.com', password: 'password123', name: 'User A', phone: '9876543210' })
    });

    // Test Login via Email
    const resEmail = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'usera@rexam.com', password: 'password123' })
    });
    const dataEmail = await resEmail.json() as any;
    if (!dataEmail.accessToken) throw new Error('Email login failed for User A');

    // Test Login via Mobile Phone Number
    const resPhone = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: '9876543210', password: 'password123' })
    });
    const dataPhone = await resPhone.json() as any;
    if (!dataPhone.accessToken) throw new Error('Mobile Phone login failed for User A');

    tokenA = dataEmail.accessToken;
  });

  await test('OTP Login Test - Generate & Verify OTP for User A', async () => {
    // 1. Generate OTP for User A using Mobile Phone Number
    const sendRes = await fetch(`${API_URL}/api/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: '9876543210' })
    });
    const sendData = await sendRes.json() as any;
    if (sendRes.status !== 200 || !sendData.otpCode) {
      throw new Error(`Send OTP failed: ${JSON.stringify(sendData)}`);
    }

    // 2. Verify OTP & Log In
    const verifyRes = await fetch(`${API_URL}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: '9876543210', otpCode: sendData.otpCode })
    });
    const verifyData = await verifyRes.json() as any;
    if (verifyRes.status !== 200 || !verifyData.accessToken) {
      throw new Error(`Verify OTP failed: ${JSON.stringify(verifyData)}`);
    }
  });

  await test('User Isolation Test - Register & Login User B', async () => {
    await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'userb@rexam.com', password: 'password123', name: 'User B', phone: '9123456789' })
    });

    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'userb@rexam.com', password: 'password123' })
    });
    const data = await res.json() as any;
    if (!data.accessToken) throw new Error('Login failed for User B');
    tokenB = data.accessToken;
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

  await test('User Isolation Test - Verify User A Sees 3 Exams & Calculated Stats', async () => {
    const res = await fetch(`${API_URL}/api/student/dashboard`, {
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    const data = await res.json() as any;

    if (res.status !== 200) throw new Error(`Dashboard fetch failed for User A`);
    if (data.stats.totalExams !== 3) throw new Error(`Expected User A totalExams to be 3, got ${data.stats.totalExams}`);
    if (data.hasAttemptedExams !== true) throw new Error(`Expected hasAttemptedExams to be true for User A`);
    if (data.recentResults.length !== 3) throw new Error(`Expected User A to have 3 recent results, got ${data.recentResults.length}`);
    if (data.stats.accuracy <= 0) throw new Error(`Expected User A accuracy > 0, got ${data.stats.accuracy}`);
  });

  await test('User Isolation Test - Verify User B Sees 0 Exams & Clean Empty State', async () => {
    const res = await fetch(`${API_URL}/api/student/dashboard`, {
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    const data = await res.json() as any;

    if (res.status !== 200) throw new Error(`Dashboard fetch failed for User B`);
    if (data.stats.totalExams !== 0) throw new Error(`Expected User B totalExams to be 0, got ${data.stats.totalExams}`);
    if (data.stats.accuracy !== 0) throw new Error(`Expected User B accuracy to be 0%, got ${data.stats.accuracy}%`);
    if (data.stats.avgScore !== 0) throw new Error(`Expected User B avgScore to be 0, got ${data.stats.avgScore}`);
    if (data.stats.totalCorrect !== 0) throw new Error(`Expected User B totalCorrect to be 0, got ${data.stats.totalCorrect}`);
    if (data.stats.totalWrong !== 0) throw new Error(`Expected User B totalWrong to be 0, got ${data.stats.totalWrong}`);
    if (data.hasAttemptedExams !== false) throw new Error(`Expected hasAttemptedExams to be false for User B`);
    if (data.message !== "No exams attempted yet.") throw new Error(`Expected message 'No exams attempted yet.', got: '${data.message}'`);
    if (data.recentResults.length !== 0) throw new Error(`Expected User B to have 0 recent results, got ${data.recentResults.length}`);
  });

  await test('User Isolation Test - Verify User B Cannot Access User A Data', async () => {
    const resB = await fetch(`${API_URL}/api/student/results`, {
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    const dataB = await resB.json() as any;

    if (dataB.results.length !== 0) {
      throw new Error(`Data leakage! User B sees ${dataB.results.length} results which belong to User A!`);
    }
  });

  await test('Clean Up User A & User B Test Data', async () => {
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
