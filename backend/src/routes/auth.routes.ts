import express from 'express';
import { 
  register, 
  login, 
  googleAuth,
  sendOtp, 
  verifyOtp, 
  logout, 
  forgotPassword, 
  resetPassword 
} from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
