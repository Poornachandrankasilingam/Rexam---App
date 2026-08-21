import { extractQuestionsFromText, detectLanguage, cleanOcrText } from './services/ocrExtractionService.js';

async function runOcrTests() {
  console.log('🧪 Starting Universal Multilingual OCR & Extraction Automated Tests...\n');

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

  // 1. English Standard Questions with Inline & Standard Options
  test('English Standard & Inline Horizontal Options Extraction', () => {
    const raw = `
      1. What is the powerhouse of the cell?
      A. Mitochondria (correct)
      B. Nucleus
      C. Ribosome
      D. Golgi apparatus
      Explanation: Mitochondria generates most of the chemical energy.

      2. Calculate speed if distance is 100m and time is 5s.
      (A) 20 m/s (correct)   (B) 25 m/s   (C) 15 m/s   (D) 30 m/s
      Answer: A
    `;

    const result = extractQuestionsFromText(raw, "Science");
    if (!result.success || result.questions.length !== 2) {
      throw new Error(`Expected 2 questions, got ${result.questions.length}`);
    }

    if (result.questions[0].options[0].text !== 'Mitochondria' || !result.questions[0].options[0].isCorrect) {
      throw new Error(`Option 0 mismatch: ${JSON.stringify(result.questions[0].options)}`);
    }

    if (result.questions[1].options[0].text !== '20 m/s' || !result.questions[1].options[0].isCorrect) {
      throw new Error(`Inline option parse mismatch: ${JSON.stringify(result.questions[1].options)}`);
    }
  });

  // 2. Hindi / Devanagari Script Extraction
  test('Hindi / Devanagari Full Question Paper Extraction', () => {
    const rawHindi = `
      प्रश्न 1: भारतीय संविधान के किस अनुच्छेद में विधि के समक्ष समानता का अधिकार है?
      (क) अनुच्छेद 14 (correct)
      (ख) अनुच्छेद 19
      (ग) अनुच्छेद 21
      (घ) अनुच्छेद 32
      व्याख्या: अनुच्छेद 14 समानता का अधिकार देता है।

      प्रश्न 2: भारत का राष्ट्रीय खेल कौन सा माना जाता है?
      (अ) हॉकी (correct)
      (ब) क्रिकेट
      (स) फुटबॉल
      (द) कबड्डी
      उत्तर: हॉकी
    `;

    const result = extractQuestionsFromText(rawHindi, "General Awareness");
    if (!result.success || result.questions.length !== 2) {
      throw new Error(`Expected 2 questions, got ${result.questions.length}`);
    }

    if (!result.detectedLanguage.includes("Hindi")) {
      throw new Error(`Expected Hindi detection, got ${result.detectedLanguage}`);
    }

    if (result.questions[0].options[0].text !== 'अनुच्छेद 14' || !result.questions[0].options[0].isCorrect) {
      throw new Error(`Hindi option parse mismatch: ${JSON.stringify(result.questions[0].options)}`);
    }
  });

  // 3. Tamil Script Extraction
  test('Tamil Script Question Paper Extraction', () => {
    const rawTamil = `
      கேள்வி 1: தமிழ்நாட்டின் மாநில மரம் எது?
      (அ) பனை மரம் (correct)
      (ஆ) ஆலமரம்
      (இ) வேப்பமரம்
      (ஈ) மாமரம்
      விளக்கம்: பனை மரம் தமிழ்நாட்டின் அதிகாரப்பூர்வ மாநில மரம்.

      கேள்வி 2: திருக்குறளை இயற்றியவர் யார்?
      A. திருவள்ளுவர் (correct)
      B. கம்பர்
      C. பாரதியார்
      D. அவ்வையார்
      விடை: திருவள்ளுவர்
    `;

    const result = extractQuestionsFromText(rawTamil, "Tamil Studies");
    if (!result.success || result.questions.length !== 2) {
      throw new Error(`Expected 2 questions, got ${result.questions.length}`);
    }

    if (!result.detectedLanguage.includes("Tamil")) {
      throw new Error(`Expected Tamil detection, got ${result.detectedLanguage}`);
    }

    if (!result.questions[0].text.includes("மாநில மரம்")) {
      throw new Error(`Question stem mismatch: ${result.questions[0].text}`);
    }

    if (result.questions[0].options[0].text !== 'பனை மரம்' || !result.questions[0].options[0].isCorrect) {
      throw new Error(`Tamil option parse mismatch: ${JSON.stringify(result.questions[0].options)}`);
    }
  });

  // 4. Bilingual SSC / UPSC Examination Extraction
  test('Bilingual English + Hindi Question Paper Extraction', () => {
    const rawBilingual = `
      1. Who was the founder of the Maurya Empire? / मौर्य साम्राज्य के संस्थापक कौन थे?
      (A) Chandragupta Maurya / चंद्रगुप्त मौर्य (correct)
      (B) Ashoka / अशोक
      (C) Bindusara / बिंदुसार
      (D) Samudragupta / समुद्रगुप्त
      Explanation: Chandragupta Maurya founded the empire with Chanakya.
    `;

    const result = extractQuestionsFromText(rawBilingual, "History");
    if (!result.success || result.questions.length !== 1) {
      throw new Error(`Expected 1 question, got ${result.questions.length}`);
    }

    if (!result.detectedLanguage.includes("Bilingual") && !result.detectedLanguage.includes("Hindi")) {
      throw new Error(`Expected Bilingual or Hindi detection, got ${result.detectedLanguage}`);
    }

    if (!result.questions[0].text.includes("Maurya") || !result.questions[0].text.includes("मौर्य")) {
      throw new Error(`Bilingual stem missing parts: ${result.questions[0].text}`);
    }

    if (!result.questions[0].options[0].isCorrect) {
      throw new Error(`Correct option flag failed in bilingual extraction`);
    }
  });

  // 5. Separate Answer Key Block Extraction at Bottom
  test('Document with Separate Bottom Answer Key Block Extraction', () => {
    const rawWithKey = `
      1. What is the capital of France?
      (A) Paris
      (B) Rome
      (C) Berlin
      (D) Madrid

      2. What is 15 * 4?
      (A) 50
      (B) 60
      (C) 70
      (D) 80

      ANSWER KEY:
      1. A
      2. B
    `;

    const result = extractQuestionsFromText(rawWithKey, "General Knowledge");
    if (!result.success || result.questions.length !== 2) {
      throw new Error(`Expected 2 questions, got ${result.questions.length}`);
    }

    if (!result.questions[0].options[0].isCorrect || result.questions[0].options[0].text !== 'Paris') {
      throw new Error(`Answer key mapping failed for Q1: ${JSON.stringify(result.questions[0])}`);
    }

    if (!result.questions[1].options[1].isCorrect || result.questions[1].options[1].text !== '60') {
      throw new Error(`Answer key mapping failed for Q2: ${JSON.stringify(result.questions[1])}`);
    }
  });

  console.log(`\n==================================================`);
  console.log(`📊 Multilingual OCR Test Summary: ${passed}/${passed + failed} Tests Passed`);
  console.log(`==================================================\n`);

  if (failed > 0) process.exit(1);
}

runOcrTests();
