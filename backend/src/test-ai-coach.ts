import { prisma } from './config/prisma.js';
import app from './app.js';
import { Server } from 'http';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const API_URL = 'http://localhost:5000';
let server: Server | null = null;

async function runTests() {
  console.log('🧪 Starting Rexam AI Performance Coach Automated Test Suite...\n');
  try {
    server = app.listen(5000);
    server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        server = null;
      }
    });
  } catch (e) {
    server = null;
  }

  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>) {
    process.stdout.write(`⏳ Testing: ${name}... `);
    try {
      await fn();
      console.log('✅ PASSED');
      passed++;
    } catch (err: any) {
      console.log(`❌ FAILED: ${err.message}`);
      failed++;
    }
  }

  try {
    // 1. Prerequisites / Cleanup
    await test('Prerequisites & Clean Test Users Setup', async () => {
      const emails = ['aicoach.studentA@rexam.com', 'aicoach.studentB@rexam.com'];
      const users = await prisma.user.findMany({ where: { email: { in: emails } } });
      const userIds = users.map(u => u.id);

      await prisma.aiPerformanceReport.deleteMany({ where: { userId: { in: userIds } } });
      await prisma.result.deleteMany({ where: { userId: { in: userIds } } });
      await prisma.examAttempt.deleteMany({ where: { userId: { in: userIds } } });
      await prisma.activityLog.deleteMany({ where: { userId: { in: userIds } } });

      const exams = await prisma.exam.findMany({ where: { createdById: { in: userIds } } });
      const examIds = exams.map(e => e.id);
      await prisma.option.deleteMany({ where: { question: { examId: { in: examIds } } } });
      await prisma.question.deleteMany({ where: { examId: { in: examIds } } });
      await prisma.exam.deleteMany({ where: { id: { in: examIds } } });
      await prisma.user.deleteMany({ where: { id: { in: userIds } } });

      const passwordHash = await bcrypt.hash('pass1234', 10);

      const userA = await prisma.user.create({
        data: {
          email: 'aicoach.studentA@rexam.com',
          name: 'Coach Student A',
          password: passwordHash,
          role: 'STUDENT',
          emailVerified: true
        }
      });

      const userB = await prisma.user.create({
        data: {
          email: 'aicoach.studentB@rexam.com',
          name: 'Coach Student B',
          password: passwordHash,
          role: 'STUDENT',
          emailVerified: true
        }
      });

      if (!userA.id || !userB.id) throw new Error('Failed to create test users');
    });

    const userA = (await prisma.user.findUnique({ where: { email: 'aicoach.studentA@rexam.com' } }))!;
    const userB = (await prisma.user.findUnique({ where: { email: 'aicoach.studentB@rexam.com' } }))!;

    const jwtSecret = process.env.JWT_SECRET || 'rexam_super_secret_jwt_key_2026';
    const tokenA = jwt.sign({ id: userA.id, role: userA.role }, jwtSecret, { expiresIn: '7d' });
    const tokenB = jwt.sign({ id: userB.id, role: userB.role }, jwtSecret, { expiresIn: '7d' });

    // 2. Create Multi-Subject Exam for AI Testing
    let testExamId = '';
    let questionIds: { id: string; correctOptId: string; wrongOptId: string; subject: string; topic: string }[] = [];

    await test('Create Realistic Multi-Subject CBT Exam in Database', async () => {
      const exam = await prisma.exam.create({
        data: {
          title: 'SSC CGL Full Tier-1 Mock Assessment',
          description: 'Comprehensive 4-subject diagnostic test for Quantitative Aptitude, Reasoning, English, and General Awareness.',
          code: `AI-MOCK-${Date.now()}`,
          duration: 60,
          totalMarks: 20,
          passingMarks: 10,
          createdById: userA.id
        }
      });
      testExamId = exam.id;

      // Create 10 diagnostic questions across 4 subjects
      const testQuestions = [
        // Quant
        {
          text: 'If the cost price of an article is ₹400 and it is sold at a 25% profit, find the selling price.',
          subject: 'Quantitative Aptitude',
          topic: 'Profit & Loss',
          explanation: 'SP = CP * (1 + Profit%) = 400 * 1.25 = ₹500.',
          opts: [{ text: '₹500', isCorrect: true }, { text: '₹450', isCorrect: false }, { text: '₹480', isCorrect: false }, { text: '₹520', isCorrect: false }]
        },
        {
          text: 'A train 120m long passes a pole in 8 seconds. Find the speed of the train in km/h.',
          subject: 'Quantitative Aptitude',
          topic: 'Speed, Time & Distance',
          explanation: 'Speed = 120/8 = 15 m/s = 15 * (18/5) = 54 km/h.',
          opts: [{ text: '54 km/h', isCorrect: true }, { text: '48 km/h', isCorrect: false }, { text: '60 km/h', isCorrect: false }, { text: '50 km/h', isCorrect: false }]
        },
        {
          text: 'If A can do a work in 10 days and B in 15 days, in how many days can they complete it together?',
          subject: 'Quantitative Aptitude',
          topic: 'Time & Work',
          explanation: '1/A + 1/B = 1/10 + 1/15 = 5/30 = 1/6 => 6 days.',
          opts: [{ text: '6 days', isCorrect: true }, { text: '8 days', isCorrect: false }, { text: '5 days', isCorrect: false }, { text: '7 days', isCorrect: false }]
        },
        // Reasoning
        {
          text: 'Pointing to a gentleman, Deepak said, "His only brother is the father of my daughter\'s father." How is the gentleman related to Deepak?',
          subject: 'Logical Reasoning',
          topic: 'Blood Relations',
          explanation: 'Daughter\'s father = Deepak. Father of Deepak = Deepak\'s father. Brother of Deepak\'s father = Deepak\'s Uncle.',
          opts: [{ text: 'Uncle', isCorrect: true }, { text: 'Father', isCorrect: false }, { text: 'Grandfather', isCorrect: false }, { text: 'Brother', isCorrect: false }]
        },
        {
          text: 'If CAT is coded as 3120, how will DOG be coded?',
          subject: 'Logical Reasoning',
          topic: 'Coding-Decoding',
          explanation: 'D=4, O=15, G=7 => 4157.',
          opts: [{ text: '4157', isCorrect: true }, { text: '4147', isCorrect: false }, { text: '4167', isCorrect: false }, { text: '3157', isCorrect: false }]
        },
        {
          text: 'Find the next number in series: 3, 7, 15, 31, 63, ?',
          subject: 'Logical Reasoning',
          topic: 'Number & Letter Series',
          explanation: 'Pattern: *2 + 1. 63 * 2 + 1 = 127.',
          opts: [{ text: '127', isCorrect: true }, { text: '126', isCorrect: false }, { text: '128', isCorrect: false }, { text: '130', isCorrect: false }]
        },
        // English
        {
          text: 'Select the synonym for "BENEVOLENT":',
          subject: 'English Language',
          topic: 'Vocabulary',
          explanation: 'Benevolent means kind, generous, or well-meaning (Kind-hearted).',
          opts: [{ text: 'Kind-hearted', isCorrect: true }, { text: 'Hostile', isCorrect: false }, { text: 'Cruel', isCorrect: false }, { text: 'Selfish', isCorrect: false }]
        },
        {
          text: 'Spot the grammatical error: "Neither of the boys were present at the meeting."',
          subject: 'English Language',
          topic: 'English Grammar & Spotting Errors',
          explanation: '"Neither of" takes a singular verb: "was present" instead of "were present".',
          opts: [{ text: 'were present (should be was present)', isCorrect: true }, { text: 'Neither of', isCorrect: false }, { text: 'at the meeting', isCorrect: false }, { text: 'No error', isCorrect: false }]
        },
        // General Awareness
        {
          text: 'Which Article of the Indian Constitution deals with the Fundamental Right to Equality before Law?',
          subject: 'General Awareness',
          topic: 'Indian Polity & Governance',
          explanation: 'Article 14 guarantees equality before the law and equal protection of laws.',
          opts: [{ text: 'Article 14', isCorrect: true }, { text: 'Article 19', isCorrect: false }, { text: 'Article 21', isCorrect: false }, { text: 'Article 32', isCorrect: false }]
        },
        {
          text: 'Who was the founder of the Maurya Empire in ancient India?',
          subject: 'General Awareness',
          topic: 'Indian History',
          explanation: 'Chandragupta Maurya founded the Maurya Empire with the help of Chanakya.',
          opts: [{ text: 'Chandragupta Maurya', isCorrect: true }, { text: 'Ashoka', isCorrect: false }, { text: 'Bindusara', isCorrect: false }, { text: 'Samudragupta', isCorrect: false }]
        }
      ];

      for (const q of testQuestions) {
        const createdQ = await prisma.question.create({
          data: {
            examId: exam.id,
            text: q.text,
            subject: q.subject,
            topic: q.topic,
            marks: 2,
            negativeMarks: 0.5,
            explanation: q.explanation,
            options: {
              create: q.opts
            }
          },
          include: { options: true }
        });

        const correctOpt = createdQ.options.find(o => o.isCorrect)!;
        const wrongOpt = createdQ.options.find(o => !o.isCorrect)!;
        questionIds.push({
          id: createdQ.id,
          correctOptId: correctOpt.id,
          wrongOptId: wrongOpt.id,
          subject: q.subject,
          topic: q.topic
        });
      }

      if (questionIds.length !== 10) throw new Error('Expected 10 questions created');
    });

    // 3. User A submits exam attempt with controlled answers (6 correct, 3 wrong, 1 unanswered)
    let submittedResultId = '';

    await test('User A Submits Exam Attempt & Triggers AI Performance Analysis', async () => {
      const answers: Record<string, string> = {
        [questionIds[0].id]: questionIds[0].correctOptId,
        [questionIds[1].id]: questionIds[1].wrongOptId,
        [questionIds[2].id]: questionIds[2].wrongOptId,
        [questionIds[3].id]: questionIds[3].correctOptId,
        [questionIds[4].id]: questionIds[4].correctOptId,
        [questionIds[5].id]: questionIds[5].correctOptId,
        [questionIds[6].id]: questionIds[6].correctOptId,
        [questionIds[7].id]: questionIds[7].correctOptId,
        [questionIds[8].id]: questionIds[8].wrongOptId
      };

      const submitRes = await fetch(`${API_URL}/api/student/exams/${testExamId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenA}`
        },
        body: JSON.stringify({
          answers,
          timeSpentSec: 1800 // 30 mins
        })
      });

      const submitData = await submitRes.json() as any;

      if (submitRes.status !== 201 || !submitData.resultId) {
        throw new Error(`Exam submission failed: ${JSON.stringify(submitData)}`);
      }

      submittedResultId = submitData.resultId;
      if (submitData.correct !== 6 || submitData.incorrect !== 3 || submitData.unanswered !== 1) {
        throw new Error(`Expected 6 correct, 3 wrong, 1 unanswered. Got: ${JSON.stringify(submitData)}`);
      }
    });

    // 4. Verify AI Coach Report Generation
    await test('GET /api/student/ai-coach/latest Returns Valid Real Performance Report', async () => {
      const reportRes = await fetch(`${API_URL}/api/student/ai-coach/latest`, {
        headers: { 'Authorization': `Bearer ${tokenA}` }
      });

      const reportData = await reportRes.json() as any;

      if (reportRes.status !== 200 || !reportData.hasAttemptedExams || !reportData.report) {
        throw new Error(`AI Coach Report fetch failed: ${JSON.stringify(reportData)}`);
      }

      const r = reportData.report;

      // Check Metrics
      if (r.correctCount !== 6 || r.wrongCount !== 3 || r.unansweredCount !== 1) {
        throw new Error(`Metric mismatch: ${JSON.stringify(r)}`);
      }

      // Check Accuracy (6 / 9 attempted = 66.67% ~ 67%)
      if (r.accuracy < 60 || r.accuracy > 70) {
        throw new Error(`Unexpected accuracy rate: ${r.accuracy}`);
      }

      // Check AI Readiness Score exists (0-100)
      if (typeof r.readinessScore !== 'number' || r.readinessScore < 10 || r.readinessScore > 100) {
        throw new Error(`Invalid readiness score: ${r.readinessScore}`);
      }

      // Check Subject Breakdown (4 subjects)
      if (!Array.isArray(r.subjectAnalysis) || r.subjectAnalysis.length < 3) {
        throw new Error(`Subject analysis missing or incomplete: ${JSON.stringify(r.subjectAnalysis)}`);
      }

      const reasoningSubj = r.subjectAnalysis.find((s: any) => s.subject.includes('Reasoning'));
      if (!reasoningSubj || reasoningSubj.accuracy !== 100) {
        throw new Error(`Expected Reasoning to have 100% accuracy, got: ${JSON.stringify(reasoningSubj)}`);
      }

      // Check Topic Breakdown & Weak Areas
      if (!Array.isArray(r.topicAnalysis) || r.topicAnalysis.length === 0) {
        throw new Error('Topic analysis is empty');
      }

      if (!Array.isArray(r.weaknesses) || r.weaknesses.length === 0) {
        throw new Error('Weaknesses list is empty');
      }

      // Check Mistake Diagnostics
      if (!Array.isArray(r.mistakeAnalysis) || r.mistakeAnalysis.length !== 3) {
        throw new Error(`Expected 3 mistake analyses, got ${r.mistakeAnalysis?.length}`);
      }

      const firstMistake = r.mistakeAnalysis[0];
      if (!firstMistake.reason || !firstMistake.explanation || !firstMistake.tips) {
        throw new Error(`Mistake diagnostic incomplete: ${JSON.stringify(firstMistake)}`);
      }

      // Check 7-Day Study Plan
      if (!Array.isArray(r.studyPlan) || r.studyPlan.length !== 7) {
        throw new Error(`Expected 7-day study plan, got ${r.studyPlan?.length}`);
      }
    });

    // 5. Test "Ask AI About My Result" Chat Endpoint
    await test('POST /api/student/ai-coach/chat Responds Intelligently to Result Inquiries', async () => {
      const chatRes = await fetch(`${API_URL}/api/student/ai-coach/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenA}`
        },
        body: JSON.stringify({
          message: 'Why did I lose marks?',
          resultId: submittedResultId
        })
      });

      const chatData = await chatRes.json() as any;

      if (chatRes.status !== 200 || !chatData.reply) {
        throw new Error(`Chat query failed: ${JSON.stringify(chatData)}`);
      }

      if (!chatData.reply.includes('accuracy') && !chatData.reply.includes('mistake') && !chatData.reply.includes('marks')) {
        throw new Error(`Chat reply does not reflect result context: ${chatData.reply}`);
      }
    });

    // 6. Test "Practice My Weak Areas" (Adaptive Booster Mock Exam Generation)
    await test('POST /api/student/ai-coach/generate-weak-mock Creates 20-Question Targeted Exam', async () => {
      const boostRes = await fetch(`${API_URL}/api/student/ai-coach/generate-weak-mock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenA}`
        }
      });

      const boostData = await boostRes.json() as any;

      if (boostRes.status !== 201 || !boostData.exam?.examId) {
        throw new Error(`Weak area mock generator failed: ${JSON.stringify(boostData)}`);
      }

      const createdExamId = boostData.exam.examId;

      // Verify 20 questions exist in database for this new exam
      const qCount = await prisma.question.count({ where: { examId: createdExamId } });
      if (qCount !== 20) {
        throw new Error(`Expected 20 questions in generated adaptive mock, got ${qCount}`);
      }
    });

    // 7. Multi-User Isolation Test: User B sees clean empty state and cannot access User A's report
    await test('User Isolation: User B with 0 exams receives clean empty state', async () => {
      const resB = await fetch(`${API_URL}/api/student/ai-coach/latest`, {
        headers: { 'Authorization': `Bearer ${tokenB}` }
      });

      const dataB = await resB.json() as any;

      if (resB.status !== 200) {
        throw new Error(`Failed to fetch User B coach report: ${JSON.stringify(dataB)}`);
      }

      if (dataB.hasAttemptedExams !== false || dataB.report) {
        throw new Error(`Data leakage! User B received User A's exam report: ${JSON.stringify(dataB)}`);
      }
    });

    // Cleanup Test Data
    await test('Clean Up Test Artifacts', async () => {
      const emails = ['aicoach.studentA@rexam.com', 'aicoach.studentB@rexam.com'];
      const users = await prisma.user.findMany({ where: { email: { in: emails } } });
      const userIds = users.map(u => u.id);

      await prisma.aiPerformanceReport.deleteMany({ where: { userId: { in: userIds } } });
      await prisma.result.deleteMany({ where: { userId: { in: userIds } } });
      await prisma.examAttempt.deleteMany({ where: { userId: { in: userIds } } });
      await prisma.activityLog.deleteMany({ where: { userId: { in: userIds } } });

      const exams = await prisma.exam.findMany({ where: { createdById: { in: userIds } } });
      const examIds = exams.map(e => e.id);
      await prisma.option.deleteMany({ where: { question: { examId: { in: examIds } } } });
      await prisma.question.deleteMany({ where: { examId: { in: examIds } } });
      await prisma.exam.deleteMany({ where: { id: { in: examIds } } });
      await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    });

  } finally {
    if (server) {
      server.close();
    }
  }

  console.log(`\n==================================================`);
  console.log(`📊 AI Coach Test Summary: ${passed}/${passed + failed} Tests Passed`);
  console.log(`==================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal Test Runner Error:', err);
  if (server) server.close();
  process.exit(1);
});
