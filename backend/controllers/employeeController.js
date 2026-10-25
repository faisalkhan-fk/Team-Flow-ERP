const Employee = require('../models/Employee');
const { getDbStatus } = require('../config/db');
const path = require('path');
const fs = require('fs');

const seedPath = path.join(__dirname, '../data/seedData.json');
const loadSeed = () => {
  try {
    if (fs.existsSync(seedPath)) {
      return JSON.parse(fs.readFileSync(seedPath, 'utf8'));
    }
  } catch (err) {
    console.error('Error reading seedData.json:', err);
  }
  return { employees: [], projects: [], tasks: [] };
};

let memoryStore = loadSeed();

const saveSeed = () => {
  try {
    fs.writeFileSync(seedPath, JSON.stringify(memoryStore, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving seedData.json:', err);
  }
};

// Function to refresh memoryStore from seedData.json
const reloadStore = () => {
  memoryStore = loadSeed();
};

// @desc    Get all employees (supports search, department filter, select projection, sorting)
// @route   GET /api/employees
// @unit    Unit 5: Select Command, Query Filtering, REST API
const getEmployees = async (req, res, next) => {
  try {
    const { department, search, select, sortBy } = req.query;
    const dbStatus = getDbStatus();

    if (dbStatus.connected) {
      let queryObj = {};
      if (department && department !== 'All') {
        queryObj.department = department;
      }
      if (search) {
        queryObj.$or = [
          { name: { $regex: search, $options: 'i' } },
          { employeeId: { $regex: search, $options: 'i' } },
          { role: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ];
      }

      let query = Employee.find(queryObj);

      // Unit 5: "Working with Select Command"
      if (select) {
        query = query.select(select.split(',').join(' '));
      }

      if (sortBy === 'salary_desc') query = query.sort('-salary');
      else if (sortBy === 'salary_asc') query = query.sort('salary');
      else if (sortBy === 'score_desc') query = query.sort('-performanceScore');
      else query = query.sort('-createdAt');

      const data = await query;
      return res.status(200).json({
        success: true,
        count: data.length,
        dataSource: 'MongoDB via Mongoose',
        data,
      });
    }

    // Auto-sync: Ensure any Approved Employee user from memoryStore.users is in employees roster
    if (memoryStore.users) {
      memoryStore.users.forEach((u) => {
        if (u.role === 'ROLE_EMPLOYEE' && u.status === 'Approved') {
          const exists = memoryStore.employees.some(
            (e) =>
              e.email?.toLowerCase() === u.email?.toLowerCase() ||
              e.name?.toLowerCase() === u.name?.toLowerCase() ||
              (u.alternateEmails && u.alternateEmails.some((ae) => ae.toLowerCase() === e.email?.toLowerCase()))
          );
          if (!exists) {
            memoryStore.employees.push({
              _id: 'emp_' + (u.id || Date.now()),
              employeeId: u.employeeId || 'TF-IND-107',
              name: u.name,
              email: u.email,
              alternateEmails: u.alternateEmails || [],
              department: u.department || 'Engineering',
              role: u.designation || 'Software Engineer',
              salary: 650000,
              pan: 'FKHPS7890M',
              uan: '100987654327',
              bankAccount: '50100456789012',
              ifsc: 'HDFC0001234',
              skills: ['React.js', 'Node.js', 'Express', 'REST APIs'],
              status: 'Active',
              performanceScore: 4.5,
              joinedDate: '2025-02-01T10:00:00.000Z',
              createdAt: '2025-02-01T10:00:00.000Z',
            });
          }
        }
      });
    }

    // In-memory fallback
    let list = [...memoryStore.employees];
    if (department && department !== 'All') {
      list = list.filter((e) => e.department === department);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.employeeId.toLowerCase().includes(q) ||
          e.role.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q)
      );
    }
    if (sortBy === 'salary_desc') list.sort((a, b) => b.salary - a.salary);
    else if (sortBy === 'salary_asc') list.sort((a, b) => a.salary - b.salary);
    else if (sortBy === 'score_desc') list.sort((a, b) => b.performanceScore - a.performanceScore);
    else list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({
      success: true,
      count: list.length,
      dataSource: 'Built-in Storage (MongoDB Ready)',
      data: list,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single employee by ID (supports _id, employeeId, 'me' for logged-in user)
// @route   GET /api/employees/:id
const getEmployeeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email, username, name } = req.query;
    const dbStatus = getDbStatus();

    // Support 'me' or 'my-slip' for logged-in employee
    if (id === 'me' || id === 'my-slip') {
      const targetEmail = (email || '').toLowerCase().trim();
      const targetUser = (username || '').toLowerCase().trim();
      const targetName = (name || '').toLowerCase().trim();

      if (dbStatus.connected) {
        const query = [];
        if (targetEmail) query.push({ email: targetEmail });
        if (targetUser) query.push({ employeeId: targetUser.toUpperCase() });
        if (targetName) query.push({ name: { $regex: new RegExp(`^${targetName}$`, 'i') } });
        if (query.length > 0) {
          const emp = await Employee.findOne({ $or: query });
          if (emp) return res.status(200).json({ success: true, data: emp });
        }
      }

      const emp = (memoryStore.employees || []).find((e) => {
        if (targetEmail && (e.email?.toLowerCase() === targetEmail || (e.alternateEmails && e.alternateEmails.some(ae => ae.toLowerCase() === targetEmail)))) return true;
        if (targetUser && (e.employeeId?.toLowerCase() === targetUser || e.email?.toLowerCase().startsWith(targetUser))) return true;
        if (targetName && e.name?.toLowerCase() === targetName) return true;
        return false;
      });
      if (emp) return res.status(200).json({ success: true, data: emp });
      return res.status(404).json({ success: false, error: 'Employee profile not found for logged-in user' });
    }

    if (dbStatus.connected) {
      let emp = null;
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        emp = await Employee.findById(id);
      }
      if (!emp) {
        emp = await Employee.findOne({
          $or: [
            { employeeId: id.toUpperCase() },
            { employeeId: id },
            { email: id.toLowerCase() }
          ]
        });
      }
      if (!emp) return res.status(404).json({ success: false, error: 'Employee not found' });
      return res.status(200).json({ success: true, data: emp });
    }

    const emp = (memoryStore.employees || []).find(
      (e) =>
        e._id === id ||
        e.employeeId?.toUpperCase() === id.toUpperCase() ||
        e.email?.toLowerCase() === id.toLowerCase()
    );
    if (!emp) return res.status(404).json({ success: false, error: 'Employee not found' });
    res.status(200).json({ success: true, data: emp });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new employee
// @route   POST /api/employees
// @unit    Unit 5 & Unit 3: Inserting Records via POST
const createEmployee = async (req, res, next) => {
  try {
    const { employeeId, name, email, department, role, salary, skills, performanceScore } = req.body;

    if (!employeeId || !name || !email || !department || !role || !salary) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: employeeId, name, email, department, role, and salary are mandatory',
      });
    }

    const dbStatus = getDbStatus();

    if (dbStatus.connected) {
      const newEmp = await Employee.create({
        employeeId,
        name,
        email,
        department,
        role,
        salary: Number(salary),
        skills: Array.isArray(skills) ? skills : (skills || '').split(',').map((s) => s.trim()).filter(Boolean),
        performanceScore: Number(performanceScore) || 4.0,
      });

      return res.status(201).json({
        success: true,
        message: 'Employee created successfully in MongoDB',
        data: newEmp,
      });
    }

    const duplicate = memoryStore.employees.some(
      (e) => e.employeeId.toUpperCase() === employeeId.toUpperCase() || e.email.toLowerCase() === email.toLowerCase()
    );
    if (duplicate) {
      return res.status(409).json({
        success: false,
        error: `Employee with ID '${employeeId}' or email '${email}' already exists.`,
      });
    }

    const newRecord = {
      _id: 'emp_' + Date.now(),
      employeeId: employeeId.toUpperCase(),
      name,
      email: email.toLowerCase(),
      department,
      role,
      salary: Number(salary),
      skills: Array.isArray(skills) ? skills : (skills || '').split(',').map((s) => s.trim()).filter(Boolean),
      status: 'Active',
      performanceScore: Number(performanceScore) || 4.2,
      joinedDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    memoryStore.employees.unshift(newRecord);
    saveSeed();

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: newRecord,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @unit    Unit 5 & Unit 3: Updating Records
const updateEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const dbStatus = getDbStatus();

    if (dbStatus.connected) {
      const updated = await Employee.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!updated) return res.status(404).json({ success: false, error: 'Employee not found' });
      return res.status(200).json({ success: true, message: 'Employee updated successfully', data: updated });
    }

    const idx = memoryStore.employees.findIndex((e) => e._id === id || e.employeeId === id);
    if (idx === -1) return res.status(404).json({ success: false, error: 'Employee not found' });

    memoryStore.employees[idx] = {
      ...memoryStore.employees[idx],
      ...req.body,
      salary: req.body.salary !== undefined ? Number(req.body.salary) : memoryStore.employees[idx].salary,
      performanceScore:
        req.body.performanceScore !== undefined
          ? Number(req.body.performanceScore)
          : memoryStore.employees[idx].performanceScore,
      updatedAt: new Date().toISOString(),
    };

    saveSeed();

    res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: memoryStore.employees[idx],
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @unit    Unit 5 & Unit 3: Deleting Records
const deleteEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const dbStatus = getDbStatus();

    if (dbStatus.connected) {
      const deleted = await Employee.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ success: false, error: 'Employee not found' });
      return res.status(200).json({
        success: true,
        message: `Employee ${deleted.name} (${deleted.employeeId}) removed successfully`,
        data: deleted,
      });
    }

    const idx = memoryStore.employees.findIndex((e) => e._id === id || e.employeeId === id);
    if (idx === -1) return res.status(404).json({ success: false, error: 'Employee not found' });

    const removed = memoryStore.employees.splice(idx, 1)[0];
    // Synchronize: Also remove login user account so deleted employee cannot log in
    if (memoryStore.users && removed) {
      const userIdx = memoryStore.users.findIndex(
        (u) =>
          u.name?.toLowerCase() === removed.name?.toLowerCase() ||
          u.email?.toLowerCase() === removed.email?.toLowerCase() ||
          (u.alternateEmails && u.alternateEmails.some((ae) => ae.toLowerCase() === removed.email?.toLowerCase())) ||
          (u.username && (u.username.toLowerCase() === removed.name.toLowerCase().split(' ')[0] || removed.email?.toLowerCase().includes(u.username.toLowerCase())))
      );
      if (userIdx !== -1) {
        memoryStore.users.splice(userIdx, 1);
      }
    }

    saveSeed();

    res.status(200).json({
      success: true,
      message: `Employee ${removed.name} (${removed.employeeId}) removed successfully`,
      data: removed,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Aggregation Statistics
// @route   GET /api/employees/stats/analytics
// @unit    Unit 5: MongoDB Aggregation Pipeline
const getEmployeeStats = async (req, res, next) => {
  try {
    const dbStatus = getDbStatus();

    if (dbStatus.connected) {
      const deptStats = await Employee.aggregate([
        {
          $group: {
            _id: '$department',
            count: { $sum: 1 },
            avgSalary: { $avg: '$salary' },
            avgScore: { $avg: '$performanceScore' },
            totalPayroll: { $sum: '$salary' },
          },
        },
        { $sort: { count: -1 } },
      ]);

      const totalSummary = await Employee.aggregate([
        {
          $group: {
            _id: null,
            totalEmployees: { $sum: 1 },
            overallPayroll: { $sum: '$salary' },
            avgScore: { $avg: '$performanceScore' },
          },
        },
      ]);

      return res.status(200).json({
        success: true,
        departmentDistribution: deptStats,
        summary: totalSummary[0] || {},
      });
    }

    // In-Memory matching MongoDB aggregation logic
    const deptMap = {};
    let totalPayroll = 0;
    let totalScore = 0;

    memoryStore.employees.forEach((e) => {
      totalPayroll += e.salary;
      totalScore += e.performanceScore;
      if (!deptMap[e.department]) {
        deptMap[e.department] = {
          _id: e.department,
          count: 0,
          totalSalary: 0,
          totalScore: 0,
        };
      }
      deptMap[e.department].count += 1;
      deptMap[e.department].totalSalary += e.salary;
      deptMap[e.department].totalScore += e.performanceScore;
    });

    const departmentDistribution = Object.values(deptMap).map((d) => ({
      _id: d._id,
      count: d.count,
      avgSalary: Math.round(d.totalSalary / d.count),
      avgScore: Number((d.totalScore / d.count).toFixed(2)),
      totalPayroll: d.totalSalary,
    }));

    res.status(200).json({
      success: true,
      departmentDistribution,
      summary: {
        totalEmployees: memoryStore.employees.length,
        overallPayroll: totalPayroll,
        avgScore: memoryStore.employees.length ? Number((totalScore / memoryStore.employees.length).toFixed(2)) : 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeStats,
  memoryStore,
  saveSeed,
};
