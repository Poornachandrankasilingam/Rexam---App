/**
 * Rexam AI Question Generator Service
 * 
 * Automatically generates exam-ready questions for:
 * 1. Quantitative Aptitude (Maths & Data Interpretation)
 * 2. Logical Reasoning (Analytical, Deductive, & Structural)
 * 3. Verbal Ability & Reasoning (English / Multilingual Grammar & Vocab)
 */

export interface GeneratedQuestionOption {
  text: string;
  isCorrect: boolean;
}

export interface GeneratedAiQuestion {
  id: string;
  text: string;
  subject: string;
  topic: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  marks: number;
  negativeMarks: number;
  explanation: string;
  options: GeneratedQuestionOption[];
  language: string;
}

export interface GenerateAiQuestionsParams {
  subject: string; // 'Quantitative Aptitude' | 'Logical Reasoning' | 'Verbal Ability' | 'General Awareness'
  topic?: string;
  difficulty?: "EASY" | "MEDIUM" | "HARD";
  count?: number;
  language?: string; // 'English' | 'Hindi' | 'Tamil' | 'Bilingual'
}

type QuestionTemplate = {
  subject: string;
  topic: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  language: string;
  generate: () => {
    text: string;
    options: { text: string; isCorrect: boolean }[];
    explanation: string;
  };
};

const QUANT_TEMPLATES: QuestionTemplate[] = [
  // 1. Profit & Loss
  {
    subject: "Quantitative Aptitude",
    topic: "Profit & Loss",
    difficulty: "EASY",
    language: "English",
    generate: () => {
      const cp = (Math.floor(Math.random() * 8) + 2) * 50; // 100, 150, 200, 250...
      const profitPercent = [10, 15, 20, 25, 30][Math.floor(Math.random() * 5)];
      const sp = Math.round(cp * (1 + profitPercent / 100));
      const wrong1 = sp + 20;
      const wrong2 = sp - 15;
      const wrong3 = Math.round(cp * (1 + (profitPercent - 5) / 100));

      const opts = [
        { text: `₹${sp}`, isCorrect: true },
        { text: `₹${wrong1}`, isCorrect: false },
        { text: `₹${wrong2}`, isCorrect: false },
        { text: `₹${wrong3}`, isCorrect: false }
      ].sort(() => Math.random() - 0.5);

      return {
        text: `A merchant purchases an item for ₹${cp} and sells it at a profit of ${profitPercent}%. What is the selling price of the item?`,
        options: opts,
        explanation: `Selling Price (SP) = Cost Price (CP) × (100 + Profit%) / 100 = ₹${cp} × (100 + ${profitPercent}) / 100 = ₹${sp}.`
      };
    }
  },
  // 2. Speed, Time & Distance
  {
    subject: "Quantitative Aptitude",
    topic: "Speed, Time & Distance",
    difficulty: "MEDIUM",
    language: "English",
    generate: () => {
      const length = [100, 120, 150, 180, 200][Math.floor(Math.random() * 5)];
      const timeSec = [5, 6, 8, 10, 12][Math.floor(Math.random() * 5)];
      const speedMs = length / timeSec;
      const speedKmh = Math.round(speedMs * 3.6);

      const opts = [
        { text: `${speedKmh} km/h`, isCorrect: true },
        { text: `${speedKmh + 6} km/h`, isCorrect: false },
        { text: `${Math.max(10, speedKmh - 8)} km/h`, isCorrect: false },
        { text: `${speedKmh + 12} km/h`, isCorrect: false }
      ].sort(() => Math.random() - 0.5);

      return {
        text: `A train ${length} meters long passes a telegraph post in ${timeSec} seconds. Find the speed of the train in km/h.`,
        options: opts,
        explanation: `Speed in m/s = Distance / Time = ${length} / ${timeSec} = ${speedMs.toFixed(2)} m/s. Speed in km/h = ${speedMs.toFixed(2)} × (18 / 5) = ${speedKmh} km/h.`
      };
    }
  },
  // 3. Simple & Compound Interest
  {
    subject: "Quantitative Aptitude",
    topic: "Simple & Compound Interest",
    difficulty: "MEDIUM",
    language: "English",
    generate: () => {
      const p = (Math.floor(Math.random() * 5) + 1) * 2000; // 2000, 4000, 6000...
      const r = [5, 6, 8, 10, 12][Math.floor(Math.random() * 5)];
      const t = [2, 3, 4][Math.floor(Math.random() * 3)];
      const si = (p * r * t) / 100;
      const total = p + si;

      const opts = [
        { text: `₹${si}`, isCorrect: true },
        { text: `₹${si + 100}`, isCorrect: false },
        { text: `₹${si - 50}`, isCorrect: false },
        { text: `₹${total}`, isCorrect: false }
      ].sort(() => Math.random() - 0.5);

      return {
        text: `Find the simple interest on a principal sum of ₹${p} invested at ${r}% per annum for ${t} years.`,
        options: opts,
        explanation: `Simple Interest (SI) = (P × R × T) / 100 = (${p} × ${r} × ${t}) / 100 = ₹${si}.`
      };
    }
  },
  // 4. Time & Work
  {
    subject: "Quantitative Aptitude",
    topic: "Time & Work",
    difficulty: "HARD",
    language: "English",
    generate: () => {
      const daysA = [10, 12, 15, 20][Math.floor(Math.random() * 4)];
      const daysB = [15, 20, 30][Math.floor(Math.random() * 3)];
      const totalWork = (daysA * daysB) / (daysA + daysB);
      const roundedDays = Number(totalWork.toFixed(1));

      const opts = [
        { text: `${roundedDays} days`, isCorrect: true },
        { text: `${(roundedDays + 2).toFixed(1)} days`, isCorrect: false },
        { text: `${Math.max(1, roundedDays - 1.5).toFixed(1)} days`, isCorrect: false },
        { text: `${(daysA + daysB) / 2} days`, isCorrect: false }
      ].sort(() => Math.random() - 0.5);

      return {
        text: `A can complete a piece of work in ${daysA} days and B can complete the same work in ${daysB} days. Working together, in how many days will they finish the entire work?`,
        options: opts,
        explanation: `1 day work of A = 1/${daysA}, 1 day work of B = 1/${daysB}. Combined 1 day work = 1/${daysA} + 1/${daysB} = ${(1/daysA + 1/daysB).toFixed(3)}. Total time = ${roundedDays} days.`
      };
    }
  },
  // 5. Percentages & Ratios
  {
    subject: "Quantitative Aptitude",
    topic: "Percentages & Ratio",
    difficulty: "EASY",
    language: "English",
    generate: () => {
      const val = [20, 25, 40, 50][Math.floor(Math.random() * 4)];
      const ans = Number(((val / (100 + val)) * 100).toFixed(2));

      const opts = [
        { text: `${ans}%`, isCorrect: true },
        { text: `${val}%`, isCorrect: false },
        { text: `${(ans - 4.5).toFixed(2)}%`, isCorrect: false },
        { text: `${(ans + 3.2).toFixed(2)}%`, isCorrect: false }
      ].sort(() => Math.random() - 0.5);

      return {
        text: `If Person A's salary is ${val}% more than Person B's salary, then by what percentage is Person B's salary less than Person A's?`,
        options: opts,
        explanation: `Formula: Percentage Less = [r / (100 + r)] × 100 = [${val} / (100 + ${val})] × 100 = ${ans}%.`
      };
    }
  }
];

const LOGICAL_TEMPLATES: QuestionTemplate[] = [
  // 1. Syllogisms
  {
    subject: "Logical Reasoning",
    topic: "Syllogism",
    difficulty: "EASY",
    language: "English",
    generate: () => {
      const subjects = ["Birds", "Mammals", "Flowers", "Stars"];
      const s = subjects[Math.floor(Math.random() * subjects.length)];
      return {
        text: `Statements:\n1. All ${s} have wings.\n2. All winged creatures can glide.\n\nConclusions:\nI. All ${s} can glide.\nII. Some creatures that glide are ${s}.`,
        options: [
          { text: "Both I and II follow", isCorrect: true },
          { text: "Only Conclusion I follows", isCorrect: false },
          { text: "Only Conclusion II follows", isCorrect: false },
          { text: "Neither I nor II follows", isCorrect: false }
        ].sort(() => Math.random() - 0.5),
        explanation: "Since All A are B, and All B are C, it directly follows that All A are C (I is valid) and Some C are A (II is valid)."
      };
    }
  },
  // 2. Blood Relations
  {
    subject: "Logical Reasoning",
    topic: "Blood Relations",
    difficulty: "MEDIUM",
    language: "English",
    generate: () => {
      const names = ["Rohan", "Suresh", "Vikram", "Anil"];
      const n = names[Math.floor(Math.random() * names.length)];
      return {
        text: `Pointing to a photograph of a woman, ${n} said, "Her mother is the only daughter of my mother." How is ${n} related to the woman in the photograph?`,
        options: [
          { text: "Father", isCorrect: true },
          { text: "Brother", isCorrect: false },
          { text: "Uncle", isCorrect: false },
          { text: "Grandfather", isCorrect: false }
        ].sort(() => Math.random() - 0.5),
        explanation: "Only daughter of Rohan's mother = Rohan's sister (or if speaker is female, herself). For a male speaker, the woman's mother is Rohan's sister/wife, indicating he is her Father/Uncle."
      };
    }
  },
  // 3. Coding-Decoding
  {
    subject: "Logical Reasoning",
    topic: "Coding-Decoding",
    difficulty: "EASY",
    language: "English",
    generate: () => {
      const words = [
        { word: "CAT", code: "3120", target: "DOG", ans: "4157" },
        { word: "BAT", code: "2120", target: "FOX", ans: "61524" },
        { word: "RED", code: "1854", target: "BLUE", ans: "212215" }
      ];
      const item = words[Math.floor(Math.random() * words.length)];

      const opts = [
        { text: item.ans, isCorrect: true },
        { text: (parseInt(item.ans) + 11).toString(), isCorrect: false },
        { text: (parseInt(item.ans) - 20).toString(), isCorrect: false },
        { text: item.ans.slice(0, -1) + "9", isCorrect: false }
      ].sort(() => Math.random() - 0.5);

      return {
        text: `In a certain code language, if "${item.word}" is coded as "${item.code}", then how will "${item.target}" be coded in that same language?`,
        options: opts,
        explanation: `Each letter corresponds directly to its alphabetical position (A=1, B=2 ... Z=26). Target "${item.target}" = ${item.ans}.`
      };
    }
  },
  // 4. Number & Letter Series
  {
    subject: "Logical Reasoning",
    topic: "Number & Letter Series",
    difficulty: "MEDIUM",
    language: "English",
    generate: () => {
      const start = Math.floor(Math.random() * 5) + 2;
      const series = [start, start * 2 + 1, (start * 2 + 1) * 2 + 1, ((start * 2 + 1) * 2 + 1) * 2 + 1];
      const nextNum = series[series.length - 1] * 2 + 1;

      const opts = [
        { text: `${nextNum}`, isCorrect: true },
        { text: `${nextNum - 2}`, isCorrect: false },
        { text: `${nextNum + 4}`, isCorrect: false },
        { text: `${nextNum * 2}`, isCorrect: false }
      ].sort(() => Math.random() - 0.5);

      return {
        text: `Find the missing next number in the given logical sequence: ${series.join(", ")}, ?`,
        options: opts,
        explanation: `Pattern: Multiply previous number by 2 and add 1 (× 2 + 1). ${series[series.length - 1]} × 2 + 1 = ${nextNum}.`
      };
    }
  },
  // 5. Direction Sense
  {
    subject: "Logical Reasoning",
    topic: "Direction Sense",
    difficulty: "EASY",
    language: "English",
    generate: () => {
      const dist1 = [3, 6, 9][Math.floor(Math.random() * 3)];
      const dist2 = [4, 8, 12][Math.floor(Math.random() * 3)];
      const shortest = Math.sqrt(dist1 * dist1 + dist2 * dist2);

      const opts = [
        { text: `${shortest} km, North-East`, isCorrect: true },
        { text: `${dist1 + dist2} km, North`, isCorrect: false },
        { text: `${shortest} km, South-West`, isCorrect: false },
        { text: `${Math.abs(dist1 - dist2)} km, East`, isCorrect: false }
      ].sort(() => Math.random() - 0.5);

      return {
        text: `A person walks ${dist1} km North, turns right, and walks ${dist2} km East. What is the shortest distance and direction from their initial starting point?`,
        options: opts,
        explanation: `Using Pythagoras theorem: Shortest Distance = √(${dist1}² + ${dist2}²) = √(${dist1 * dist1 + dist2 * dist2}) = ${shortest} km in the North-East direction.`
      };
    }
  }
];

const VERBAL_TEMPLATES: QuestionTemplate[] = [
  // 1. Synonyms & Vocabulary
  {
    subject: "Verbal Ability",
    topic: "Synonyms & Antonyms",
    difficulty: "EASY",
    language: "English",
    generate: () => {
      const pairs = [
        { word: "BENEVOLENT", correct: "Kind-hearted", wrong: ["Malicious", "Hostile", "Selfish"] },
        { word: "CANDID", correct: "Frank & Outspoken", wrong: ["Deceitful", "Secretive", "Shy"] },
        { word: "METICULOUS", correct: "Thorough & Precise", wrong: ["Careless", "Hasty", "Sloppy"] },
        { word: "RESILIENT", correct: "Quick to recover", wrong: ["Fragile", "Rigid", "Vulnerable"] }
      ];
      const p = pairs[Math.floor(Math.random() * pairs.length)];

      const opts = [
        { text: p.correct, isCorrect: true },
        ...p.wrong.map(w => ({ text: w, isCorrect: false }))
      ].sort(() => Math.random() - 0.5);

      return {
        text: `Select the most appropriate synonym for the capitalized word: "${p.word}"`,
        options: opts,
        explanation: `"${p.word}" denotes qualities of being ${p.correct.toLowerCase()}.`
      };
    }
  },
  // 2. Spotting Errors / Grammar
  {
    subject: "Verbal Ability",
    topic: "Grammar & Spotting Errors",
    difficulty: "MEDIUM",
    language: "English",
    generate: () => {
      const errors = [
        {
          sentence: "Neither of the two candidates (A) / were present (B) / at the interview (C) / No error (D)",
          correct: "Part B (were present -> was present)",
          explanation: "'Neither of' takes a singular verb ('was' instead of 'were')."
        },
        {
          sentence: "Scarcely had he entered the room (A) / than the phone (B) / began to ring (C) / No error (D)",
          correct: "Part B (than -> when)",
          explanation: "'Scarcely had' is always paired with 'when', not 'than'."
        },
        {
          sentence: "One of the most important feature (A) / of this project (B) / is high reliability (C) / No error (D)",
          correct: "Part A (feature -> features)",
          explanation: "'One of the' is followed by a plural noun ('features')."
        }
      ];
      const e = errors[Math.floor(Math.random() * errors.length)];

      const opts = [
        { text: e.correct, isCorrect: true },
        { text: "Part A", isCorrect: false },
        { text: "Part C", isCorrect: false },
        { text: "No error (D)", isCorrect: false }
      ].sort(() => Math.random() - 0.5);

      return {
        text: `Identify the segment with the grammatical error:\n"${e.sentence}"`,
        options: opts,
        explanation: e.explanation
      };
    }
  }
];

// Multilingual / Hindi Templates
const HINDI_TEMPLATES: QuestionTemplate[] = [
  {
    subject: "Quantitative Aptitude",
    topic: "Profit & Loss (लाभ और हानि)",
    difficulty: "EASY",
    language: "Hindi",
    generate: () => {
      const cp = 500;
      const profitPercent = 20;
      const sp = 600;

      return {
        text: `यदि किसी वस्तु का क्रय मूल्य ₹${cp} है और उसे ${profitPercent}% लाभ पर बेचा जाता है, तो वस्तु का विक्रय मूल्य क्या होगा?`,
        options: [
          { text: `₹${sp}`, isCorrect: true },
          { text: `₹550`, isCorrect: false },
          { text: `₹620`, isCorrect: false },
          { text: `₹580`, isCorrect: false }
        ].sort(() => Math.random() - 0.5),
        explanation: `विक्रय मूल्य = क्रय मूल्य × (100 + लाभ%) / 100 = 500 × 120 / 100 = ₹600.`
      };
    }
  },
  {
    subject: "Logical Reasoning",
    topic: "Coding-Decoding (कोडिंग-डिकोडिंग)",
    difficulty: "EASY",
    language: "Hindi",
    generate: () => {
      return {
        text: `यदि किसी निश्चित कूट भाषा में 'CAT' को '3120' लिखा जाता है, तो 'DOG' को उसी कूट भाषा में कैसे लिखा जाएगा?`,
        options: [
          { text: "4157", isCorrect: true },
          { text: "4147", isCorrect: false },
          { text: "3157", isCorrect: false },
          { text: "4167", isCorrect: false }
        ].sort(() => Math.random() - 0.5),
        explanation: `वर्णमाला क्रमांक: D=4, O=15, G=7 => '4157'.`
      };
    }
  }
];

/**
 * Main Generator Function
 */
export function generateAiQuestions(params: GenerateAiQuestionsParams): GeneratedAiQuestion[] {
  const {
    subject = "Quantitative Aptitude",
    topic,
    difficulty,
    count = 10,
    language = "English"
  } = params;

  let pool: QuestionTemplate[] = [];

  if (language === "Hindi") {
    pool = [...HINDI_TEMPLATES];
  } else {
    if (subject.toLowerCase().includes("quant") || subject.toLowerCase().includes("aptitude")) {
      pool = [...QUANT_TEMPLATES];
    } else if (subject.toLowerCase().includes("logic") || subject.toLowerCase().includes("reasoning")) {
      pool = [...LOGICAL_TEMPLATES];
    } else if (subject.toLowerCase().includes("verbal") || subject.toLowerCase().includes("english")) {
      pool = [...VERBAL_TEMPLATES];
    } else {
      // General mix
      pool = [...QUANT_TEMPLATES, ...LOGICAL_TEMPLATES, ...VERBAL_TEMPLATES];
    }
  }

  if (pool.length === 0) {
    pool = [...QUANT_TEMPLATES, ...LOGICAL_TEMPLATES];
  }

  // Filter by topic if specified
  if (topic && topic !== "ALL") {
    const topicFiltered = pool.filter(t => t.topic.toLowerCase().includes(topic.toLowerCase()));
    if (topicFiltered.length > 0) pool = topicFiltered;
  }

  // Filter by difficulty if specified
  if (difficulty) {
    const diffFiltered = pool.filter(t => t.difficulty === difficulty);
    if (diffFiltered.length > 0) pool = diffFiltered;
  }

  const generatedQuestions: GeneratedAiQuestion[] = [];
  const requestedCount = Math.max(1, Math.min(count, 50));

  for (let i = 0; i < requestedCount; i++) {
    const template = pool[i % pool.length];
    const generated = template.generate();

    generatedQuestions.push({
      id: `ai-q-${Date.now()}-${i + 1}`,
      text: generated.text,
      subject: template.subject,
      topic: template.topic,
      difficulty: template.difficulty,
      marks: 2,
      negativeMarks: 0.5,
      explanation: generated.explanation,
      options: generated.options,
      language: template.language
    });
  }

  return generatedQuestions;
}
