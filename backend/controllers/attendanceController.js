const Attendance = require('../models/Attendance');
const { getDbStatus } = require('../config/db');
const { memoryStore, saveSeed } = require('./employeeController');

const getAttendanceLogs = async (req, res, next) => {
  try {
    const dbStatus = getDbStatus();
    if (dbStatus.connected) {
      const logs = await Attendance.find().sort('-createdAt');
      return res.status(200).json(logs);
    }
    res.status(200).json(memoryStore.attendance || []);
  } catch (err) {
    next(err);
  }
};

const clockIn = async (req, res, next) => {
  try {
    const { employeeId, employeeName, department } = req.body;
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = now.toTimeString().slice(0, 8);

    // Late if arriving after 09:30 AM
    const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 30);

    const newRecord = {
      _id: 'att-' + Date.now(),
      employeeId: employeeId || 'TF-EMP-101',
      employeeName: employeeName || 'Employee',
      department: department || 'Engineering',
      date: dateStr,
      checkIn: timeStr,
      checkOut: '--:--',
      status: isLate ? 'Late' : 'Present',
      workingHours: 'In Progress',
    };

    if (!memoryStore.attendance) memoryStore.attendance = [];
    memoryStore.attendance.unshift(newRecord);
    if (saveSeed) saveSeed();

    res.status(201).json(newRecord);
  } catch (err) {
    next(err);
  }
};

const clockOut = async (req, res, next) => {
  try {
    const { id } = req.params;
    const now = new Date();
    const timeStr = now.toTimeString().slice(0, 8);

    const log = (memoryStore.attendance || []).find((a) => a._id === id || a.employeeId === id);
    if (log) {
      log.checkOut = timeStr;
      if (log.checkIn && log.checkIn !== '--:--') {
        const [inH, inM] = log.checkIn.split(':').map(Number);
        const [outH, outM] = timeStr.split(':').map(Number);
        let diffHrs = (outH + outM / 60) - (inH + inM / 60);
        if (diffHrs < 0) diffHrs += 24;
        log.workingHours = Number(Math.max(0.1, diffHrs).toFixed(1));
      } else {
        log.workingHours = 8.0;
      }
      if (saveSeed) saveSeed();
      return res.status(200).json(log);
    }
    res.status(404).json({ message: 'Attendance record not found' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAttendanceLogs, clockIn, clockOut };
