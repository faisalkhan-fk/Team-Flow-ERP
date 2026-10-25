const Department = require('../models/Department');
const { getDbStatus } = require('../config/db');
const { memoryStore, saveSeed } = require('./employeeController');

const getDepartments = async (req, res, next) => {
  try {
    const dbStatus = getDbStatus();
    if (dbStatus.connected) {
      const depts = await Department.find();
      return res.status(200).json(depts);
    }
    res.status(200).json(memoryStore.departments || []);
  } catch (err) {
    next(err);
  }
};

const createDepartment = async (req, res, next) => {
  try {
    const { name, head, budget, location, description } = req.body;
    const dbStatus = getDbStatus();

    if (dbStatus.connected) {
      const created = await Department.create({ name, head, budget, location, description });
      return res.status(201).json(created);
    }

    const newDept = {
      _id: 'dept-' + Date.now(),
      name,
      head: head || 'Unassigned',
      budget: Number(budget) || 2500000,
      location: location || 'Cyber City, Gurugram',
      description: description || '',
    };
    if (!memoryStore.departments) memoryStore.departments = [];
    memoryStore.departments.push(newDept);
    if (saveSeed) saveSeed();
    res.status(201).json(newDept);
  } catch (err) {
    next(err);
  }
};

module.exports = { getDepartments, createDepartment };
