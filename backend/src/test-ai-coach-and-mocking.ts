import { prisma } from './config/prisma.js';
import jwt from 'jsonwebtoken';

const API_URL = 'http://localhost:5000';
const jwtSecret = process.env.JWT_SECRET || 'rexam_super_secret_jwt_key_2026';

async function testFullAiCoachAndMocking() {
  console.log('🧪 VERIFYING AI COACH & MOCKING LIVE INTEGRATION...\n');

  // Find or create test student in database
  let student = await prisma.user.findUnique({ where: { email: 'student@rexam.com' } });
  if (!student) {
    student = await prisma.user.create({
      data: {
        email: 'student@rexam.com',
        name: 'Demo Student',
        password: 'password123',
        role: 'STUDENT'
      }
    });
  }

  const token = jwt.sign({ id: student.id, role: student.role }, jwtSecret, { expiresIn: '1h' });
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // Test 1: AI Coach Status Endpoint
  console.log('1️⃣ Testing GET /api/student/ai-coach/status...');
  const statusRes = await fetch(`${API_URL}/api/student/ai-coach/status`, { headers });
  const statusData: any = await statusRes.json();
  console.log('   Status Code:', statusRes.status);
  console.log('   Engine Info:', JSON.stringify(statusData));
  if (statusRes.status !== 200 || !statusData.connected) {
    throw new Error('AI Coach Status Check Failed');
  }
  console.log('   ✅ AI Coach Status: CONNECTED & ONLINE\n');

  // Test 2: AI Coach Doubt Solving / Tutoring
  console.log('2️⃣ Testing POST /api/student/ai-chat/message (Ask Concept/Doubt)...');
  const chatStart = Date.now();
  const chatRes = await fetch(`${API_URL}/api/student/ai-chat/message`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      message: 'Explain how to solve Time and Work efficiency questions in 30 seconds.',
      targetExam: 'SSC CGL Tier 1',
      chatHistory: []
    })
  });
  const chatData: any = await chatRes.json();
  console.log(`   Response (${Date.now() - chatStart}ms):`);
  console.log(`   Reply Preview: "${chatData.reply?.slice(0, 150)}..."`);
  if (chatRes.status !== 200 || !chatData.reply || chatData.reply.length < 30) {
    throw new Error('AI Chat Tutoring Failed');
  }
  console.log('   ✅ AI Coach Tutoring: SUCCESS\n');

  // Test 3: Live Real-Time Oral Mock Exam / Viva Drill (Start Turn)
  console.log('3️⃣ Testing POST /api/student/ai-chat/mock-turn (Start Question 1)...');
  const mockStartRes = await fetch(`${API_URL}/api/student/ai-chat/mock-turn`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      targetExam: 'SSC CGL',
      subject: 'Quantitative Aptitude',
      difficulty: 'MEDIUM',
      totalQuestions: 3,
      currentQuestionIndex: 0
    })
  });
  const mockStartData: any = await mockStartRes.json();
  console.log('   Question 1 Generated:', mockStartData.nextQuestion);
  if (mockStartRes.status !== 200 || !mockStartData.nextQuestion) {
    throw new Error('Mock Drill Start Question Failed');
  }
  console.log('   ✅ Mock Drill Question 1: SUCCESS\n');

  // Test 4: Submit Student Answer to Mock Question & Evaluate
  console.log('4️⃣ Testing POST /api/student/ai-chat/mock-turn (Submit Answer & Evaluate)...');
  const evalStart = Date.now();
  const mockEvalRes = await fetch(`${API_URL}/api/student/ai-chat/mock-turn`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      targetExam: 'SSC CGL',
      subject: 'Quantitative Aptitude',
      difficulty: 'MEDIUM',
      totalQuestions: 3,
      currentQuestionIndex: 1,
      previousQuestion: mockStartData.nextQuestion,
      studentAnswer: 'The work done per day is inversely proportional to the total time taken.'
    })
  });
  const mockEvalData: any = await mockEvalRes.json();
  console.log(`   Evaluation (${Date.now() - evalStart}ms):`);
  console.log(`   - Score Awarded: ${mockEvalData.scoreAwarded}/10`);
  console.log(`   - Feedback: ${mockEvalData.feedback}`);
  console.log(`   - Model Answer: ${mockEvalData.correctAnswer}`);
  console.log(`   - Next Question: ${mockEvalData.nextQuestion}`);
  if (mockEvalRes.status !== 200 || typeof mockEvalData.scoreAwarded !== 'number') {
    throw new Error('Mock Answer Evaluation Failed');
  }
  console.log('   ✅ Mock Answer Evaluation: SUCCESS\n');

  // Test 5: Final Turn Mock Summary
  console.log('5️⃣ Testing POST /api/student/ai-chat/mock-turn (Final Turn & Overall Verdict)...');
  const finalTurnRes = await fetch(`${API_URL}/api/student/ai-chat/mock-turn`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      targetExam: 'SSC CGL',
      subject: 'Quantitative Aptitude',
      difficulty: 'MEDIUM',
      totalQuestions: 3,
      currentQuestionIndex: 3,
      previousQuestion: mockEvalData.nextQuestion || 'What is ratio of work?',
      studentAnswer: 'Efficiency ratio is equal to the inverse of time taken ratio.'
    })
  });
  const finalTurnData: any = await finalTurnRes.json();
  console.log('   Final Summary:', finalTurnData.finalSummary);
  console.log('   Is Complete:', finalTurnData.isComplete);
  if (finalTurnRes.status !== 200 || !finalTurnData.isComplete) {
    throw new Error('Mock Final Verdict Failed');
  }
  console.log('   ✅ Mock Final Summary: SUCCESS\n');

  console.log('====================================================');
  console.log('🎉 ALL AI COACH & MOCKING DRILL CHECKS PASSED (100%)');
  console.log('====================================================\n');
}

testFullAiCoachAndMocking().catch((e) => {
  console.error('❌ AI Coach Verification Error:', e);
  process.exit(1);
});
