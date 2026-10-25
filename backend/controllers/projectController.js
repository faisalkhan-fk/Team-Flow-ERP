const Project = require('../models/Project');
const { getDbStatus } = require('../config/db');
const { memoryStore, saveSeed } = require('./employeeController');

const getProjects = async (req, res, next) => {
  try {
    const { status, priority, department } = req.query;
    const dbStatus = getDbStatus();

    if (dbStatus.connected) {
      let filter = {};
      if (status && status !== 'All') filter.status = status;
      if (priority && priority !== 'All') filter.priority = priority;
      if (department && department !== 'All') filter.department = department;

      const projects = await Project.find(filter).sort('-createdAt');
      return res.status(200).json({ success: true, count: projects.length, data: projects });
    }

    let list = [...(memoryStore.projects || [])];
    if (status && status !== 'All') list = list.filter((p) => p.status === status);
    if (priority && priority !== 'All') list = list.filter((p) => p.priority === priority);
    if (department && department !== 'All') list = list.filter((p) => p.department === department);

    res.status(200).json({ success: true, count: list.length, data: list });
  } catch (err) {
    next(err);
  }
};

const createProject = async (req, res, next) => {
  try {
    const { projectCode, title, client, department, budget, priority, leadEmployee, deadline } = req.body;
    const dbStatus = getDbStatus();

    if (dbStatus.connected) {
      const p = await Project.create({
        projectCode,
        title,
        client,
        department,
        budget: Number(budget) || 0,
        priority: priority || 'Medium',
        leadEmployee: leadEmployee || 'Unassigned',
        deadline: deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
      return res.status(201).json({ success: true, message: 'Project created', data: p });
    }

    const newProj = {
      _id: 'prj_' + Date.now(),
      projectCode: projectCode.toUpperCase(),
      title,
      client,
      department,
      budget: Number(budget) || 0,
      priority: priority || 'Medium',
      status: 'Planning',
      completionPercentage: 0,
      leadEmployee: leadEmployee || 'Unassigned',
      deadline: deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    };

    memoryStore.projects.unshift(newProj);
    if (saveSeed) saveSeed();
    res.status(201).json({ success: true, message: 'Project created', data: newProj });
  } catch (err) {
    next(err);
  }
};

const updateProjectProgress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { completionPercentage, status } = req.body;
    const dbStatus = getDbStatus();

    if (dbStatus.connected) {
      const updated = await Project.findByIdAndUpdate(
        id,
        { completionPercentage, status },
        { new: true, runValidators: true }
      );
      return res.status(200).json({ success: true, data: updated });
    }

    const p = memoryStore.projects.find((proj) => proj._id === id || proj.projectCode === id);
    if (!p) return res.status(404).json({ success: false, error: 'Project not found' });

    if (completionPercentage !== undefined) p.completionPercentage = Number(completionPercentage);
    if (status) p.status = status;
    if (saveSeed) saveSeed();

    res.status(200).json({ success: true, data: p });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProjects, createProject, updateProjectProgress };
