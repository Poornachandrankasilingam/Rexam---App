import dotenv from 'dotenv';
dotenv.config();

export type ChatMode = 'COACH' | 'MOCKING';

export interface ChatMessageItem {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface MockSessionState {
  targetExam: string;
  subject: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  totalQuestions: number;
  currentQuestionIndex: number;
  score: number;
  maxScore: number;
  history: Array<{
    question: string;
    studentAnswer: string;
    scoreAwarded: number;
    maxMarks: number;
    feedback: string;
    correctAnswer: string;
  }>;
}

/**
 * Clean internal thinking tags (like <think>...</think>) from output
 */
function cleanAiOutput(text: string): string {
  if (!text) return '';
  if (text.includes('</think>')) {
    const parts = text.split('</think>');
    return parts[parts.length - 1].trim();
  }
  return text.replace(/<think>[\s\S]*?(<\/think>|$)/gi, '').trim();
}

/**
 * Multi-LLM Caller with automatic fallback between Groq, NVIDIA NIM, and Gemini
 */
async function callLlmChat(messages: ChatMessageItem[], temperature = 0.7): Promise<string> {
  const groqKey = process.env.GROQ_API_KEY;
  const nvidiaKey = process.env.NVIDIA_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  // 1. Try Groq (qwen/qwen3.6-27b or openai/gpt-oss-120b - subsecond inference)
  if (groqKey) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqKey}`
        },
        body: JSON.stringify({
          model: 'qwen/qwen3.6-27b',
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          temperature,
          max_tokens: 1500
        })
      });

      if (response.ok) {
        const data = await response.json() as any;
        const reply = cleanAiOutput(data?.choices?.[0]?.message?.content || '');
        if (reply) return reply;
      }
    } catch (e) {
      console.warn('Groq LLM call failed, falling back to NVIDIA NIM...', e);
    }
  }

  // 2. Fallback to NVIDIA NIM
  if (nvidiaKey) {
    try {
      const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${nvidiaKey}`
        },
        body: JSON.stringify({
          model: 'meta/llama-3.1-70b-instruct',
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          temperature,
          max_tokens: 1500
        })
      });

      if (response.ok) {
        const data = await response.json() as any;
        const reply = cleanAiOutput(data?.choices?.[0]?.message?.content || '');
        if (reply) return reply;
      }
    } catch (e) {
      console.warn('NVIDIA NIM call failed, falling back to Gemini...', e);
    }
  }

  // 3. Fallback to Gemini
  if (geminiKey) {
    try {
      const promptText = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: { temperature, maxOutputTokens: 1500 }
        })
      });

      if (response.ok) {
        const data = await response.json() as any;
        const reply = cleanAiOutput(data?.candidates?.[0]?.content?.parts?.[0]?.text || '');
        if (reply) return reply;
      }
    } catch (e) {
      console.warn('Gemini LLM call failed', e);
    }
  }

  // 4. Offline Fallback Logic
  const lastUserMsg = messages.filter(m => m.role === 'user').pop()?.content || '';
  return `### 💡 Rexam AI Coach Insights\nFor your question on "${lastUserMsg.slice(0, 50)}...":\n\n1. **Core Concept**: Break the problem down into base components and apply standard formulas.\n2. **Speed Trick**: Eliminate outlier options by estimating order of magnitude.\n3. **Recommended Practice**: Solve 10 similar previous year questions to build reflex speed.`;
}

/**
 * Handle general AI Coach Conversation
 */
export async function getAiCoachResponse(
  userMessage: string,
  chatHistory: ChatMessageItem[] = [],
  studentContext?: { name?: string; targetExam?: string; weakTopics?: string[] }
): Promise<string> {
  const systemPrompt = `You are "Rexam AI Coach" — an elite, highly encouraging, and razor-sharp competitive exam mentor and tutor for Indian government and competitive exams (SSC CGL/CHSL, UPSC CSE, Banking IBPS/SBI PO, Railways RRB NTPC, GATE, CAT).

STUDENT CONTEXT:
- Name: ${studentContext?.name || 'Aspirant'}
- Target Exam: ${studentContext?.targetExam || 'Competitive Exam'}
- Known Weak Areas: ${studentContext?.weakTopics?.join(', ') || 'Quantitative Aptitude, Logical Reasoning'}

YOUR COACHING PRINCIPLES:
1. Explain concepts with crystal clarity, using step-by-step mathematical formulas, mental math shortcuts, and real exam examples.
2. If asked about syllabus, time management, or study strategy, provide actionable, realistic daily schedules and high-yield topic weightages.
3. Be supportive, motivating, yet academically rigorous.
4. Format your output with clear markdown headings, bullet points, and bold keywords so it is extremely easy to read.`;

  const messages: ChatMessageItem[] = [
    { role: 'system', content: systemPrompt },
    ...chatHistory.slice(-8),
    { role: 'user', content: userMessage }
  ];

  return await callLlmChat(messages, 0.7);
}

/**
 * Handle Real-Time AI Mocking / Viva Drill
 */
export async function processMockDrillTurn(params: {
  targetExam: string;
  subject: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  totalQuestions?: number;
  currentQuestionIndex: number;
  previousQuestion?: string;
  studentAnswer?: string;
  history?: any[];
}): Promise<{
  feedback?: string;
  scoreAwarded?: number;
  maxMarks?: number;
  correctAnswer?: string;
  nextQuestion?: string;
  isComplete: boolean;
  finalSummary?: string;
}> {
  const totalQ = params.totalQuestions || 5;
  const isFinalQuestion = params.currentQuestionIndex >= totalQ;

  // If this is the start (Question 1), generate the first question
  if (!params.studentAnswer || params.currentQuestionIndex === 0) {
    const prompt = `You are a tough, prestigious examiner conducting a live oral viva / rapid-fire mock exam for ${params.targetExam} in the subject of "${params.subject}" (Difficulty: ${params.difficulty}).
Generate Question 1 out of ${totalQ}. Make the question direct, conceptual, and practical. Keep the question under 35 words. Return ONLY the question text.`;

    const nextQ = await callLlmChat([
      { role: 'system', content: 'You are an official competitive examination board member.' },
      { role: 'user', content: prompt }
    ], 0.7);

    return {
      nextQuestion: nextQ.replace(/^(Question 1:?|Q1:?)\s*/i, '').trim(),
      isComplete: false
    };
  }

  // Evaluate previous answer and generate next question or final summary
  const evalPrompt = `You are an official examiner for ${params.targetExam} (${params.subject}).
Previous Question: "${params.previousQuestion}"
Student's Answer: "${params.studentAnswer}"
Current Question Number: ${params.currentQuestionIndex} of ${totalQ}

Tasks:
1. Evaluate the answer strictly and award marks from 0 to 10.
2. Provide a 2-sentence feedback explaining what was correct and what was missed.
3. Provide the ideal concise model answer.
${isFinalQuestion 
  ? '4. Since this is the final question, provide a comprehensive final performance verdict (Strengths, Weaknesses, Recommended Study Areas).' 
  : `4. Formulate Question ${params.currentQuestionIndex + 1} of ${totalQ}, testing a slightly more challenging concept.`
}

Return your response strictly in the following JSON format:
{
  "scoreAwarded": <number between 0 and 10>,
  "maxMarks": 10,
  "feedback": "<concise constructive feedback>",
  "correctAnswer": "<concise ideal model answer>",
  ${isFinalQuestion 
    ? '"finalSummary": "<overall performance verdict with score analysis and preparation tips>"'
    : '"nextQuestion": "<next clear mock exam question>"'
  }
}`;

  const responseText = await callLlmChat([
    { role: 'system', content: 'You evaluate exam candidates strictly and output only valid JSON.' },
    { role: 'user', content: evalPrompt }
  ], 0.5);

  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        scoreAwarded: typeof parsed.scoreAwarded === 'number' ? parsed.scoreAwarded : 7,
        maxMarks: 10,
        feedback: parsed.feedback || 'Good effort with room for deeper conceptual precision.',
        correctAnswer: parsed.correctAnswer || 'Standard reference solution.',
        nextQuestion: parsed.nextQuestion || (isFinalQuestion ? undefined : 'What is the primary governing formula for this scenario?'),
        isComplete: isFinalQuestion,
        finalSummary: parsed.finalSummary
      };
    }
  } catch (e) {
    console.error('Failed to parse mock drill JSON response', e);
  }

  return {
    scoreAwarded: 7,
    maxMarks: 10,
    feedback: 'Your response captured key points but lacked comprehensive precision.',
    correctAnswer: 'The standard formula applies directly here.',
    nextQuestion: isFinalQuestion ? undefined : 'Explain the primary advantage of this approach in exam time constraints.',
    isComplete: isFinalQuestion,
    finalSummary: isFinalQuestion ? 'Mock session completed with consistent attempt quality. Focus on speed and core formula retention.' : undefined
  };
}
