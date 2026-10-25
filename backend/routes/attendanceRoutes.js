const express = require('express');
const router = express.Router();
const { getAttendanceLogs, clockIn, clockOut } = require('../controllers/attendanceController');

router.route('/')
  .get(getAttendanceLogs)
  .post(clockIn);

router.patch('/:id/clockout', clockOut);

module.exports = router;
