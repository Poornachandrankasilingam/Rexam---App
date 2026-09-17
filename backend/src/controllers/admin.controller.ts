import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { prisma } from '../config/prisma.js';
import { extractQuestionsFromText } from '../services/ocrExtractionService.js';

/**
 * Helper middleware/check to ensure request is from an ADMIN or SUPER_ADMIN
 */
export const checkAdmin = (req: AuthenticatedRequest, res: Response): boolean => {
  if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN')) {
    res.status(403).json({ message: 'Forbidden: Admin access required' });
    return false;
  }
  return true;
};

/**
 * Admin Dashboard Stats
 */
export const getAdminDashboard = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!checkAdmin(req, res)) return;

    const [totalStudents, totalExams, totalAttempts, totalProctoringLogs] = await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.exam.count(),
      prisma.result.count(),
      prisma.proctoringLog.count()
    ]);

    const recentExams = await prisma.exam.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { questions: true, results: true }
        }
      }
    });

    const recentAttempts = await prisma.result.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        exam: { select: { title: true, code: true } }
      }
    });

    return res.status(200).json({
      stats: {
        totalStudents,
        totalExams,
        totalAttempts,
        totalProctoringLogs
      },
      recentExams: recentExams.map((e) => ({
        id: e.id,
        title: e.title,
        code: e.code,
        duration: e.duration,
        totalMarks: e.totalMarks,
        questionsCount: e._count.questions,
        attemptsCount: e._count.results,
        createdAt: e.createdAt
      })),
      recentAttempts: recentAttempts.map((a) => ({
        id: a.id,
        studentName: a.user.name,
        studentEmail: a.user.email,
        examTitle: a.exam.title,
        examCode: a.exam.code,
        score: a.score,
        totalMarks: a.totalMarks,
        accuracy: a.accuracy,
        date: a.createdAt
      }))
    });
  } catch (error: any) {
    console.error('❌ Admin Dashboard Error:', error);
    return res.status(500).json({ message: 'Failed to fetch admin dashboard stats', error: error.message });
  }
};

/**
 * OCR / Document Question Extraction Processing
 * Accepts text payload or file metadata and parses questions across all languages and formats.
 */
export const extractQuestionsFromDoc = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!checkAdmin(req, res)) return;

    const { textContent, subject = "General Awareness" } = req.body;

    if (!textContent || typeof textContent !== 'string' || textContent.trim().length === 0) {
      return res.status(400).json({ message: 'Content or question paper text is required for OCR processing' });
    }

    const extractionResult = extractQuestionsFromText(textContent, subject);

    if (!extractionResult.success || extractionResult.questions.length === 0) {
      return res.status(422).json({
        message: 'Could not extract structured questions from the provided text. Please check the question format or try again.',
        warnings: extractionResult.warnings
      });
    }

    return res.status(200).json({
      message: `Successfully extracted ${extractionResult.totalExtracted} questions with high accuracy (${extractionResult.detectedLanguage})`,
      detectedLanguage: extractionResult.detectedLanguage,
      totalExtracted: extractionResult.totalExtracted,
      questions: extractionResult.questions,
      rawTextPreview: extractionResult.rawTextPreview,
      warnings: extractionResult.warnings
    });
  } catch (error: any) {
    console.error('❌ OCR Processing Error:', error);
    return res.status(500).json({ message: 'OCR processing failed', error: error.message });
  }
};

/**
 * Create Exam with Code & Questions
 */
export const createExam = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!checkAdmin(req, res)) return;

    const { title, description, duration, totalMarks, passingMarks, questions } = req.body;

    if (!title || !duration) {
      return res.status(400).json({ message: 'Title and duration are required' });
    }

    // Generate unique exam code e.g., REX-84920
    const code = `REX-${Math.floor(10000 + Math.random() * 90000)}`;

    const exam = await prisma.exam.create({
      data: {
        title,
        description: description || "Government Competitive Exam Mock",
        code,
        duration: Number(duration),
        totalMarks: Number(totalMarks || 100),
        passingMarks: Number(passingMarks || 40),
        createdById: req.user!.id,
        questions: {
          create: (questions || []).map((q: any) => ({
            text: q.text,
            subject: q.subject || "General Awareness",
            difficulty: q.difficulty || "MEDIUM",
            marks: Number(q.marks || 1),
            negativeMarks: Number(q.negativeMarks || 0.25),
            explanation: q.explanation || "Detailed solution available after submit.",
            options: {
              create: (q.options || []).map((o: any) => ({
                text: o.text,
                isCorrect: Boolean(o.isCorrect)
              }))
            }
          }))
        }
      },
      include: {
        questions: {
          include: { options: true }
        }
      }
    });

    return res.status(201).json({
      message: 'Exam created and published successfully',
      exam
    });
  } catch (error: any) {
    console.error('❌ Create Exam Error:', error);
    return res.status(500).json({ message: 'Failed to create exam', error: error.message });
  }
};

/**
 * Manage Exams - List all created exams
 */
export const getAllExams = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!checkAdmin(req, res)) return;

    const exams = await prisma.exam.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: { select: { name: true, email: true } },
        _count: { select: { questions: true, results: true } }
      }
    });

    return res.status(200).json({ exams });
  } catch (error: any) {
    console.error('❌ Get Exams Error:', error);
    return res.status(500).json({ message: 'Failed to fetch exams', error: error.message });
  }
};

/**
 * Delete Exam
 */
export const deleteExam = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!checkAdmin(req, res)) return;

    const examId = String(req.params.id);

    // Delete associated relations first
    await prisma.option.deleteMany({ where: { question: { examId } } });
    await prisma.question.deleteMany({ where: { examId } });
    await prisma.result.deleteMany({ where: { examId } });
    await prisma.proctoringLog.deleteMany({ where: { examId } });
    await prisma.examAttempt.deleteMany({ where: { examId } });
    await prisma.exam.delete({ where: { id: examId } });

    return res.status(200).json({ message: 'Exam deleted successfully' });
  } catch (error: any) {
    console.error('❌ Delete Exam Error:', error);
    return res.status(500).json({ message: 'Failed to delete exam', error: error.message });
  }
};

/**
 * Manage Registered Students
 */
export const getStudentsList = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!checkAdmin(req, res)) return;

    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        institute: true,
        createdAt: true,
        _count: { select: { results: true, proctoringLogs: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({ students });
  } catch (error: any) {
    console.error('❌ Get Students Error:', error);
    return res.status(500).json({ message: 'Failed to fetch students list', error: error.message });
  }
};

/**
 * Exam Attempts & Results Overview for Admin
 */
export const getExamAttempts = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!checkAdmin(req, res)) return;

    const attempts = await prisma.result.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        exam: { select: { title: true, code: true, totalMarks: true } }
      }
    });

    return res.status(200).json({ attempts });
  } catch (error: any) {
    console.error('❌ Get Exam Attempts Error:', error);
    return res.status(500).json({ message: 'Failed to fetch exam attempts', error: error.message });
  }
};

/**
 * Proctoring Reports & Malpractice Logs for Admin
 */
export const getProctoringReports = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!checkAdmin(req, res)) return;

    const logs = await prisma.proctoringLog.findMany({
      orderBy: { timestamp: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        exam: { select: { title: true, code: true } }
      }
    });

    return res.status(200).json({ logs });
  } catch (error: any) {
    console.error('❌ Get Proctoring Reports Error:', error);
    return res.status(500).json({ message: 'Failed to fetch proctoring reports', error: error.message });
  }
};

/**
 * Admin PYQ Bank Management
 */
export const getAdminPyqs = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!checkAdmin(req, res)) return;

    const pyqs = await prisma.pyqBank.findMany({
      orderBy: { year: 'desc' },
      include: { _count: { select: { questions: true } } }
    });

    return res.status(200).json({ pyqs });
  } catch (error: any) {
    console.error('❌ Get PYQs Error:', error);
    return res.status(500).json({ message: 'Failed to fetch PYQ list', error: error.message });
  }
};

export const createPyq = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!checkAdmin(req, res)) return;

    const { examName, year, subject, topic } = req.body;

    const pyq = await prisma.pyqBank.create({
      data: {
        examName: examName || "SSC CGL",
        year: Number(year || 2024),
        subject: subject || "General Awareness",
        topic: topic || "Full Length Paper"
      }
    });

    return res.status(201).json({ message: 'PYQ created successfully', pyq });
  } catch (error: any) {
    console.error('❌ Create PYQ Error:', error);
    return res.status(500).json({ message: 'Failed to create PYQ', error: error.message });
  }
};

/**
 * AI Question Generator Endpoint
 * Generates custom test questions in Aptitude, Reasoning, and Verbal Ability
 */
export const generateAiQuestionsHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!checkAdmin(req, res)) return;

    const {
      subject = "Quantitative Aptitude",
      topic,
      difficulty = "MEDIUM",
      count = 5,
      language = "English"
    } = req.body;

    const { generateAiQuestions } = await import('../services/aiQuestionGeneratorService.js');

    const generated = await generateAiQuestions({
      subject,
      topic,
      difficulty,
      count: Number(count) || 5,
      language
    });

    return res.status(200).json({
      message: `Generated ${generated.length} AI questions for ${subject}`,
      questions: generated,
      count: generated.length,
      subject,
      language
    });
  } catch (error: any) {
    console.error('❌ AI Question Generation Error:', error);
    return res.status(500).json({ message: 'Failed to generate AI questions', error: error.message });
  }
};

/**
 * Universal Gemini AI Vision OCR & Document Extractor
 */
export const extractDocumentOcrHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { fileBase64, mimeType = 'image/png', subject = 'General' } = req.body;

    if (!fileBase64) {
      return res.status(400).json({ message: 'fileBase64 data is required' });
    }

    const { extractWithGeminiVision } = await import('../services/ocrExtractionService.js');
    const result = await extractWithGeminiVision(fileBase64, mimeType, subject);

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('❌ OCR Extraction Error:', error);
    return res.status(500).json({ message: 'Failed to extract document', error: error.message });
  }
};
