import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

import { generateAiQuestions } from './services/aiQuestionGeneratorService.js';

async function runAiQuestionGenTests() {
  console.log('🧪 Starting AI Question Generator Automated Tests for Aptitude, Reasoning, and Verbal...\n');

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

  // 1. Test Quantitative Aptitude Generator with NVIDIA NIM
  await test('Generate Quantitative Aptitude Questions via NVIDIA NIM', async () => {
    const questions = await generateAiQuestions({
      subject: 'Quantitative Aptitude',
      topic: 'Profit & Loss',
      difficulty: 'MEDIUM',
      count: 2,
      language: 'English',
      provider: 'nvidia'
    });

    if (questions.length < 1) {
      throw new Error(`Expected at least 1 question, got ${questions.length}`);
    }

    const first = questions[0];
    if (!first.text || first.text.length < 10) {
      throw new Error(`Question stem invalid: ${first.text}`);
    }

    if (first.options.length < 2) {
      throw new Error(`Expected at least 2 options, got ${first.options.length}`);
    }

    const correctCount = first.options.filter(o => o.isCorrect).length;
    if (correctCount !== 1) {
      throw new Error(`Expected exactly 1 correct option, got ${correctCount}`);
    }

    if (!first.explanation || first.explanation.length < 5) {
      throw new Error(`Missing explanation: ${first.explanation}`);
    }
    console.log(`[Provider: ${first.provider}]`);
  });

  // 2. Test Logical Reasoning Generator with Google Gemini
  await test('Generate Logical Reasoning Questions via Google Gemini', async () => {
    const questions = await generateAiQuestions({
      subject: 'Logical Reasoning',
      topic: 'Syllogism',
      difficulty: 'EASY',
      count: 2,
      language: 'English',
      provider: 'gemini'
    });

    if (questions.length < 1) {
      throw new Error(`Expected at least 1 question, got ${questions.length}`);
    }

    const first = questions[0];
    if (!first.text || first.text.length < 10) {
      throw new Error(`Question stem invalid: ${first.text}`);
    }

    const correct = first.options.find(o => o.isCorrect);
    if (!correct) {
      throw new Error('No correct option designated');
    }
    console.log(`[Provider: ${first.provider}]`);
  });

  // 3. Test Verbal Ability & Reasoning Generator with Auto-Cascade
  await test('Generate Verbal Ability & Reasoning Questions via Auto-Cascade', async () => {
    const questions = await generateAiQuestions({
      subject: 'Verbal Ability',
      topic: 'Synonyms & Antonyms',
      difficulty: 'EASY',
      count: 2,
      language: 'English',
      provider: 'auto'
    });

    if (questions.length < 1) {
      throw new Error(`Expected at least 1 question, got ${questions.length}`);
    }

    const first = questions[0];
    if (!first.text || first.text.length < 10) {
      throw new Error(`Question stem invalid: ${first.text}`);
    }
    console.log(`[Provider: ${first.provider}]`);
  });

  // 4. Test Hindi / Multilingual Generator
  await test('Generate Hindi / Devanagari Aptitude & Reasoning Questions', async () => {
    const questions = await generateAiQuestions({
      subject: 'Quantitative Aptitude',
      topic: 'Profit & Loss (लाभ और हानि)',
      difficulty: 'EASY',
      count: 2,
      language: 'Hindi'
    });

    if (questions.length < 1) {
      throw new Error(`Expected at least 1 question, got ${questions.length}`);
    }

    const first = questions[0];
    if (!first.language.includes('Hindi')) {
      throw new Error(`Language mismatch: ${first.language}`);
    }
    console.log(`[Provider: ${first.provider}]`);
  });

  console.log(`\n==================================================`);
  console.log(`📊 AI Question Generator Test Summary: ${passed}/${passed + failed} Tests Passed`);
  console.log(`==================================================\n`);

  if (failed > 0) process.exit(1);
}

runAiQuestionGenTests();
