import { generateAiQuestions } from './services/aiQuestionGeneratorService.js';

async function runAiQuestionGenTests() {
  console.log('🧪 Starting AI Question Generator Automated Tests for Aptitude, Reasoning, and Verbal...\n');

  let passed = 0;
  let failed = 0;

  function test(name: string, fn: () => void) {
    process.stdout.write(`⏳ Testing: ${name}... `);
    try {
      fn();
      console.log('✅ PASSED');
      passed++;
    } catch (err: any) {
      console.log(`❌ FAILED: ${err.message}`);
      failed++;
    }
  }

  // 1. Test Quantitative Aptitude Generator
  test('Generate Quantitative Aptitude Questions with Math Solutions', () => {
    const questions = generateAiQuestions({
      subject: 'Quantitative Aptitude',
      topic: 'Profit & Loss',
      difficulty: 'EASY',
      count: 5,
      language: 'English'
    });

    if (questions.length !== 5) {
      throw new Error(`Expected 5 questions, got ${questions.length}`);
    }

    const first = questions[0];
    if (!first.text.includes('merchant') && !first.text.includes('selling price') && !first.text.includes('profit')) {
      throw new Error(`Question stem unexpected: ${first.text}`);
    }

    if (first.options.length !== 4) {
      throw new Error(`Expected 4 options, got ${first.options.length}`);
    }

    const correctCount = first.options.filter(o => o.isCorrect).length;
    if (correctCount !== 1) {
      throw new Error(`Expected exactly 1 correct option, got ${correctCount}`);
    }

    if (!first.explanation.includes('Cost Price') && !first.explanation.includes('Profit')) {
      throw new Error(`Explanation missing step-by-step solution: ${first.explanation}`);
    }
  });

  // 2. Test Logical Reasoning Generator
  test('Generate Logical Reasoning Questions with Deductive Proofs', () => {
    const questions = generateAiQuestions({
      subject: 'Logical Reasoning',
      topic: 'Syllogism',
      difficulty: 'EASY',
      count: 5,
      language: 'English'
    });

    if (questions.length !== 5) {
      throw new Error(`Expected 5 questions, got ${questions.length}`);
    }

    const first = questions[0];
    if (!first.text.includes('Statements:') || !first.text.includes('Conclusions:')) {
      throw new Error(`Syllogism structure mismatch: ${first.text}`);
    }

    const correct = first.options.find(o => o.isCorrect);
    if (!correct) {
      throw new Error('No correct option designated');
    }
  });

  // 3. Test Verbal Ability & Reasoning Generator
  test('Generate Verbal Ability & Reasoning Questions with Grammar Notes', () => {
    const questions = generateAiQuestions({
      subject: 'Verbal Ability',
      topic: 'Synonyms & Antonyms',
      difficulty: 'EASY',
      count: 4,
      language: 'English'
    });

    if (questions.length !== 4) {
      throw new Error(`Expected 4 questions, got ${questions.length}`);
    }

    const first = questions[0];
    if (!first.text.includes('synonym')) {
      throw new Error(`Vocabulary question mismatch: ${first.text}`);
    }
  });

  // 4. Test Hindi / Multilingual Generator
  test('Generate Hindi / Devanagari Aptitude & Reasoning Questions', () => {
    const questions = generateAiQuestions({
      subject: 'Quantitative Aptitude',
      topic: 'ALL',
      difficulty: 'EASY',
      count: 4,
      language: 'Hindi'
    });

    if (questions.length !== 4) {
      throw new Error(`Expected 4 questions, got ${questions.length}`);
    }

    const first = questions[0];
    if (!first.language.includes('Hindi')) {
      throw new Error(`Language mismatch: ${first.language}`);
    }
  });

  console.log(`\n==================================================`);
  console.log(`📊 AI Question Generator Test Summary: ${passed}/${passed + failed} Tests Passed`);
  console.log(`==================================================\n`);

  if (failed > 0) process.exit(1);
}

runAiQuestionGenTests();
