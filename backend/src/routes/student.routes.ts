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
  saveStudentResult,
  generateAiMockTest,
  getStudentPyqs,
  getStudentProfile,
  updateStudentProfile,
  getLatestAiCoachReport,
  getAiCoachReportByResultId,
  chatWithAiCoach,
  generateWeakAreaMockTest
} from '../controllers/student.controller.js';

const router = Router();

router.use(authenticateJWT);

// Student Dashboard & Analytics
router.get('/dashboard', getStudentDashboard);

// Rexam AI Performance Coach
router.get('/ai-coach/latest', getLatestAiCoachReport);
router.get('/ai-coach/report/:resultId', getAiCoachReportByResultId);
router.post('/ai-coach/chat', chatWithAiCoach);
router.post('/ai-coach/generate-weak-mock', generateWeakAreaMockTest);

// Exams & CBT Engine
router.get('/exams', getAvailableExams);
router.get('/exams/code/:code', getExamByCode);
router.get('/exams/:id', getCbtExam);
router.post('/exams/:id/start', startOrRecoverAttempt);
router.post('/exams/:id/save', saveAttemptProgress);
router.post('/exams/:id/submit', submitExamAttempt);

// AI Proctoring
router.post('/proctoring/log', logProctoringEvent);

// Results & History
router.get('/results', getStudentResults);
router.get('/results/:id', getResultById);
router.post('/results', saveStudentResult);

// AI Mock Test Generator & PYQs
router.post('/ai-mock/generate', generateAiMockTest);
router.get('/pyqs', getStudentPyqs);

// Profile Management
router.get('/profile', getStudentProfile);
router.put('/profile', updateStudentProfile);

export default router;
