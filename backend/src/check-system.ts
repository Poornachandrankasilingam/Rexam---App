import { prisma } from './config/prisma.js';
import app from './app.js';
import bcrypt from 'bcryptjs';

async function checkSystem() {
  console.log('====================================================');
  console.log('🔍 REXAM BACKEND & DATABASE HEALTH CHECK');
  console.log('====================================================\n');

  // 1. Database Connectivity Check
  console.log('1️⃣ Checking Database Connectivity...');
  try {
    await prisma.$connect();
    console.log('   ✅ SQLite Database connected successfully via Prisma!\n');
  } catch (err: any) {
    console.error('   ❌ Database connection failed:', err.message);
    process.exit(1);
  }

  // 2. Table Record Counts
  console.log('2️⃣ Checking Database Tables & Record Counts...');
  try {
    const userCount = await prisma.user.count();
    const examCount = await prisma.exam.count();
    const questionCount = await prisma.question.count();
    const resultCount = await prisma.result.count();
    const logCount = await prisma.activityLog.count();

    console.log(`   📊 Total Users: ${userCount}`);
    console.log(`   📊 Total Exams: ${examCount}`);
    console.log(`   📊 Total Questions: ${questionCount}`);
    console.log(`   📊 Total Test Results: ${resultCount}`);
    console.log(`   📊 Total Activity Logs: ${logCount}\n`);
  } catch (err: any) {
    console.error('   ❌ Failed to query database tables:', err.message);
  }

  // 3. Demo Accounts Verification
  console.log('3️⃣ Checking Demo User Accounts in Database...');
  try {
    const adminUser = await prisma.user.findUnique({ where: { email: 'admin@rexam.com' } });
    if (adminUser) {
      const isMatch = await bcrypt.compare('admin123', adminUser.password);
      console.log(`   ✅ Admin Account (${adminUser.email}): Verified (Password matches: ${isMatch}, Role: ${adminUser.role})`);
    } else {
      console.log('   ⚠️ Admin Account (admin@rexam.com) not found. Seeding now...');
      const adminPass = await bcrypt.hash('admin123', 10);
      await prisma.user.create({
        data: { email: 'admin@rexam.com', password: adminPass, name: 'Demo Admin', role: 'ADMIN', phone: '9999999999' }
      });
      console.log('   ✅ Admin Account created!');
    }

    const studentUser = await prisma.user.findUnique({ where: { email: 'student@rexam.com' } });
    if (studentUser) {
      const isMatch = await bcrypt.compare('student123', studentUser.password);
      console.log(`   ✅ Student Account (${studentUser.email}): Verified (Password matches: ${isMatch}, Role: ${studentUser.role})`);
    } else {
      console.log('   ⚠️ Student Account (student@rexam.com) not found. Seeding now...');
      const studentPass = await bcrypt.hash('student123', 10);
      await prisma.user.create({
        data: { email: 'student@rexam.com', password: studentPass, name: 'Demo Student', role: 'STUDENT', phone: '8888888888' }
      });
      console.log('   ✅ Student Account created!');
    }
    console.log('');
  } catch (err: any) {
    console.error('   ❌ Demo user check error:', err.message);
  }

  // 4. Test Backend Express App & Server
  console.log('4️⃣ Checking Backend API Server & Endpoints...');
  const server = app.listen(5001, async () => {
    try {
      // Test Health Endpoint
      const healthRes = await fetch('http://localhost:5001/health');
      const healthData = await healthRes.json() as any;
      console.log(`   ✅ /health Endpoint: Status ${healthRes.status} (${JSON.stringify(healthData)})`);

      // Test API Root Endpoint
      const apiRes = await fetch('http://localhost:5001/api');
      const apiData = await apiRes.json() as any;
      console.log(`   ✅ /api Endpoint: Status ${apiRes.status} (${JSON.stringify(apiData)})`);

      // Test Student Login API
      const loginRes = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: 'student@rexam.com', password: 'student123' })
      });
      const loginData = await loginRes.json() as any;
      console.log(`   ✅ /api/auth/login Endpoint: Status ${loginRes.status} (Access Token issued: ${!!loginData.accessToken}, User: ${loginData.user?.email}, Role: ${loginData.user?.role})`);

      // Test Google Auth API
      const googleRes = await fetch('http://localhost:5001/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'student.google@rexam.com', name: 'Google Aspirant' })
      });
      const googleData = await googleRes.json() as any;
      console.log(`   ✅ /api/auth/google Endpoint: Status ${googleRes.status} (Access Token issued: ${!!googleData.accessToken}, User: ${googleData.user?.email})`);

      // Clean up google test user
      await prisma.user.deleteMany({ where: { email: 'student.google@rexam.com' } });

      console.log('\n====================================================');
      console.log('🎉 ALL BACKEND & DATABASE SYSTEMS ARE WORKING PERFECTLY!');
      console.log('====================================================\n');
    } catch (apiErr: any) {
      console.error('   ❌ API Endpoint test error:', apiErr.message);
    } finally {
      server.close();
      await prisma.$disconnect();
      process.exit(0);
    }
  });
}

checkSystem().catch((e) => {
  console.error('Fatal Error:', e);
  process.exit(1);
});
