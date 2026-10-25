const express = require('express');
const router = express.Router();
const { 
  login, 
  register, 
  getApprovals, 
  updateApprovalStatus,
  forgotPassword,
  verifyOtp,
  resetPassword 
} = require('../controllers/authController');

router.post('/login', login);
router.post('/register', register);
router.get('/approvals', getApprovals);
router.put('/approvals/:id', updateApprovalStatus);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);

module.exports = router;
