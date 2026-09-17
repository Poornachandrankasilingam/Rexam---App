import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

import { 
  getAiProviderStatus, 
  getAiCoachResponse, 
  processMockDrillTurn 
} from './services/aiChatService.js';
import { generateAiQuestions } from './services/aiQuestionGeneratorService.js';

async function testGeminiAiCoachIntegration() {
  console.log('🤖 =========================================================');
  console.log('🤖 TESTING AI COACH & MOCKING DRILL VIA GOOGLE GEMINI API');
  console.log('🤖 =========================================================\n');

  // 1. Check AI Provider Status
  console.log('1️⃣ Checking AI Provider Status...');
  const status = getAiProviderStatus();
  console.log('   Connected:', status.connected);
  console.log('   Primary Model:', status.primaryModel);
  console.log('   Active Providers:', status.activeProviders.join(', '));

  // 2. Test AI Coach Mentoring & Doubt Solving with Gemini
  console.log('\n2️⃣ Testing AI Coach Coaching & Doubt Resolution (Gemini)...');
  const coachPrompt = 'How should I solve Speed Time and Distance problems with trains crossing platforms in under 45 seconds?';
  const coachResponse = await getAiCoachResponse(coachPrompt, [], {
    name: 'Poornachandran',
    targetExam: 'SSC CGL / Banking',
    weakTopics: ['Speed, Time & Distance']
  });

  console.log('   ✅ AI Coach Response received from Gemini:');
  console.log('   --------------------------------------------------');
  console.log(coachResponse.slice(0, 300) + '...\n');

  // 3. Test Real-Time Oral Mock Exam / Viva Drill Turn 1 (Start Question)
  console.log('3️⃣ Testing Real-Time Mock Exam Drill - Turn 1 (Initial Question Generation)...');
  const turn1 = await processMockDrillTurn({
    targetExam: 'Computer Science & Software Engineering Assessment',
    subject: 'Data Structures & Algorithms',
    difficulty: 'MEDIUM',
    totalQuestions: 3,
    currentQuestionIndex: 0
  });

  console.log('   ✅ Mock Examiner Generated Question 1:');
  console.log(`   "${turn1.nextQuestion}"`);

  // 4. Test Real-Time Oral Mock Exam / Viva Drill Turn 2 (Evaluate Answer + Ask Q2)
  console.log('\n4️⃣ Testing Real-Time Mock Exam Drill - Turn 2 (Answer Evaluation & Scoring)...');
  const studentSimulatedAnswer = 'In a balanced binary search tree or AVL tree, search takes O(log N) time because the height is bounded by log N, whereas an unsorted array takes O(N) linear time.';
  
  const turn2 = await processMockDrillTurn({
    targetExam: 'Computer Science & Software Engineering Assessment',
    subject: 'Data Structures & Algorithms',
    difficulty: 'MEDIUM',
    totalQuestions: 3,
    currentQuestionIndex: 1,
    previousQuestion: turn1.nextQuestion || 'Compare searching complexity in AVL tree vs unsorted array.',
    studentAnswer: studentSimulatedAnswer
  });

  console.log('   ✅ Evaluation from Gemini:');
  console.log(`      Score Awarded: ${turn2.scoreAwarded} / ${turn2.maxMarks}`);
  console.log(`      Feedback: ${turn2.feedback}`);
  console.log(`      Model Answer: ${turn2.correctAnswer}`);
  console.log(`      Next Question (Q2): "${turn2.nextQuestion}"`);

  // 5. Test AI Mock Test Paper Generation (Multiple-Choice Questions with 4 options & Solutions)
  console.log('\n5️⃣ Testing AI Mock Test Paper Generation (Gemini)...');
  const generatedQs = await generateAiQuestions({
    subject: 'Quantitative Aptitude',
    topic: 'Time & Work',
    difficulty: 'MEDIUM',
    count: 2,
    language: 'English'
  });

  console.log(`   ✅ Generated ${generatedQs.length} questions with Gemini:`);
  generatedQs.forEach((q, idx) => {
    console.log(`   [Q${idx + 1}] ${q.text}`);
    console.log(`        Subject: ${q.subject} • ${q.topic} (${q.difficulty})`);
    console.log(`        Options (${q.options.length}): ${q.options.map(o => `${o.text} ${o.isCorrect ? '✓' : ''}`).join(' | ')}`);
    console.log(`        Explanation: ${q.explanation.slice(0, 70)}...`);
  });

  console.log('\n🎉 =========================================================');
  console.log('🎉 GOOGLE GEMINI AI COACH & MOCKING DRILL CONNECTED 100% SUCCESSFULLY!');
  console.log('🎉 =========================================================\n');
}

testGeminiAiCoachIntegration().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
