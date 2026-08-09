import { Router } from 'express';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import {
  getAdminDashboard,
  extractQuestionsFromDoc,
  createExam,
  getAllExams,
  deleteExam,
  getStudentsList,
  getExamAttempts,
  getProctoringReports,
  getAdminPyqs,
  createPyq
} from '../controllers/admin.controller.js';

const router = Router();

// Protect all admin routes
router.use(authenticateJWT);

router.get('/dashboard', getAdminDashboard);
router.post('/exams/ocr-extract', extractQuestionsFromDoc);
router.post('/exams/create', createExam);
router.get('/exams', getAllExams);
router.delete('/exams/:id', deleteExam);
router.get('/students', getStudentsList);
router.get('/attempts', getExamAttempts);
router.get('/proctoring', getProctoringReports);
router.get('/pyqs', getAdminPyqs);
router.post('/pyqs', createPyq);

export default router;
