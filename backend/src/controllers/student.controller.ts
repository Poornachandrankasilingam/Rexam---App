import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { prisma } from '../config/prisma.js';
import { 
  generateAiPerformanceReport, 
  chatWithResultAi, 
  generateAdaptiveWeakMockExam 
} from '../services/aiCoachService.js';
import {
  getAiCoachResponse,
  processMockDrillTurn,
  getAiProviderStatus
} from '../services/aiChatService.js';
import { fastCache } from '../services/cacheService.js';

/**
 * Get Student Dashboard Statistics
 * Strictly user-isolated (userId = req.user.id).
 * Handles clean empty states for 0 exams.
 */
export const getStudentDashboard = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized: User ID missing' });

    const results = await prisma.result.findMany({
      where: { userId },
      include: {
        exam: { select: { title: true, code: true, duration: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const totalExams = results.length;

    if (totalExams === 0) {
      return res.status(200).json({
        user: { id: req.user?.id, name: req.user?.name, email: req.user?.email },
        hasAttemptedExams: false,
        message: "No exams attempted yet.",
        stats: {
          totalExams: 0,
          accuracy: 0,
          avgScore: 0,
          totalCorrect: 0,
          totalWrong: 0,
          totalQuestionsAttempted: 0,
          overallRank: "N/A"
        },
        recentResults: [],
        focusAreas: []
      });
    }

    let totalCorrect = 0;
    let totalWrong = 0;
    let totalScoreSum = 0;
    let totalAccuracySum = 0;

    results.forEach((r) => {
      totalCorrect += r.correct;
      totalWrong += r.incorrect;
      totalScoreSum += r.score;
      totalAccuracySum += r.accuracy;
    });

    const accuracy = Math.round(totalAccuracySum / totalExams);
    const avgScore = Number((totalScoreSum / totalExams).toFixed(1));

    const focusAreasMap: Record<string, { topic: string; correct: number; total: number }> = {};
    results.forEach((r) => {
      const topicName = r.exam?.title || "Aptitude Practice";
      if (!focusAreasMap[topicName]) {
        focusAreasMap[topicName] = { topic: topicName, correct: 0, total: 0 };
      }
      focusAreasMap[topicName].correct += r.correct;
      focusAreasMap[topicName].total += (r.correct + r.incorrect);
    });

    const focusAreas = Object.values(focusAreasMap).map((fa) => {
      const acc = fa.total > 0 ? Math.round((fa.correct / fa.total) * 100) : 0;
      return {
        topic: fa.topic,
        progress: acc,
        status: acc >= 80 ? "Strong" : acc >= 60 ? "Good" : "Needs Practice"
      };
    });

    return res.status(200).json({
      user: { id: req.user?.id, name: req.user?.name, email: req.user?.email },
      hasAttemptedExams: true,
      stats: {
        totalExams,
        accuracy,
        avgScore,
        totalCorrect,
        totalWrong,
        totalQuestionsAttempted: totalCorrect + totalWrong,
        overallRank: `#${Math.max(1, 1500 - totalExams * 50)}`
      },
      recentResults: results.map((r) => ({
        id: r.id,
        examTitle: r.exam?.title || "Custom Practice Test",
        code: r.exam?.code || "PRACTICE",
        score: r.score,
        totalMarks: r.totalMarks,
        correct: r.correct,
        incorrect: r.incorrect,
        accuracy: r.accuracy,
        timeSpentSeconds: r.timeSpent,
        date: r.createdAt
      })),
      focusAreas
    });
  } catch (error: any) {
    console.error('❌ Error fetching student dashboard:', error);
    return res.status(500).json({ message: 'Failed to fetch dashboard', error: error.message });
  }
};

/**
 * Get Available Published Exams for Students
 */
export const getAvailableExams = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const cacheKey = 'student:exams:available';
    const cached = fastCache.get<any[]>(cacheKey);
    if (cached) {
      return res.status(200).json({ exams: cached });
    }

    const exams = await prisma.exam.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { questions: true } }
      }
    });

    const formatted = exams.map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description,
      code: e.code,
      duration: e.duration,
      totalMarks: e.totalMarks,
      passingMarks: e.passingMarks,
      totalQuestions: e._count.questions,
      createdAt: e.createdAt
    }));

    fastCache.set(cacheKey, formatted, 20); // Cache for 20 seconds

    return res.status(200).json({ exams: formatted });
  } catch (error: any) {
    console.error('❌ Error fetching available exams:', error);
    return res.status(500).json({ message: 'Failed to fetch available exams', error: error.message });
  }
};

/**
 * Find Exam by Code (e.g. REX-84920)
 */
export const getExamByCode = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const codeStr = String(req.params.code || "").toUpperCase().trim();
    const exam = await prisma.exam.findUnique({
      where: { code: codeStr },
      include: {
        questions: {
          select: { id: true }
        }
      }
    });

    if (!exam) {
      return res.status(404).json({ message: `No exam found with code "${codeStr}"` });
    }

    return res.status(200).json({
      exam: {
        id: exam.id,
        title: exam.title,
        description: exam.description,
        code: exam.code,
        duration: exam.duration,
        totalMarks: exam.totalMarks,
        totalQuestions: exam.questions.length
      }
    });
  } catch (error: any) {
    console.error('❌ Error fetching exam by code:', error);
    return res.status(500).json({ message: 'Failed to fetch exam by code', error: error.message });
  }
};

/**
 * Get CBT Exam Full Payload (Questions, Options)
 */
export const getCbtExam = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const examId = String(req.params.id);
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        questions: {
          include: {
            options: {
              select: { id: true, text: true }
            }
          }
        }
      }
    });

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    return res.status(200).json({ exam });
  } catch (error: any) {
    console.error('❌ Error fetching CBT exam details:', error);
    return res.status(500).json({ message: 'Failed to load exam payload', error: error.message });
  }
};

/**
 * Start or Recover Exam Attempt (Auto-Save & Reload Recovery)
 */
export const startOrRecoverAttempt = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const examId = String(req.params.id);

    let attempt = await prisma.examAttempt.findFirst({
      where: { userId, examId, status: 'IN_PROGRESS' },
      orderBy: { updatedAt: 'desc' }
    });

    if (!attempt) {
      const exam = await prisma.exam.findUnique({ where: { id: examId } });
      if (!exam) return res.status(404).json({ message: 'Exam not found' });

      attempt = await prisma.examAttempt.create({
        data: {
          userId,
          examId,
          savedAnswersJson: JSON.stringify({}),
          timeRemainingSec: exam.duration * 60,
          status: 'IN_PROGRESS'
        }
      });
    }

    return res.status(200).json({
      attemptId: attempt.id,
      savedAnswers: JSON.parse(attempt.savedAnswersJson || '{}'),
      timeRemainingSec: attempt.timeRemainingSec
    });
  } catch (error: any) {
    console.error('❌ Error starting attempt:', error);
    return res.status(500).json({ message: 'Failed to initialize CBT attempt', error: error.message });
  }
};

/**
 * Save CBT Progress (Auto-save draft answers)
 */
export const saveAttemptProgress = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const examId = String(req.params.id);
    const { answers, timeRemainingSec } = req.body;

    await prisma.examAttempt.updateMany({
      where: { userId, examId, status: 'IN_PROGRESS' },
      data: {
        savedAnswersJson: JSON.stringify(answers || {}),
        timeRemainingSec: Number(timeRemainingSec || 0),
        updatedAt: new Date()
      }
    });

    return res.status(200).json({ message: 'Progress saved successfully' });
  } catch (error: any) {
    console.error('❌ Error saving CBT progress:', error);
    return res.status(500).json({ message: 'Failed to save progress', error: error.message });
  }
};

/**
 * Submit CBT Exam Attempt and Grade Answers
 */
export const submitExamAttempt = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const examId = String(req.params.id);
    const { answers = {}, timeSpentSec = 0 } = req.body;

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        questions: {
          include: { options: true }
        }
      }
    });

    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    let correct = 0;
    let incorrect = 0;
    let unanswered = 0;
    let earnedMarks = 0;

    const detailedExplanations: Array<{
      questionId: string;
      questionText: string;
      userOptionId: string | null;
      correctOptionId: string | null;
      isCorrect: boolean;
      explanation: string;
    }> = [];

    exam.questions.forEach((q: any) => {
      const selectedOptionId = answers[q.id] || null;
      const correctOption = q.options.find((o: any) => o.isCorrect);
      const correctOptionId = correctOption ? correctOption.id : null;

      if (!selectedOptionId) {
        unanswered++;
        detailedExplanations.push({
          questionId: q.id,
          questionText: q.text,
          userOptionId: null,
          correctOptionId,
          isCorrect: false,
          explanation: q.explanation || "No answer recorded."
        });
      } else if (selectedOptionId === correctOptionId) {
        correct++;
        earnedMarks += q.marks;
        detailedExplanations.push({
          questionId: q.id,
          questionText: q.text,
          userOptionId: selectedOptionId,
          correctOptionId,
          isCorrect: true,
          explanation: q.explanation || "Correct answer!"
        });
      } else {
        incorrect++;
        earnedMarks -= (q.negativeMarks || 0);
        detailedExplanations.push({
          questionId: q.id,
          questionText: q.text,
          userOptionId: selectedOptionId,
          correctOptionId,
          isCorrect: false,
          explanation: q.explanation || "Incorrect selection."
        });
      }
    });

    const totalAttempted = correct + incorrect;
    const accuracy = totalAttempted > 0 ? Math.round((correct / totalAttempted) * 100) : 0;
    const finalScore = Math.max(0, Number(earnedMarks.toFixed(2)));

    // Create Result Record
    const newResult = await prisma.result.create({
      data: {
        userId,
        examId,
        score: finalScore,
        totalMarks: exam.totalMarks,
        correct,
        incorrect,
        accuracy,
        timeSpent: Number(timeSpentSec || 0),
        analysis: JSON.stringify({
          unanswered,
          totalQuestions: exam.questions.length,
          explanations: detailedExplanations
        })
      }
    });

    // Mark Attempt as SUBMITTED
    await prisma.examAttempt.updateMany({
      where: { userId, examId, status: 'IN_PROGRESS' },
      data: { status: 'SUBMITTED' }
    });

    // Log Activity
    await prisma.activityLog.create({
      data: {
        userId,
        action: `Submitted CBT Exam "${exam.title}" with score ${finalScore}/${exam.totalMarks}`
      }
    });

    // Automatically generate and persist AI Performance Report
    let aiReportData = null;
    try {
      aiReportData = await generateAiPerformanceReport(userId, newResult.id);
    } catch (aiErr) {
      console.warn('⚠️ AI Performance Report generation warning:', aiErr);
    }

    return res.status(201).json({
      message: 'Exam submitted successfully',
      resultId: newResult.id,
      score: finalScore,
      totalMarks: exam.totalMarks,
      correct,
      incorrect,
      unanswered,
      accuracy,
      timeSpent: timeSpentSec,
      explanations: detailedExplanations,
      aiReport: aiReportData
    });
  } catch (error: any) {
    console.error('❌ Error submitting exam:', error);
    return res.status(500).json({ message: 'Failed to submit exam', error: error.message });
  }
};

/**
 * Log AI Proctoring Malpractice Event
 */
export const logProctoringEvent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { examId, eventType, riskScore = 10, details } = req.body;

    const log = await prisma.proctoringLog.create({
      data: {
        userId,
        examId: examId ? String(examId) : "GLOBAL",
        eventType: eventType || "SUSPICIOUS_BEHAVIOR",
        riskScore: Number(riskScore),
        details: details || "Proctoring violation captured"
      }
    });

    return res.status(201).json({ message: 'Proctoring event logged', logId: log.id });
  } catch (error: any) {
    console.error('❌ Error logging proctoring event:', error);
    return res.status(500).json({ message: 'Failed to log proctoring event', error: error.message });
  }
};

/**
 * Get Student Results History & Specific Result Detail
 */
export const getStudentResults = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const results = await prisma.result.findMany({
      where: { userId },
      include: {
        exam: { select: { title: true, code: true, totalMarks: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({
      results: results.map((r) => ({
        id: r.id,
        examTitle: r.exam?.title || "Practice Test",
        code: r.exam?.code || "PRACTICE",
        score: r.score,
        totalMarks: r.totalMarks,
        correct: r.correct,
        incorrect: r.incorrect,
        accuracy: r.accuracy,
        timeSpent: `${Math.floor(r.timeSpent / 60)} mins`,
        date: r.createdAt
      }))
    });
  } catch (error: any) {
    console.error('❌ Error fetching student results:', error);
    return res.status(500).json({ message: 'Failed to fetch results', error: error.message });
  }
};

export const getResultById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const resultId = String(req.params.id);
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

    if (!result) return res.status(404).json({ message: 'Result not found' });

    let analysisObj: any = {};
    try {
      analysisObj = JSON.parse(result.analysis || '{}');
    } catch (e) {
      analysisObj = {};
    }

    return res.status(200).json({
      result: {
        id: result.id,
        examTitle: result.exam ? result.exam.title : "Practice Test",
        code: result.exam ? result.exam.code : "PRACTICE",
        score: result.score,
        totalMarks: result.totalMarks,
        correct: result.correct,
        incorrect: result.incorrect,
        unanswered: analysisObj.unanswered || 0,
        accuracy: result.accuracy,
        timeSpentSeconds: result.timeSpent,
        createdAt: result.createdAt,
        explanations: analysisObj.explanations || [],
        questions: result.exam ? result.exam.questions : []
      }
    });
  } catch (error: any) {
    console.error('❌ Error fetching result by ID:', error);
    return res.status(500).json({ message: 'Failed to fetch result detail', error: error.message });
  }
};

/**
 * Save Custom Test Result (from practice mode)
 */
export const saveStudentResult = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { examId, examTitle, score, totalMarks, correct, incorrect, timeSpent } = req.body;

    let targetExamId = examId ? String(examId) : "";

    if (!targetExamId) {
      const code = `CUSTOM-${Date.now().toString().slice(-6)}`;
      const exam = await prisma.exam.create({
        data: {
          code,
          title: examTitle || "Custom Practice Test",
          duration: Math.ceil((timeSpent || 300) / 60),
          totalMarks: totalMarks || 50,
          passingMarks: Math.round((totalMarks || 50) * 0.4),
          createdById: userId
        }
      });
      targetExamId = exam.id;
    }

    const totalAns = (correct || 0) + (incorrect || 0);
    const calculatedAccuracy = totalAns > 0 ? Math.round(((correct || 0) / totalAns) * 100) : 0;

    const newResult = await prisma.result.create({
      data: {
        userId,
        examId: targetExamId,
        score: Number(score || 0),
        totalMarks: Number(totalMarks || 50),
        correct: Number(correct || 0),
        incorrect: Number(incorrect || 0),
        accuracy: calculatedAccuracy,
        timeSpent: Number(timeSpent || 0)
      },
      include: { exam: { select: { title: true, code: true } } }
    });

    return res.status(201).json({ message: 'Test result saved', result: newResult });
  } catch (error: any) {
    console.error('❌ Error saving result:', error);
    return res.status(500).json({ message: 'Failed to save result', error: error.message });
  }
};

/**
 * AI Mock Test Generator Endpoint
 */
export const generateAiMockTest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { category = "SSC CGL", subject = "General Awareness", difficulty = "MEDIUM", count = 10 } = req.body;
    const numQuestions = Math.min(100, Math.max(5, Number(count || 10)));

    const questions = Array.from({ length: numQuestions }, (_, i) => ({
      id: `ai-q-${i + 1}`,
      text: `[${category} - ${subject}] Question ${i + 1}: Which of the following statements is true regarding ${subject} topic #${i + 1}?`,
      subject,
      difficulty,
      marks: 1,
      negativeMarks: 0.25,
      explanation: `Solution for Question ${i + 1}: Concept based on ${category} syllabus for ${subject}.`,
      options: [
        { id: `opt-${i}-a`, text: `Concept Option A for Q${i + 1}`, isCorrect: true },
        { id: `opt-${i}-b`, text: `Concept Option B for Q${i + 1}`, isCorrect: false },
        { id: `opt-${i}-c`, text: `Concept Option C for Q${i + 1}`, isCorrect: false },
        { id: `opt-${i}-d`, text: `Concept Option D for Q${i + 1}`, isCorrect: false }
      ]
    }));

    return res.status(200).json({
      mockTest: {
        title: `AI Mock Test: ${category} (${subject})`,
        description: `${numQuestions} AI generated questions covering ${subject} at ${difficulty} level.`,
        category,
        subject,
        difficulty,
        duration: Math.ceil(numQuestions * 1.5),
        totalMarks: numQuestions,
        questions
      }
    });
  } catch (error: any) {
    console.error('❌ AI Mock Generator Error:', error);
    return res.status(500).json({ message: 'Failed to generate AI mock test', error: error.message });
  }
};

/**
 * Previous Year Papers (PYQ Bank) for Students
 */
export const getStudentPyqs = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { exam, year } = req.query;

    const where: any = {};
    if (exam && typeof exam === 'string' && exam !== 'ALL') {
      where.examName = { contains: exam };
    }
    if (year && typeof year === 'string' && year !== 'ALL') {
      where.year = Number(year);
    }

    const pyqs = await prisma.pyqBank.findMany({
      where,
      orderBy: { year: 'desc' }
    });

    return res.status(200).json({ pyqs });
  } catch (error: any) {
    console.error('❌ Get PYQ Error:', error);
    return res.status(500).json({ message: 'Failed to fetch PYQs', error: error.message });
  }
};

/**
 * User Profile Management
 */
export const getStudentProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, phone: true, institute: true, role: true, createdAt: true }
    });

    return res.status(200).json({ user });
  } catch (error: any) {
    console.error('❌ Get Profile Error:', error);
    return res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
  }
};

export const updateStudentProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { name, phone, institute } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name, phone, institute },
      select: { id: true, name: true, email: true, phone: true, institute: true, role: true }
    });

    return res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error: any) {
    console.error('❌ Update Profile Error:', error);
    return res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
};

/**
 * Get Latest AI Performance Coach Report for Logged-in Student
 */
export const getLatestAiCoachReport = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized: User ID missing' });

    // Find latest completed exam result for this user
    const latestResult = await prisma.result.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        exam: { select: { title: true, code: true, duration: true, totalMarks: true } }
      }
    });

    if (!latestResult) {
      return res.status(200).json({
        hasAttemptedExams: false,
        message: "Complete your first exam to unlock AI performance analysis.",
        readinessScore: 0,
        readinessLevel: "Needs Improvement",
        performanceLevel: "Needs Improvement",
        strengths: [],
        weaknesses: [],
        criticalTopics: [],
        subjectAnalysis: [],
        topicAnalysis: [],
        mistakeAnalysis: [],
        recommendations: ["Complete your first CBT mock test to establish baseline performance."],
        studyPlan: [],
        trendSummary: "No exam history recorded yet."
      });
    }

    const report = await generateAiPerformanceReport(userId, latestResult.id);

    return res.status(200).json({
      hasAttemptedExams: true,
      report
    });
  } catch (error: any) {
    console.error('❌ AI Coach Latest Report Error:', error);
    return res.status(500).json({ message: 'Failed to generate AI performance report', error: error.message });
  }
};

/**
 * Get AI Performance Coach Report for Specific Result ID
 */
export const getAiCoachReportByResultId = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const resultId = String(req.params.resultId);
    const report = await generateAiPerformanceReport(userId, resultId);

    return res.status(200).json({
      hasAttemptedExams: true,
      report
    });
  } catch (error: any) {
    console.error('❌ AI Coach Specific Report Error:', error);
    return res.status(500).json({ message: 'Failed to generate AI performance report for this result', error: error.message });
  }
};

/**
 * Ask AI About My Result (Chat with Result Coach)
 */
export const chatWithAiCoach = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { message, resultId } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ message: 'A valid question message is required.' });
    }

    const aiReply = await chatWithResultAi(userId, message.trim(), resultId);

    return res.status(200).json({
      reply: aiReply,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('❌ AI Coach Chat Error:', error);
    return res.status(500).json({ message: 'Failed to process AI chat query', error: error.message });
  }
};

/**
 * Practice My Weak Areas - Generate Adaptive Mock Test
 */
export const generateWeakAreaMockTest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const generatedExam = await generateAdaptiveWeakMockExam(userId);

    return res.status(201).json({
      message: 'Adaptive weak area booster exam generated successfully',
      exam: generatedExam
    });
  } catch (error: any) {
    console.error('❌ Weak Area Mock Generator Error:', error);
    return res.status(500).json({ message: 'Failed to generate weak area adaptive test', error: error.message });
  }
};

/**
 * Universal AI Coach Chat (Doubt Solving, Strategy, Step-by-Step proofs)
 */
export const chatWithUniversalAiCoach = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { message, chatHistory, targetExam } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ message: 'Message text is required' });
    }

    const reply = await getAiCoachResponse(message.trim(), chatHistory || [], {
      name: req.user?.name,
      targetExam: targetExam || 'Competitive Exam'
    });

    return res.status(200).json({
      reply,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error('❌ Universal AI Coach Chat Error:', err);
    return res.status(500).json({ message: 'Failed to process AI chat query', error: err.message });
  }
};

/**
 * Real-Time AI Mocking & Viva Examiner Drill Turn
 */
export const handleMockExamDrill = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      targetExam,
      subject,
      difficulty,
      totalQuestions,
      currentQuestionIndex,
      previousQuestion,
      studentAnswer,
      history
    } = req.body;

    const turnResult = await processMockDrillTurn({
      targetExam: targetExam || 'SSC CGL',
      subject: subject || 'Quantitative Aptitude',
      difficulty: difficulty || 'MEDIUM',
      totalQuestions: totalQuestions || 5,
      currentQuestionIndex: typeof currentQuestionIndex === 'number' ? currentQuestionIndex : 0,
      previousQuestion,
      studentAnswer,
      history
    });

    return res.status(200).json(turnResult);
  } catch (err: any) {
    console.error('❌ Mock Exam Drill Error:', err);
    return res.status(500).json({ message: 'Failed to process mock exam turn', error: err.message });
  }
};

/**
 * Get AI Coach Engine Connection & Model Status
 */
export const getAiCoachStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const cacheKey = 'ai:engine:status';
    const cached = fastCache.get<any>(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    const status = getAiProviderStatus();
    const payload = {
      success: true,
      ...status,
      timestamp: new Date().toISOString()
    };

    fastCache.set(cacheKey, payload, 60); // Cache for 60 seconds

    return res.status(200).json(payload);
  } catch (err: any) {
    console.error('❌ AI Coach Status Error:', err);
    return res.status(500).json({ message: 'Failed to retrieve AI coach status', error: err.message });
  }
};


