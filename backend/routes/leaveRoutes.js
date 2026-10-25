const express = require('express');
const router = express.Router();
const { getLeaves, applyLeave, updateLeaveStatus } = require('../controllers/leaveController');

router.route('/')
  .get(getLeaves)
  .post(applyLeave);

router.patch('/:id/status', updateLeaveStatus);

module.exports = router;
