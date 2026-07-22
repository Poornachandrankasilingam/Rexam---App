import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const API_URL = 'http://localhost:5000';

async function runTests() {
  console.log('🧪 Starting Project Models & API End-to-End Tests...\n');
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
    // Ensure clean state
    await prisma.user.deleteMany({
      where: { email: testEmail }
    });
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
      // Expecting P2002 (Prisma Unique constraint failed)
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

  const apiTestUser = {
    email: 'api-test-user@rexam.com',
    password: 'securepassword123',
    name: 'API Test User',
    phone: '9876543210'
  };

  await test('API - Auth Model Clean Up (HTTP Prerequisite)', async () => {
    await prisma.user.deleteMany({
      where: { email: apiTestUser.email }
    });
  });

  await test('API - User Registration (/api/auth/register)', async () => {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(apiTestUser)
    });

    const data = await res.json() as any;
    if (res.status !== 201) {
      throw new Error(`Registration failed with status ${res.status}. Error: ${data.message || JSON.stringify(data)}`);
    }
    if (data.message !== 'User registered successfully') {
      throw new Error(`Unexpected message: ${data.message}`);
    }
    if (!data.userId) {
      throw new Error('No userId returned from registration API');
    }
  });

  await test('API - Duplicate User Registration (/api/auth/register)', async () => {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(apiTestUser)
    });

    const data = await res.json() as any;
    if (res.status !== 400) {
      throw new Error(`Expected status 400, got ${res.status}`);
    }
    if (!data.message || !data.message.includes('exists')) {
      throw new Error(`Expected email duplicate error message, got: ${JSON.stringify(data)}`);
    }
  });

  let accessToken = '';

  await test('API - User Login (/api/auth/login)', async () => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: apiTestUser.email,
        password: apiTestUser.password
      })
    });

    const data = await res.json() as any;
    if (res.status !== 200) {
      throw new Error(`Login failed with status ${res.status}. Error: ${data.message || JSON.stringify(data)}`);
    }
    if (!data.accessToken) {
      throw new Error('No accessToken returned in login response');
    }
    if (data.user.email !== apiTestUser.email) {
      throw new Error(`Expected user email ${apiTestUser.email}, got ${data.user.email}`);
    }
    accessToken = data.accessToken;
  });

  await test('API - User Login Failure with Wrong Password', async () => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: apiTestUser.email,
        password: 'wrong_password'
      })
    });

    const data = await res.json() as any;
    if (res.status !== 400) {
      throw new Error(`Expected status 400, got ${res.status}`);
    }
    if (data.message !== 'Invalid credentials') {
      throw new Error(`Expected message 'Invalid credentials', got: ${data.message}`);
    }
  });

  await test('API - User Login with Uppercase & Un-trimmed Email', async () => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `  ${apiTestUser.email.toUpperCase()}  `,
        password: apiTestUser.password
      })
    });

    const data = await res.json() as any;
    if (res.status !== 200) {
      throw new Error(`Login with normalized email failed with status ${res.status}. Error: ${JSON.stringify(data)}`);
    }
    if (!data.accessToken) {
      throw new Error('No access token returned');
    }
  });

  let resetVerificationCode = '';

  await test('API - Forgot Password - Request Reset Code (/api/auth/forgot-password)', async () => {
    const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: apiTestUser.email })
    });

    const data = await res.json() as any;
    if (res.status !== 200) {
      throw new Error(`Forgot password request failed with status ${res.status}. Error: ${JSON.stringify(data)}`);
    }

    // In dev environment, the code is returned in response. If not, fetch from DB.
    if (data.code) {
      resetVerificationCode = data.code;
    } else {
      const user = await prisma.user.findUnique({ where: { email: apiTestUser.email } });
      if (!user || !user.resetCode) {
        throw new Error('Reset code was not saved in the database');
      }
      resetVerificationCode = user.resetCode;
    }

    if (!resetVerificationCode || resetVerificationCode.length !== 6) {
      throw new Error(`Invalid verification code generated: ${resetVerificationCode}`);
    }
  });

  await test('API - Forgot Password - Non-existent Email', async () => {
    const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nonexistent-forgot@rexam.com' })
    });

    const data = await res.json() as any;
    if (res.status !== 404) {
      throw new Error(`Expected status 404, got ${res.status}`);
    }
  });

  await test('API - Reset Password - Invalid Verification Code', async () => {
    const res = await fetch(`${API_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: apiTestUser.email,
        code: '000000', // Invalid code
        newPassword: 'newsecurepassword123'
      })
    });

    const data = await res.json() as any;
    if (res.status !== 400) {
      throw new Error(`Expected status 400, got ${res.status}`);
    }
    if (data.message !== 'Invalid verification code') {
      throw new Error(`Expected message 'Invalid verification code', got: ${data.message}`);
    }
  });

  await test('API - Reset Password - Successful Reset', async () => {
    const res = await fetch(`${API_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: apiTestUser.email,
        code: resetVerificationCode,
        newPassword: 'newsecurepassword123'
      })
    });

    const data = await res.json() as any;
    if (res.status !== 200) {
      throw new Error(`Reset password failed with status ${res.status}. Error: ${JSON.stringify(data)}`);
    }
    if (data.message !== 'Password has been reset successfully') {
      throw new Error(`Unexpected success message: ${data.message}`);
    }
  });

  await test('API - Login with New Password', async () => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: apiTestUser.email,
        password: 'newsecurepassword123'
      })
    });

    const data = await res.json() as any;
    if (res.status !== 200) {
      throw new Error(`Login with new password failed with status ${res.status}. Error: ${JSON.stringify(data)}`);
    }
    if (!data.accessToken) {
      throw new Error('Login response does not contain access token');
    }
  });

  await test('API - Clean Up User Data', async () => {
    await prisma.user.deleteMany({
      where: { email: apiTestUser.email }
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
    await prisma.$disconnect();
  });
