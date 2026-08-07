import express from 'express';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import { 
  getStudentDashboard, 
  getStudentResults, 
  saveStudentResult 
} from '../controllers/student.controller.js';

const router = express.Router();

// All student endpoints require authenticated JWT
router.use(authenticateJWT);

router.get('/dashboard', getStudentDashboard);
router.get('/results', getStudentResults);
router.post('/results', saveStudentResult);

export default router;
