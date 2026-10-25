const Leave = require('../models/Leave');
const { getDbStatus } = require('../config/db');
const { memoryStore, saveSeed } = require('./employeeController');

const getLeaves = async (req, res, next) => {
  try {
    const dbStatus = getDbStatus();
    if (dbStatus.connected) {
      const leaves = await Leave.find().sort('-appliedAt');
      return res.status(200).json(leaves);
    }
    res.status(200).json(memoryStore.leaves || []);
  } catch (err) {
    next(err);
  }
};

const applyLeave = async (req, res, next) => {
  try {
    const { employeeId, employeeName, department, leaveType, startDate, endDate, days, reason } = req.body;
    const newLeave = {
      _id: 'lv-' + Date.now(),
      employeeId: employeeId || 'TF-EMP-101',
      employeeName: employeeName || 'Employee',
      department: department || 'Engineering',
      leaveType: leaveType || 'Casual Leave',
      startDate: startDate || new Date().toISOString().slice(0, 10),
      endDate: endDate || new Date().toISOString().slice(0, 10),
      days: Number(days) || 1,
      reason: reason || 'Personal Leave',
      status: 'PENDING',
      appliedAt: new Date().toISOString(),
    };

    if (!memoryStore.leaves) memoryStore.leaves = [];
    memoryStore.leaves.unshift(newLeave);
    if (saveSeed) saveSeed();

    res.status(201).json(newLeave);
  } catch (err) {
    next(err);
  }
};

const updateLeaveStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // APPROVED or REJECTED

    const lv = (memoryStore.leaves || []).find((l) => l._id === id);
    if (lv) {
      lv.status = status;
      if (saveSeed) saveSeed();
      return res.status(200).json(lv);
    }
    res.status(404).json({ message: 'Leave request not found' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getLeaves, applyLeave, updateLeaveStatus };
