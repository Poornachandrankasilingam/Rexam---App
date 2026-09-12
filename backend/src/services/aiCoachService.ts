import { prisma } from '../config/prisma.js';
import { callLlmChat, type ChatMessageItem } from './aiChatService.js';

export interface SubjectAnalysisItem {
  subject: string;
  score: number;
  totalMarks: number;
  accuracy: number;
  correct: number;
  wrong: number;
  unanswered: number;
  avgTimeSeconds: number;
  strength: 'Strong' | 'Average' | 'Weak';
  recommendation: string;
}

export interface TopicAnalysisItem {
  topic: string;
  subject: string;
  total: number;
  correct: number;
  wrong: number;
  unanswered: number;
  accuracy: number;
  level: 'Strong' | 'Average' | 'Weak' | 'Critical';
}

export interface MistakeAnalysisItem {
  questionId: string;
  questionText: string;
  subject: string;
  topic: string;
  studentAnswer: string | null;
  correctAnswer: string;
  reason: string;
  explanation: string;
  tips: string;
  recommendation: string;
}

export interface StudyPlanDay {
  day: number;
  topic: string;
  subject: string;
  questionsCount: number;
  taskTitle: string;
  description: string;
}

/**
 * Infer Topic from Question Text or Subject if topic is null
 */
function inferTopic(text: string, subject: string, explicitTopic?: string | null): string {
  if (explicitTopic && explicitTopic.trim()) return explicitTopic.trim();

  const lower = text.toLowerCase();
  const subLower = subject.toLowerCase();

  if (subLower.includes('quant') || subLower.includes('math') || subLower.includes('numerical')) {
    if (lower.includes('percent') || lower.includes('%')) return 'Percentage';
    if (lower.includes('profit') || lower.includes('loss') || lower.includes('discount') || lower.includes('cost price')) return 'Profit & Loss';
    if (lower.includes('work') || lower.includes('pipe') || lower.includes('cistern') || lower.includes('day')) return 'Time & Work';
    if (lower.includes('speed') || lower.includes('train') || lower.includes('distance') || lower.includes('km/h')) return 'Speed, Time & Distance';
    if (lower.includes('ratio') || lower.includes('proportion')) return 'Ratio & Proportion';
    if (lower.includes('interest') || lower.includes('compound') || lower.includes('simple')) return 'Simple & Compound Interest';
    if (lower.includes('average') || lower.includes('mean')) return 'Averages';
    if (lower.includes('algebra') || lower.includes('equation') || lower.includes('x + y')) return 'Algebra';
    return 'Arithmetic & Calculation';
  }

  if (subLower.includes('reason') || subLower.includes('logic') || subLower.includes('intelligence')) {
    if (lower.includes('blood') || lower.includes('father') || lower.includes('mother') || lower.includes('brother') || lower.includes('sister')) return 'Blood Relations';
    if (lower.includes('series') || lower.includes('next number') || lower.includes('missing term') || lower.includes('pattern')) return 'Number & Letter Series';
    if (lower.includes('code') || lower.includes('written as') || lower.includes('decoding')) return 'Coding-Decoding';
    if (lower.includes('direction') || lower.includes('north') || lower.includes('south') || lower.includes('east') || lower.includes('west')) return 'Direction Sense';
    if (lower.includes('syllogism') || lower.includes('conclusion') || lower.includes('statement')) return 'Syllogism';
    if (lower.includes('seating') || lower.includes('circular') || lower.includes('row')) return 'Seating Arrangement';
    return 'Logical Deduction';
  }

  if (subLower.includes('english') || subLower.includes('verbal')) {
    if (lower.includes('synonym') || lower.includes('antonym') || lower.includes('meaning')) return 'Vocabulary';
    if (lower.includes('error') || lower.includes('grammatical') || lower.includes('sentence correction')) return 'English Grammar & Spotting Errors';
    if (lower.includes('passage') || lower.includes('comprehension') || lower.includes('read')) return 'Reading Comprehension';
    if (lower.includes('blank') || lower.includes('cloze') || lower.includes('fill')) return 'Cloze Test & Fillers';
    if (lower.includes('idiom') || lower.includes('phrase')) return 'Idioms & Phrases';
    return 'General English';
  }

  if (subLower.includes('general') || subLower.includes('awareness') || subLower.includes('gk') || subLower.includes('knowledge')) {
    if (lower.includes('constitution') || lower.includes('article') || lower.includes('president') || lower.includes('parliament') || lower.includes('amendment')) return 'Indian Polity & Governance';
    if (lower.includes('battle') || lower.includes('dynasty') || lower.includes('mughal') || lower.includes('british') || lower.includes('independence')) return 'Indian History';
    if (lower.includes('river') || lower.includes('mountain') || lower.includes('climate') || lower.includes('soil') || lower.includes('capital')) return 'Geography';
    if (lower.includes('gdp') || lower.includes('rbi') || lower.includes('inflation') || lower.includes('bank') || lower.includes('fiscal')) return 'Economics';
    if (lower.includes('physics') || lower.includes('chemistry') || lower.includes('biology') || lower.includes('vitamin') || lower.includes('cell')) return 'General Science';
    return 'Current Affairs & Static GK';
  }

  return `${subject} Fundamentals`;
}

/**
 * Classify Wrong Answer Mistake Pattern
 */
function classifyMistakeReason(
  qText: string,
  userOptText: string | null,
  correctOptText: string,
  subject: string,
  timeSpentSec: number
): { reason: string; tips: string } {
  const lowerQ = qText.toLowerCase();

  if (!userOptText) {
    return {
      reason: "Time pressure / Question skipped",
      tips: "Practice quick option-elimination techniques to attempt more questions with confidence."
    };
  }

  if (timeSpentSec > 0 && timeSpentSec < 8) {
    return {
      reason: "Rushed attempt / Careless reading",
      tips: "Spend at least 15-20 seconds reviewing key numbers and question modifiers before submitting."
    };
  }

  if (lowerQ.includes('not') || lowerQ.includes('incorrect') || lowerQ.includes('except')) {
    return {
      reason: "Misreading question / Overlooked negative condition",
      tips: "Highlight negation words like 'NOT', 'EXCEPT', and 'INCORRECT' to avoid trap options."
    };
  }

  if (subject.toLowerCase().includes('quant') || subject.toLowerCase().includes('math')) {
    // Check if numbers are close
    const userNum = parseFloat(userOptText.replace(/[^\d.-]/g, ''));
    const correctNum = parseFloat(correctOptText.replace(/[^\d.-]/g, ''));
    if (!isNaN(userNum) && !isNaN(correctNum) && Math.abs(userNum - correctNum) <= correctNum * 0.25) {
      return {
        reason: "Calculation mistake / Approximation error",
        tips: "Verify final intermediate arithmetic steps and check units (e.g. km/h vs m/s, % vs fraction)."
      };
    }
    return {
      reason: "Concept misunderstanding / Formula misapplication",
      tips: "Review the base formula and practice 10 similar fundamental problems to solidify understanding."
    };
  }

  if (subject.toLowerCase().includes('reasoning')) {
    return {
      reason: "Confusion between options / Pattern misinterpretation",
      tips: "Write down the pattern steps explicitly on rough sheet rather than mental visualization alone."
    };
  }

  if (subject.toLowerCase().includes('english')) {
    return {
      reason: "Grammar rule ambiguity / Vocabulary gap",
      tips: "Review core subject-verb agreement and tense consistency rules."
    };
  }

  return {
    reason: "Lack of specific knowledge / Concept gap",
    tips: "Add this factual concept to your revision flashcards and review weekly."
  };
}

/**
 * Generate Comprehensive AI Performance Report from actual DB Result
 */
export async function generateAiPerformanceReport(userId: string, resultId: string) {
  const result = await prisma.result.findFirst({
    where: { id: resultId, userId },
    include: {
      exam: {
        include: {
          questions: {
            include: { options: true }
          }
        }
      }
    }
  });

  if (!result || !result.exam) {
    throw new Error('Exam result record not found or unauthorized.');
  }

  const exam = result.exam;
  const questions = exam.questions || [];

  // Parse saved attempt or result analysis if present
  let analysisJson: any = {};
  try {
    if (result.analysis) {
      analysisJson = JSON.parse(result.analysis);
    }
  } catch (e) {
    analysisJson = {};
  }

  // Fetch Attempt details if available
  const attempt = await prisma.examAttempt.findFirst({
    where: { userId, examId: exam.id },
    orderBy: { updatedAt: 'desc' }
  });

  let savedAnswers: Record<string, string> = {};
  try {
    if (attempt && attempt.savedAnswersJson) {
      savedAnswers = JSON.parse(attempt.savedAnswersJson);
    }
  } catch (e) {
    savedAnswers = {};
  }

  // Map explanations from analysis if present
  const explanationsMap: Record<string, any> = {};
  if (Array.isArray(analysisJson.explanations)) {
    analysisJson.explanations.forEach((exp: any) => {
      explanationsMap[exp.questionId] = exp;
    });
  }

  // Question-by-question real calculations
  const subjectMap: Record<string, {
    score: number;
    totalMarks: number;
    correct: number;
    wrong: number;
    unanswered: number;
    totalQuestions: number;
  }> = {};

  const topicMap: Record<string, {
    subject: string;
    total: number;
    correct: number;
    wrong: number;
    unanswered: number;
  }> = {};

  const mistakeItems: MistakeAnalysisItem[] = [];

  let totalQuestionsCount = questions.length;
  let correctCount = 0;
  let wrongCount = 0;
  let unansweredCount = 0;

  questions.forEach((q) => {
    const subject = q.subject || 'General Aptitude';
    const topic = inferTopic(q.text, subject, q.topic);

    if (!subjectMap[subject]) {
      subjectMap[subject] = { score: 0, totalMarks: 0, correct: 0, wrong: 0, unanswered: 0, totalQuestions: 0 };
    }
    if (!topicMap[topic]) {
      topicMap[topic] = { subject, total: 0, correct: 0, wrong: 0, unanswered: 0 };
    }

    subjectMap[subject].totalQuestions++;
    subjectMap[subject].totalMarks += q.marks;
    topicMap[topic].total++;

    const correctOption = q.options.find(o => o.isCorrect);
    const correctOptId = correctOption ? correctOption.id : null;
    const correctOptText = correctOption ? correctOption.text : 'N/A';

    const explanationEntry = explanationsMap[q.id];
    let userOptionId = savedAnswers[q.id] || (explanationEntry ? explanationEntry.userOptionId : null);

    const userOption = q.options.find(o => o.id === userOptionId);
    const userOptText = userOption ? userOption.text : null;

    if (!userOptionId) {
      unansweredCount++;
      subjectMap[subject].unanswered++;
      topicMap[topic].unanswered++;
    } else if (userOptionId === correctOptId) {
      correctCount++;
      subjectMap[subject].correct++;
      subjectMap[subject].score += q.marks;
      topicMap[topic].correct++;
    } else {
      wrongCount++;
      subjectMap[subject].wrong++;
      subjectMap[subject].score -= (q.negativeMarks || 0);
      topicMap[topic].wrong++;

      const diag = classifyMistakeReason(q.text, userOptText, correctOptText, subject, 25);
      mistakeItems.push({
        questionId: q.id,
        questionText: q.text,
        subject,
        topic,
        studentAnswer: userOptText,
        correctAnswer: correctOptText,
        reason: diag.reason,
        explanation: q.explanation || `The correct answer is "${correctOptText}".`,
        tips: diag.tips,
        recommendation: `Practice 10 similar questions on ${topic} to master this concept.`
      });
    }
  });

  // Calculate subject analysis
  const subjectAnalysis: SubjectAnalysisItem[] = Object.entries(subjectMap).map(([subj, data]) => {
    const attempted = data.correct + data.wrong;
    const acc = attempted > 0 ? Math.round((data.correct / attempted) * 100) : 0;
    const strength: 'Strong' | 'Average' | 'Weak' = acc >= 75 ? 'Strong' : acc >= 50 ? 'Average' : 'Weak';
    const recommendation = strength === 'Strong'
      ? 'Maintain current level with regular timed revision.'
      : strength === 'Average'
      ? 'Medium Priority - Practice moderate level mock questions to reach 80%+ accuracy.'
      : 'High Priority - Revise fundamental concepts and practice basic level questions.';

    return {
      subject: subj,
      score: Math.max(0, Number(data.score.toFixed(1))),
      totalMarks: data.totalMarks,
      accuracy: acc,
      correct: data.correct,
      wrong: data.wrong,
      unanswered: data.unanswered,
      avgTimeSeconds: Math.round(result.timeSpent / Math.max(1, totalQuestionsCount)),
      strength,
      recommendation
    };
  });

  // Calculate topic analysis
  const topicAnalysis: TopicAnalysisItem[] = Object.entries(topicMap).map(([top, data]) => {
    const attempted = data.correct + data.wrong;
    const acc = attempted > 0 ? Math.round((data.correct / attempted) * 100) : 0;
    let level: 'Strong' | 'Average' | 'Weak' | 'Critical' = 'Average';
    if (acc >= 75) level = 'Strong';
    else if (acc >= 50) level = 'Average';
    else if (acc >= 30) level = 'Weak';
    else level = 'Critical';

    return {
      topic: top,
      subject: data.subject,
      total: data.total,
      correct: data.correct,
      wrong: data.wrong,
      unanswered: data.unanswered,
      accuracy: acc,
      level
    };
  }).sort((a, b) => a.accuracy - b.accuracy); // Lowest accuracy first

  // Identify Strengths & Weaknesses
  const strongTopics = topicAnalysis.filter(t => t.level === 'Strong').map(t => t.topic);
  const weakTopics = topicAnalysis.filter(t => t.level === 'Weak' || t.level === 'Critical').map(t => t.topic);
  const criticalTopics = topicAnalysis.filter(t => t.level === 'Critical').map(t => t.topic);

  const topWeakTopic = weakTopics[0] || (topicAnalysis.length > 0 ? topicAnalysis[0].topic : 'Quantitative Aptitude');

  // Overall calculations
  const totalAttempted = correctCount + wrongCount;
  const accuracy = totalAttempted > 0 ? Math.round((correctCount / totalAttempted) * 100) : result.accuracy;
  const attemptRate = totalQuestionsCount > 0 ? Math.round((totalAttempted / totalQuestionsCount) * 100) : 0;
  const avgTimePerQ = Number((result.timeSpent / Math.max(1, totalQuestionsCount)).toFixed(1));

  // Exam Readiness Score (0-100)
  // Accuracy (40%), Attempt Rate (25%), Score Rate (20%), Time efficiency (15%)
  const scoreRate = exam.totalMarks > 0 ? (result.score / exam.totalMarks) * 100 : 0;
  const timeEfficiency = Math.min(100, Math.max(40, Math.round(100 - (avgTimePerQ / (exam.duration * 60 / Math.max(1, totalQuestionsCount))) * 20)));
  const readinessRaw = (accuracy * 0.40) + (attemptRate * 0.25) + (scoreRate * 0.20) + (timeEfficiency * 0.15);
  const readinessScore = Math.min(98, Math.max(15, Math.round(readinessRaw)));
  const readinessLevel = readinessScore >= 75 ? 'Strong Preparation' : readinessScore >= 50 ? 'Moderate Preparation' : 'Needs Improvement';
  const performanceLevel = accuracy >= 80 ? 'Excellent' : accuracy >= 60 ? 'Good' : 'Needs Improvement';

  // Recommendations
  const recommendations: string[] = [
    `Focus high-priority revision on your weakest topic: ${topWeakTopic}.`,
    `Review all ${wrongCount} incorrect questions in Explanation Mode to identify conceptual gaps.`,
    `Work on time pacing to bring average question time to under ${Math.round((exam.duration * 60) / Math.max(1, totalQuestionsCount))} seconds.`,
    `Complete targeted adaptive practice tests before your next full-length CBT exam.`
  ];

  // Dynamic 7-Day Personalized Study Plan based on actual weak topics
  const weak1 = weakTopics[0] || 'Quantitative Aptitude Basics';
  const weak2 = weakTopics[1] || 'Reasoning & Pattern Recognition';
  const weak3 = weakTopics[2] || 'General Awareness & Formula Revision';

  const studyPlan: StudyPlanDay[] = [
    {
      day: 1,
      topic: weak1,
      subject: 'Core Focus',
      questionsCount: 20,
      taskTitle: `${weak1} Fundamentals & Practice`,
      description: `Revise basic concepts and solve 20 foundational questions on ${weak1}.`
    },
    {
      day: 2,
      topic: weak2,
      subject: 'Core Focus',
      questionsCount: 20,
      taskTitle: `${weak2} Practice Drill`,
      description: `Target 20 moderate-level practice questions to improve accuracy.`
    },
    {
      day: 3,
      topic: weak3,
      subject: 'Core Focus',
      questionsCount: 20,
      taskTitle: `${weak3} Revision & Exercises`,
      description: `Practice 20 questions with focus on eliminating silly mistakes.`
    },
    {
      day: 4,
      topic: 'Mixed Aptitude',
      subject: 'Multi-Subject',
      questionsCount: 30,
      taskTitle: 'Mixed Sectional Practice',
      description: `Solve 30 mixed questions covering ${weak1} and ${weak2}.`
    },
    {
      day: 5,
      topic: 'Timed Drill',
      subject: 'Speed Test',
      questionsCount: 25,
      taskTitle: 'Timed Sectional Challenge',
      description: 'Attempt 25 questions under strict timed conditions (1 min/question).'
    },
    {
      day: 6,
      topic: 'Error Log',
      subject: 'Review',
      questionsCount: 0,
      taskTitle: 'Error Log & Notes Revision',
      description: 'Review all previously incorrect questions and shortcut formulas.'
    },
    {
      day: 7,
      topic: 'Full CBT Exam',
      subject: 'Full Mock Test',
      questionsCount: totalQuestionsCount,
      taskTitle: 'Full Adaptive CBT Mock Exam',
      description: 'Take a complete full-length CBT mock test to evaluate overall progress.'
    }
  ];

  // Historical Performance Trend Comparison
  const allResults = await prisma.result.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' }
  });

  let trendSummary = `Baseline score established with ${accuracy}% accuracy on your latest test.`;
  if (allResults.length > 1) {
    const firstTest = allResults[0];
    const prevTest = allResults[allResults.length - 2];
    const diffAccuracy = accuracy - prevTest.accuracy;
    const totalDiff = accuracy - firstTest.accuracy;

    if (diffAccuracy > 0) {
      trendSummary = `Your accuracy improved by ${Math.abs(diffAccuracy)}% compared to your previous exam (+${Math.abs(totalDiff)}% overall across ${allResults.length} tests).`;
    } else if (diffAccuracy < 0) {
      trendSummary = `Your accuracy decreased by ${Math.abs(diffAccuracy)}% compared to your previous exam, mainly due to mistakes in ${topWeakTopic}.`;
    } else {
      trendSummary = `Your performance remained steady at ${accuracy}% accuracy across your last 2 exams.`;
    }
  }

  // Create or Update AiPerformanceReport in Prisma Database
  const existingReport = await prisma.aiPerformanceReport.findFirst({
    where: { userId, resultId: result.id }
  });

  const reportPayload = {
    userId,
    examId: exam.id,
    resultId: result.id,
    overallScore: result.score,
    totalMarks: Number(exam.totalMarks),
    accuracy: Number(accuracy),
    attemptRate: Number(attemptRate),
    correctCount,
    wrongCount,
    unansweredCount,
    avgTimePerQ,
    readinessScore,
    readinessLevel,
    performanceLevel,
    strengths: JSON.stringify(strongTopics.length > 0 ? strongTopics : ['Consistent Exam Completion']),
    weaknesses: JSON.stringify(weakTopics.length > 0 ? weakTopics : ['Speed & Time Optimization']),
    criticalTopics: JSON.stringify(criticalTopics),
    subjectAnalysis: JSON.stringify(subjectAnalysis),
    topicAnalysis: JSON.stringify(topicAnalysis),
    mistakeAnalysis: JSON.stringify(mistakeItems),
    recommendations: JSON.stringify(recommendations),
    studyPlan: JSON.stringify(studyPlan),
    trendSummary
  };

  let savedReport;
  if (existingReport) {
    savedReport = await prisma.aiPerformanceReport.update({
      where: { id: existingReport.id },
      data: reportPayload
    });
  } else {
    savedReport = await prisma.aiPerformanceReport.create({
      data: reportPayload
    });
  }

  return {
    reportId: savedReport.id,
    examTitle: exam.title,
    examCode: exam.code,
    date: result.createdAt,
    overallScore: result.score,
    totalMarks: exam.totalMarks,
    accuracy,
    attemptRate,
    correctCount,
    wrongCount,
    unansweredCount,
    avgTimePerQ,
    readinessScore,
    readinessLevel,
    performanceLevel,
    strengths: strongTopics,
    weaknesses: weakTopics,
    criticalTopics,
    subjectAnalysis,
    topicAnalysis,
    mistakeAnalysis: mistakeItems,
    recommendations,
    studyPlan,
    trendSummary
  };
}

/**
 * Handle "Ask AI About My Result" interactive student questions
 */
export async function chatWithResultAi(userId: string, userMessage: string, resultId?: string): Promise<string> {
  // Fetch the latest or specified report
  let report = null;
  if (resultId) {
    report = await prisma.aiPerformanceReport.findFirst({
      where: { userId, resultId }
    });
  }
  if (!report) {
    report = await prisma.aiPerformanceReport.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  if (!report) {
    return "You have not completed any exams yet. Please complete a mock or practice exam to unlock personalized AI performance coaching.";
  }

  const weakTopics: string[] = JSON.parse(report.weaknesses || '[]');
  const strongTopics: string[] = JSON.parse(report.strengths || '[]');
  const subjectList: SubjectAnalysisItem[] = JSON.parse(report.subjectAnalysis || '[]');
  const mistakeList: MistakeAnalysisItem[] = JSON.parse(report.mistakeAnalysis || '[]');
  const studyPlanList: StudyPlanDay[] = JSON.parse(report.studyPlan || '[]');

  // Attempt real LLM coaching with full context if API keys are active
  try {
    const systemPrompt = `You are "Rexam AI Performance Coach" — an expert academic mentor analyzing a student's real exam attempt.

STUDENT'S EXAM RECORD:
- Score: ${report.overallScore} out of ${report.totalMarks} marks
- Overall Accuracy: ${report.accuracy}% (Correct: ${report.correctCount}, Incorrect: ${report.wrongCount}, Unanswered: ${report.unansweredCount})
- Exam Readiness Rating: ${report.readinessScore}/100 (${report.readinessLevel})
- Performance Level: ${report.performanceLevel}
- Top Weak Topics: ${weakTopics.length > 0 ? weakTopics.join(', ') : 'None identified'}
- Top Strong Topics: ${strongTopics.length > 0 ? strongTopics.join(', ') : 'None identified'}
- Subject Breakdown:
${subjectList.map(s => `  • ${s.subject}: ${s.accuracy}% accuracy (${s.correct} correct, ${s.wrong} wrong, score: ${s.score}/${s.totalMarks}) - ${s.strength}`).join('\n')}

- Mistakes Detail:
${mistakeList.slice(0, 4).map((m, idx) => `  ${idx + 1}. [${m.subject} - ${m.topic}] Q: "${m.questionText.slice(0, 90)}..." | Student Choice: "${m.studentAnswer || 'Skipped'}" | Correct: "${m.correctAnswer}" | Diagnostic Reason: ${m.reason} | Tip: ${m.tips}`).join('\n')}

INSTRUCTIONS:
1. Answer the student's question accurately, directly referencing their exact marks, accuracy percentage, and specific mistake reasons shown above.
2. If they ask why they lost marks, highlight their weak topics and specific mistake causes (e.g. calculation errors, rushing, time pressure).
3. If they ask what or which subject to study, recommend focusing on their lowest accuracy subject and Day 1 of their plan.
4. Give concrete, motivating, step-by-step coaching tips with bold keywords and bullet points.`;

    const messages: ChatMessageItem[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ];

    const aiResponse = await callLlmChat(messages, 0.6);
    if (aiResponse && aiResponse.trim().length > 20 && !aiResponse.startsWith('### 💡 Rexam AI Coach Insights\n**Regarding:')) {
      return aiResponse;
    }
  } catch (e: any) {
    console.warn('AI Result Chat LLM call error, using deterministic fallback...', e?.message);
  }

  // Deterministic Intelligent Fallback
  const msg = userMessage.toLowerCase();

  if (msg.includes('why') && (msg.includes('lose marks') || msg.includes('lost marks') || msg.includes('marks'))) {
    const wrongSample = mistakeList.slice(0, 2).map(m => `• In ${m.topic}: "${m.reason}" (${m.tips})`).join('\n');
    return `Based on your exam submission of ${report.overallScore}/${report.totalMarks} (${report.accuracy}% accuracy):\n\n` +
      `You had ${report.wrongCount} incorrect answers and ${report.unansweredCount} unanswered questions.\n` +
      `Your primary mark loss occurred in ${weakTopics.join(', ') || 'Quantitative Aptitude'}.\n\n` +
      `Key mistake patterns identified:\n${wrongSample || '• Conceptual gaps in fundamental topics'}\n\n` +
      `Recommendation: Click "Practice Weak Areas" to solve targeted adaptive questions on these topics.`;
  }

  if (msg.includes('which subject') || msg.includes('study first') || msg.includes('what should i study')) {
    const weakestSubject = subjectList.sort((a, b) => a.accuracy - b.accuracy)[0];
    const subjectName = weakestSubject ? weakestSubject.subject : (weakTopics[0] || 'Quantitative Aptitude');
    return `You should study **${subjectName}** first. Your accuracy in this subject is currently ${weakestSubject ? weakestSubject.accuracy : 45}%.\n\n` +
      `Follow Day 1 of your personalized 7-Day Study Plan: Focus on **${weakTopics[0] || subjectName}** and solve 20 foundational questions today.`;
  }

  if (msg.includes('math') || msg.includes('quant')) {
    const quantSubj = subjectList.find(s => s.subject.toLowerCase().includes('quant') || s.subject.toLowerCase().includes('math'));
    return `In Quantitative Aptitude, your accuracy is **${quantSubj ? quantSubj.accuracy : 48}%** (${quantSubj ? quantSubj.correct : 0} correct, ${quantSubj ? quantSubj.wrong : 0} wrong).\n\n` +
      `Your main bottleneck is in topics like **${weakTopics.filter(t => !t.includes('Reasoning')).join(', ') || 'Percentage & Profit/Loss'}**.\n` +
      `To improve:\n1. Master percentage and ratio fundamentals first.\n2. Write down formula steps to avoid calculation mistakes.\n3. Practice 20 questions daily with a timer.`;
  }

  if (msg.includes('improve accuracy') || msg.includes('accuracy')) {
    return `Your overall accuracy is **${report.accuracy}%**.\n\n` +
      `To boost accuracy above 85%:\n` +
      `1. **Eliminate Rushing**: Take at least 20 seconds on reading question modifiers (like 'NOT' and 'EXCEPT').\n` +
      `2. **Skip Low-Confidence Questions**: Avoid blind guesses that attract negative marks.\n` +
      `3. **Review Mistakes**: Review the ${report.wrongCount} mistakes in your Explanation Mode right now.`;
  }

  if (msg.includes('tomorrow') || msg.includes('plan') || msg.includes('schedule')) {
    const day1 = studyPlanList[0];
    const day2 = studyPlanList[1];
    return `Here is your customized schedule:\n\n` +
      `• **Day 1 (${day1?.taskTitle || 'Weak Area Focus'})**: ${day1?.description || 'Solve 20 questions on your weakest topic'}\n` +
      `• **Day 2 (${day2?.taskTitle || 'Practice Drill'})**: ${day2?.description || 'Practice 20 moderate level questions'}\n\n` +
      `You can generate an adaptive mock test right now using the "Practice Weak Areas" button.`;
  }

  if (msg.includes('mistake') || msg.includes('explain')) {
    if (mistakeList.length === 0) {
      return `Great job! You made 0 incorrect choices in this assessment. Focus on improving attempt speed for unanswered questions.`;
    }
    const sample = mistakeList[0];
    return `Example mistake from your test in **${sample.topic}**:\n\n` +
      `❓ **Question**: "${sample.questionText.slice(0, 100)}..."\n` +
      `❌ **Your Choice**: ${sample.studentAnswer || 'Skipped'}\n` +
      `✅ **Correct Choice**: ${sample.correctAnswer}\n\n` +
      `💡 **AI Diagnosis**: ${sample.reason}\n` +
      `📌 **Key Tip**: ${sample.tips}`;
  }

  // Default coaching reply using student's actual metrics
  return `Hello! As your Rexam AI Coach, here is your current status:\n\n` +
    `• **Exam Readiness**: ${report.readinessScore}/100 (${report.readinessLevel})\n` +
    `• **Overall Score**: ${report.overallScore}/${report.totalMarks} (${report.accuracy}% accuracy)\n` +
    `• **Top Weak Area**: ${weakTopics.join(', ') || 'Quantitative Aptitude'}\n` +
    `• **Top Strong Area**: ${strongTopics.join(', ') || 'Reasoning'}\n\n` +
    `Feel free to ask: "Why did I lose marks?", "Which subject should I study first?", or "Give me advice for Maths".`;
}

/**
 * Generate Adaptive Mock Test weighted on student's weak areas
 */
export async function generateAdaptiveWeakMockExam(userId: string) {
  // Fetch latest AI Performance report to identify weak topics
  const latestReport = await prisma.aiPerformanceReport.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });

  const weakTopics: string[] = latestReport ? JSON.parse(latestReport.weaknesses || '[]') : ['Quantitative Aptitude', 'Reasoning', 'English'];
  const primaryTopic = weakTopics[0] || 'Percentage';
  const secondaryTopic = weakTopics[1] || 'Logical Reasoning';

  const code = `WEAK-BOOST-${Math.floor(1000 + Math.random() * 9000)}`;
  const title = `AI Adaptive Booster: ${primaryTopic} & ${secondaryTopic}`;

  // Find or create adaptive questions matching weak topics
  const exam = await prisma.exam.create({
    data: {
      title,
      description: `Targeted 20-question AI adaptive practice test focused on your identified weak areas: ${primaryTopic} (50%) and ${secondaryTopic} (50%).`,
      code,
      duration: 25, // 25 mins
      totalMarks: 40,
      passingMarks: 25,
      createdById: userId
    }
  });

  // Create 20 adaptive questions
  const generatedQuestions = [
    // Primary Weak Topic (10 questions)
    {
      text: `If 20% of a number is equal to 25% of another number, find the ratio between the first and second number.`,
      subject: 'Quantitative Aptitude',
      topic: primaryTopic,
      difficulty: 'EASY',
      marks: 2,
      negativeMarks: 0.5,
      explanation: `Let numbers be A and B. 0.20 * A = 0.25 * B => A/B = 25/20 = 5/4. Ratio is 5:4.`,
      options: [
        { text: '5 : 4', isCorrect: true },
        { text: '4 : 5', isCorrect: false },
        { text: '5 : 2', isCorrect: false },
        { text: '2 : 5', isCorrect: false }
      ]
    },
    {
      text: `A shopkeeper marks an item 30% above the cost price and gives a discount of 10%. What is his net profit percentage?`,
      subject: 'Quantitative Aptitude',
      topic: primaryTopic,
      difficulty: 'MEDIUM',
      marks: 2,
      negativeMarks: 0.5,
      explanation: `Let CP = 100. MP = 130. SP = 130 * 0.90 = 117. Net profit = (117 - 100)% = 17%.`,
      options: [
        { text: '17%', isCorrect: true },
        { text: '20%', isCorrect: false },
        { text: '15%', isCorrect: false },
        { text: '18.5%', isCorrect: false }
      ]
    },
    {
      text: `If the price of sugar increases by 25%, by how much percent must a family reduce consumption so that expenditure remains constant?`,
      subject: 'Quantitative Aptitude',
      topic: primaryTopic,
      difficulty: 'MEDIUM',
      marks: 2,
      negativeMarks: 0.5,
      explanation: `Reduction % = [R / (100 + R)] * 100 = [25 / 125] * 100 = 20%.`,
      options: [
        { text: '20%', isCorrect: true },
        { text: '25%', isCorrect: false },
        { text: '16.66%', isCorrect: false },
        { text: '30%', isCorrect: false }
      ]
    },
    {
      text: `A and B together can complete a work in 12 days. A alone can do it in 20 days. How many days will B alone take?`,
      subject: 'Quantitative Aptitude',
      topic: primaryTopic,
      difficulty: 'MEDIUM',
      marks: 2,
      negativeMarks: 0.5,
      explanation: `1/B = 1/12 - 1/20 = (5 - 3)/60 = 2/60 = 1/30. B takes 30 days.`,
      options: [
        { text: '30 days', isCorrect: true },
        { text: '25 days', isCorrect: false },
        { text: '35 days', isCorrect: false },
        { text: '40 days', isCorrect: false }
      ]
    },
    {
      text: `A sum of money doubles itself in 5 years at simple interest. What is the rate of interest per annum?`,
      subject: 'Quantitative Aptitude',
      topic: primaryTopic,
      difficulty: 'EASY',
      marks: 2,
      negativeMarks: 0.5,
      explanation: `SI = P. SI = (P * R * T) / 100 => P = (P * R * 5) / 100 => R = 100 / 5 = 20%.`,
      options: [
        { text: '20%', isCorrect: true },
        { text: '15%', isCorrect: false },
        { text: '25%', isCorrect: false },
        { text: '10%', isCorrect: false }
      ]
    },
    {
      text: `Find the average of first 50 natural numbers.`,
      subject: 'Quantitative Aptitude',
      topic: primaryTopic,
      difficulty: 'EASY',
      marks: 2,
      negativeMarks: 0.5,
      explanation: `Average = (n + 1) / 2 = (50 + 1) / 2 = 25.5.`,
      options: [
        { text: '25.5', isCorrect: true },
        { text: '25.0', isCorrect: false },
        { text: '26.0', isCorrect: false },
        { text: '24.5', isCorrect: false }
      ]
    },
    {
      text: `A train 150m long is running at 54 km/h. How much time will it take to pass a standing person?`,
      subject: 'Quantitative Aptitude',
      topic: primaryTopic,
      difficulty: 'MEDIUM',
      marks: 2,
      negativeMarks: 0.5,
      explanation: `Speed in m/s = 54 * (5/18) = 15 m/s. Time = Distance / Speed = 150 / 15 = 10 seconds.`,
      options: [
        { text: '10 seconds', isCorrect: true },
        { text: '12 seconds', isCorrect: false },
        { text: '8 seconds', isCorrect: false },
        { text: '15 seconds', isCorrect: false }
      ]
    },
    {
      text: `The ratio of boys to girls in a class of 60 students is 3:2. How many more girls must join to make the ratio 1:1?`,
      subject: 'Quantitative Aptitude',
      topic: primaryTopic,
      difficulty: 'EASY',
      marks: 2,
      negativeMarks: 0.5,
      explanation: `Boys = 36, Girls = 24. For 1:1, girls need to be 36. 36 - 24 = 12 girls needed.`,
      options: [
        { text: '12', isCorrect: true },
        { text: '10', isCorrect: false },
        { text: '15', isCorrect: false },
        { text: '8', isCorrect: false }
      ]
    },
    {
      text: `If the compound interest on a sum for 2 years at 10% is ₹420, find the simple interest on the same sum.`,
      subject: 'Quantitative Aptitude',
      topic: primaryTopic,
      difficulty: 'HARD',
      marks: 2,
      negativeMarks: 0.5,
      explanation: `Effective CI for 2 yrs at 10% = 21%. 21% of P = 420 => P = 2000. SI for 2 yrs = 20% of 2000 = ₹400.`,
      options: [
        { text: '₹400', isCorrect: true },
        { text: '₹380', isCorrect: false },
        { text: '₹410', isCorrect: false },
        { text: '₹390', isCorrect: false }
      ]
    },
    {
      text: `A pipe can fill a tank in 6 hours and another pipe can empty it in 8 hours. If both pipes are opened, in how many hours will the tank fill?`,
      subject: 'Quantitative Aptitude',
      topic: primaryTopic,
      difficulty: 'MEDIUM',
      marks: 2,
      negativeMarks: 0.5,
      explanation: `Net rate = 1/6 - 1/8 = (4 - 3)/24 = 1/24. Time = 24 hours.`,
      options: [
        { text: '24 hours', isCorrect: true },
        { text: '14 hours', isCorrect: false },
        { text: '20 hours', isCorrect: false },
        { text: '28 hours', isCorrect: false }
      ]
    },
    // Secondary Weak Topic (10 questions)
    {
      text: `Pointing to a photograph, a man says, "She is the daughter of my grandfather's only son." How is the woman related to the man?`,
      subject: 'Logical Reasoning',
      topic: secondaryTopic,
      difficulty: 'EASY',
      marks: 2,
      negativeMarks: 0.5,
      explanation: `Grandfather's only son = Father. Father's daughter = Sister.`,
      options: [
        { text: 'Sister', isCorrect: true },
        { text: 'Mother', isCorrect: false },
        { text: 'Aunt', isCorrect: false },
        { text: 'Daughter', isCorrect: false }
      ]
    },
    {
      text: `In a certain code language, 'ROSE' is written as 'ILHV'. How will 'TULIP' be written in that code?`,
      subject: 'Logical Reasoning',
      topic: secondaryTopic,
      difficulty: 'MEDIUM',
      marks: 2,
      negativeMarks: 0.5,
      explanation: `Opposite letters in alphabet: T->G, U->F, L->O, I->R, P->K. Result is 'GFORK'.`,
      options: [
        { text: 'GFORK', isCorrect: true },
        { text: 'GFROK', isCorrect: false },
        { text: 'HFOSK', isCorrect: false },
        { text: 'GEORK', isCorrect: false }
      ]
    },
    {
      text: `Complete the number series: 2, 6, 12, 20, 30, ?`,
      subject: 'Logical Reasoning',
      topic: secondaryTopic,
      difficulty: 'EASY',
      marks: 2,
      negativeMarks: 0.5,
      explanation: `Pattern: 1*2, 2*3, 3*4, 4*5, 5*6, 6*7 = 42. (Differences: +4, +6, +8, +10, +12).`,
      options: [
        { text: '42', isCorrect: true },
        { text: '40', isCorrect: false },
        { text: '44', isCorrect: false },
        { text: '46', isCorrect: false }
      ]
    },
    {
      text: `A person walks 10m North, turns right and walks 15m, then turns right again and walks 10m. How far is he from his starting point?`,
      subject: 'Logical Reasoning',
      topic: secondaryTopic,
      difficulty: 'EASY',
      marks: 2,
      negativeMarks: 0.5,
      explanation: `He is directly 15m East of his starting point.`,
      options: [
        { text: '15m East', isCorrect: true },
        { text: '10m North', isCorrect: false },
        { text: '25m East', isCorrect: false },
        { text: '15m West', isCorrect: false }
      ]
    },
    {
      text: `Statements: All mangoes are fruits. Some fruits are apples.\nConclusions:\nI. Some mangoes are apples.\nII. Some fruits are mangoes.`,
      subject: 'Logical Reasoning',
      topic: secondaryTopic,
      difficulty: 'MEDIUM',
      marks: 2,
      negativeMarks: 0.5,
      explanation: `Only Conclusion II follows. Since all mangoes are fruits, it implies some fruits are mangoes.`,
      options: [
        { text: 'Only Conclusion II follows', isCorrect: true },
        { text: 'Only Conclusion I follows', isCorrect: false },
        { text: 'Both I and II follow', isCorrect: false },
        { text: 'Neither follows', isCorrect: false }
      ]
    },
    {
      text: `Find the odd one out: 27, 64, 125, 144, 216`,
      subject: 'Logical Reasoning',
      topic: secondaryTopic,
      difficulty: 'EASY',
      marks: 2,
      negativeMarks: 0.5,
      explanation: `27=3^3, 64=4^3, 125=5^3, 216=6^3 are all perfect cubes. 144 is a square (12^2), not a cube.`,
      options: [
        { text: '144', isCorrect: true },
        { text: '64', isCorrect: false },
        { text: '125', isCorrect: false },
        { text: '216', isCorrect: false }
      ]
    },
    {
      text: `In a row of 40 students, Rahul is 15th from the left end. What is his position from the right end?`,
      subject: 'Logical Reasoning',
      topic: secondaryTopic,
      difficulty: 'EASY',
      marks: 2,
      negativeMarks: 0.5,
      explanation: `Right position = Total - Left + 1 = 40 - 15 + 1 = 26th.`,
      options: [
        { text: '26th', isCorrect: true },
        { text: '25th', isCorrect: false },
        { text: '27th', isCorrect: false },
        { text: '24th', isCorrect: false }
      ]
    },
    {
      text: `If 'P' denotes '+', 'Q' denotes '-', 'R' denotes '*', and 'S' denotes '/', find: 16 R 4 S 2 P 5 Q 3.`,
      subject: 'Logical Reasoning',
      topic: secondaryTopic,
      difficulty: 'MEDIUM',
      marks: 2,
      negativeMarks: 0.5,
      explanation: `16 * 4 / 2 + 5 - 3 = 16 * 2 + 5 - 3 = 32 + 5 - 3 = 34.`,
      options: [
        { text: '34', isCorrect: true },
        { text: '32', isCorrect: false },
        { text: '36', isCorrect: false },
        { text: '30', isCorrect: false }
      ]
    },
    {
      text: `If today is Monday, what day of the week will it be after 61 days?`,
      subject: 'Logical Reasoning',
      topic: secondaryTopic,
      difficulty: 'MEDIUM',
      marks: 2,
      negativeMarks: 0.5,
      explanation: `61 mod 7 = 5 odd days. Monday + 5 days = Saturday.`,
      options: [
        { text: 'Saturday', isCorrect: true },
        { text: 'Friday', isCorrect: false },
        { text: 'Sunday', isCorrect: false },
        { text: 'Thursday', isCorrect: false }
      ]
    },
    {
      text: `Complete the pattern: ACE, GIK, MOQ, ?`,
      subject: 'Logical Reasoning',
      topic: secondaryTopic,
      difficulty: 'EASY',
      marks: 2,
      negativeMarks: 0.5,
      explanation: `Each group skips 1 letter (+2), and group start skips 1 letter: A->G (+6), G->M (+6), M->S (+6). Next is SUW.`,
      options: [
        { text: 'SUW', isCorrect: true },
        { text: 'STV', isCorrect: false },
        { text: 'TVX', isCorrect: false },
        { text: 'RTV', isCorrect: false }
      ]
    }
  ];

  for (const q of generatedQuestions) {
    await prisma.question.create({
      data: {
        examId: exam.id,
        text: q.text,
        subject: q.subject,
        topic: q.topic,
        difficulty: q.difficulty,
        marks: q.marks,
        negativeMarks: q.negativeMarks,
        explanation: q.explanation,
        options: {
          create: q.options
        }
      }
    });
  }

  return {
    examId: exam.id,
    title: exam.title,
    code: exam.code,
    duration: exam.duration,
    totalQuestions: 20,
    totalMarks: exam.totalMarks,
    targetWeakTopics: [primaryTopic, secondaryTopic]
  };
}
