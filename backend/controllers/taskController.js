const Task = require('../models/Task');
const { getDbStatus } = require('../config/db');
const { memoryStore, saveSeed } = require('./employeeController');

const getTasks = async (req, res, next) => {
  try {
    const { status, priority, projectCode } = req.query;
    const dbStatus = getDbStatus();

    if (dbStatus.connected) {
      let filter = {};
      if (status && status !== 'All') filter.status = status;
      if (priority && priority !== 'All') filter.priority = priority;
      if (projectCode && projectCode !== 'All') filter.projectCode = projectCode;

      const tasks = await Task.find(filter).sort('-createdAt');
      return res.status(200).json({ success: true, count: tasks.length, data: tasks });
    }

    let list = [...(memoryStore.tasks || [])];
    if (status && status !== 'All') list = list.filter((t) => t.status === status);
    if (priority && priority !== 'All') list = list.filter((t) => t.priority === priority);
    if (projectCode && projectCode !== 'All') list = list.filter((t) => t.projectCode === projectCode);

    res.status(200).json({ success: true, count: list.length, data: list });
  } catch (err) {
    next(err);
  }
};

const createTask = async (req, res, next) => {
  try {
    const { taskId, title, description, projectCode, assignedTo, priority, dueDate, estimatedHours } = req.body;
    const dbStatus = getDbStatus();

    if (dbStatus.connected) {
      const newTask = await Task.create({
        taskId: taskId || 'TSK-' + Math.floor(100 + Math.random() * 900),
        title,
        description,
        projectCode,
        assignedTo,
        priority: priority || 'Medium',
        dueDate,
        estimatedHours: Number(estimatedHours) || 4,
      });
      return res.status(201).json({ success: true, message: 'Task created', data: newTask });
    }

    const newTask = {
      _id: 'tsk_' + Date.now(),
      taskId: taskId || 'TSK-' + Math.floor(100 + Math.random() * 900),
      title,
      description,
      projectCode,
      assignedTo,
      priority: priority || 'Medium',
      status: 'Todo',
      estimatedHours: Number(estimatedHours) || 4,
      dueDate: dueDate || new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    memoryStore.tasks.unshift(newTask);
    if (saveSeed) saveSeed();
    res.status(201).json({ success: true, message: 'Task created', data: newTask });
  } catch (err) {
    next(err);
  }
};

const updateTaskStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, priority, assignedTo } = req.body;
    const dbStatus = getDbStatus();

    if (dbStatus.connected) {
      const updated = await Task.findByIdAndUpdate(
        id,
        { ...(status && { status }), ...(priority && { priority }), ...(assignedTo && { assignedTo }) },
        { new: true, runValidators: true }
      );
      return res.status(200).json({ success: true, data: updated });
    }

    const t = memoryStore.tasks.find((item) => item._id === id || item.taskId === id);
    if (!t) return res.status(404).json({ success: false, error: 'Task not found' });

    if (status) t.status = status;
    if (priority) t.priority = priority;
    if (assignedTo) t.assignedTo = assignedTo;

    if (saveSeed) saveSeed();
    res.status(200).json({ success: true, data: t });
  } catch (err) {
    next(err);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const dbStatus = getDbStatus();

    if (dbStatus.connected) {
      const deleted = await Task.findByIdAndDelete(id);
      return res.status(200).json({ success: true, data: deleted });
    }

    const idx = memoryStore.tasks.findIndex((item) => item._id === id || item.taskId === id);
    if (idx === -1) return res.status(404).json({ success: false, error: 'Task not found' });

    const removed = memoryStore.tasks.splice(idx, 1)[0];
    if (saveSeed) saveSeed();
    res.status(200).json({ success: true, data: removed });
  } catch (err) {
    next(err);
  }
};

module.exports = { getTasks, createTask, updateTaskStatus, deleteTask };
