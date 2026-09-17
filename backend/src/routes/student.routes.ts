import { Router } from 'express';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import {
  getStudentDashboard,
  getAvailableExams,
  getExamByCode,
  getCbtExam,
  startOrRecoverAttempt,
  saveAttemptProgress,
  submitExamAttempt,
  logProctoringEvent,
  getStudentResults,
  getResultById,
  getExamReview,
  saveStudentResult,
  generateAiMockTest,
  getStudentPyqs,
  getStudentProfile,
  updateStudentProfile,
  getLatestAiCoachReport,
  getAiCoachReportByResultId,
  chatWithAiCoach,
  generateWeakAreaMockTest,
  chatWithUniversalAiCoach,
  handleMockExamDrill,
  getAiCoachStatus
} from '../controllers/student.controller.js';

const router = Router();

router.use(authenticateJWT);

// Student Dashboard & Analytics
router.get('/dashboard', getStudentDashboard);

// Rexam AI Performance Coach & Chatbot
router.get('/ai-coach/status', getAiCoachStatus);
router.get('/ai-coach/latest', getLatestAiCoachReport);
router.get('/ai-coach/report/:resultId', getAiCoachReportByResultId);
router.post('/ai-coach/chat', chatWithAiCoach);
router.post('/ai-coach/generate-weak-mock', generateWeakAreaMockTest);

// Universal AI Coach & Real-Time Mocking Drill
router.post('/ai-chat/message', chatWithUniversalAiCoach);
router.post('/ai-chat/mock-turn', handleMockExamDrill);

// Exams & CBT Engine
router.get('/exams', getAvailableExams);
router.get('/exams/code/:code', getExamByCode);
router.get('/exams/:id', getCbtExam);
router.post('/exams/:id/start', startOrRecoverAttempt);
router.post('/exams/:id/save', saveAttemptProgress);
router.post('/exams/:id/submit', submitExamAttempt);
router.get('/exams/:id/review/:resultId', getExamReview);

// AI Proctoring
router.post('/proctoring/log', logProctoringEvent);

// Results & History
router.get('/results', getStudentResults);
router.get('/results/:id', getResultById);
router.get('/results/:id/review', getExamReview);
router.post('/results', saveStudentResult);

// AI Mock Test Generator & PYQs
router.post('/ai-mock/generate', generateAiMockTest);
router.get('/pyqs', getStudentPyqs);

// Profile Management
router.get('/profile', getStudentProfile);
router.put('/profile', updateStudentProfile);

export default router;
