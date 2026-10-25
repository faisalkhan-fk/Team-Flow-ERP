const Student = require('../models/Student');
const { getDbStatus } = require('../config/db');
const path = require('path');
const fs = require('fs');

// Path to fallback local JSON store
const fallbackDataPath = path.join(__dirname, '../data/initialStudents.json');

// Helper to get fallback data
const loadFallbackData = () => {
  try {
    if (fs.existsSync(fallbackDataPath)) {
      return JSON.parse(fs.readFileSync(fallbackDataPath, 'utf8'));
    }
  } catch (e) {
    console.error('Error reading fallback json:', e);
  }
  return [];
};

// In-memory array initialized from fallback JSON
let memoryStudents = loadFallbackData();

// @desc    Get all students with query filters, search, and select projection
// @route   GET /api/students
// @unit    Unit 5: Select Command, Querying & REST APIs
const getStudents = async (req, res, next) => {
  try {
    const { department, search, select, sortBy } = req.query;
    const dbStatus = getDbStatus();

    if (dbStatus.connected) {
      // Real Mongoose Query
      let queryObj = {};

      if (department && department !== 'All') {
        queryObj.department = department;
      }

      if (search) {
        queryObj.$or = [
          { name: { $regex: search, $options: 'i' } },
          { rollNumber: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ];
      }

      let query = Student.find(queryObj);

      // Unit 5: "Working with Select Command" (Projection)
      if (select) {
        const fields = select.split(',').join(' ');
        query = query.select(fields);
      }

      // Sorting
      if (sortBy) {
        query = query.sort(sortBy);
      } else {
        query = query.sort('-createdAt');
      }

      const students = await query;
      return res.status(200).json({
        success: true,
        count: students.length,
        dataSource: 'MongoDB via Mongoose',
        data: students,
      });
    }

    // Fallback In-Memory Query with exact same functionality
    let filtered = [...memoryStudents];

    if (department && department !== 'All') {
      filtered = filtered.filter((s) => s.department === department);
    }

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.rollNumber.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'gpa_desc') {
      filtered.sort((a, b) => b.gpa - a.gpa);
    } else if (sortBy === 'gpa_asc') {
      filtered.sort((a, b) => a.gpa - b.gpa);
    } else {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    res.status(200).json({
      success: true,
      count: filtered.length,
      dataSource: 'Built-in Storage (MongoDB Offline / Ready for Atlas)',
      data: filtered,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single student by ID
// @route   GET /api/students/:id
const getStudentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const dbStatus = getDbStatus();

    if (dbStatus.connected) {
      const student = await Student.findById(id);
      if (!student) {
        return res.status(404).json({ success: false, error: 'Student not found with id ' + id });
      }
      return res.status(200).json({ success: true, data: student });
    }

    const student = memoryStudents.find((s) => s._id === id || s.rollNumber === id);
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found with id ' + id });
    }

    res.status(200).json({ success: true, data: student });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new student
// @route   POST /api/students
// @unit    Unit 5: Building API endpoints & Inserting Records
const createStudent = async (req, res, next) => {
  try {
    const { rollNumber, name, email, department, semester, gpa, skills } = req.body;

    // Basic Validation
    if (!rollNumber || !name || !email || !department) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: rollNumber, name, email, and department are required',
      });
    }

    const dbStatus = getDbStatus();

    if (dbStatus.connected) {
      const newStudent = await Student.create({
        rollNumber,
        name,
        email,
        department,
        semester: Number(semester) || 1,
        gpa: Number(gpa) || 0,
        skills: Array.isArray(skills) ? skills : (skills || '').split(',').map((s) => s.trim()).filter(Boolean),
      });

      return res.status(201).json({
        success: true,
        message: 'Student record created successfully',
        data: newStudent,
      });
    }

    // Check duplicate in fallback
    const exists = memoryStudents.some(
      (s) => s.rollNumber.toLowerCase() === rollNumber.toLowerCase() || s.email.toLowerCase() === email.toLowerCase()
    );
    if (exists) {
      return res.status(409).json({
        success: false,
        error: `Student with roll number ${rollNumber} or email ${email} already exists`,
      });
    }

    const newRecord = {
      _id: 'mem_' + Date.now(),
      rollNumber: rollNumber.toUpperCase(),
      name,
      email: email.toLowerCase(),
      department,
      semester: Number(semester) || 1,
      gpa: Number(gpa) || 0,
      skills: Array.isArray(skills) ? skills : (skills || '').split(',').map((s) => s.trim()).filter(Boolean),
      status: 'Active',
      createdAt: new Date().toISOString(),
    };

    memoryStudents.unshift(newRecord);

    res.status(201).json({
      success: true,
      message: 'Student record created successfully',
      data: newRecord,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update student record
// @route   PUT /api/students/:id
// @unit    Unit 5: Updating Records
const updateStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const dbStatus = getDbStatus();

    if (dbStatus.connected) {
      const updated = await Student.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!updated) {
        return res.status(404).json({ success: false, error: 'Student not found with id ' + id });
      }

      return res.status(200).json({
        success: true,
        message: 'Student updated successfully',
        data: updated,
      });
    }

    const index = memoryStudents.findIndex((s) => s._id === id || s.rollNumber === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Student not found with id ' + id });
    }

    memoryStudents[index] = {
      ...memoryStudents[index],
      ...req.body,
      semester: req.body.semester ? Number(req.body.semester) : memoryStudents[index].semester,
      gpa: req.body.gpa !== undefined ? Number(req.body.gpa) : memoryStudents[index].gpa,
      updatedAt: new Date().toISOString(),
    };

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: memoryStudents[index],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete student record
// @route   DELETE /api/students/:id
// @unit    Unit 5: Deleting Records
const deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const dbStatus = getDbStatus();

    if (dbStatus.connected) {
      const deleted = await Student.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ success: false, error: 'Student not found with id ' + id });
      }
      return res.status(200).json({
        success: true,
        message: `Student ${deleted.name} (${deleted.rollNumber}) deleted successfully`,
        data: deleted,
      });
    }

    const index = memoryStudents.findIndex((s) => s._id === id || s.rollNumber === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Student not found with id ' + id });
    }

    const removed = memoryStudents.splice(index, 1)[0];
    res.status(200).json({
      success: true,
      message: `Student ${removed.name} (${removed.rollNumber}) deleted successfully`,
      data: removed,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Aggregation Statistics
// @route   GET /api/students/stats/analytics
// @unit    Unit 5: MongoDB Aggregations Pipeline Demo
const getStudentAnalytics = async (req, res, next) => {
  try {
    const dbStatus = getDbStatus();

    if (dbStatus.connected) {
      const stats = await Student.aggregate([
        {
          $group: {
            _id: '$department',
            count: { $sum: 1 },
            avgGpa: { $avg: '$gpa' },
            minGpa: { $min: '$gpa' },
            maxGpa: { $max: '$gpa' },
          },
        },
        { $sort: { count: -1 } },
      ]);

      const overall = await Student.aggregate([
        {
          $group: {
            _id: null,
            totalStudents: { $sum: 1 },
            overallAvgGpa: { $avg: '$gpa' },
          },
        },
      ]);

      return res.status(200).json({
        success: true,
        departmentDistribution: stats,
        overallSummary: overall[0] || { totalStudents: 0, overallAvgGpa: 0 },
      });
    }

    // In-memory aggregation logic matching MongoDB pipeline
    const deptMap = {};
    let totalGpa = 0;

    memoryStudents.forEach((s) => {
      totalGpa += s.gpa;
      if (!deptMap[s.department]) {
        deptMap[s.department] = {
          _id: s.department,
          count: 0,
          totalGpa: 0,
          minGpa: s.gpa,
          maxGpa: s.gpa,
        };
      }
      deptMap[s.department].count += 1;
      deptMap[s.department].totalGpa += s.gpa;
      if (s.gpa < deptMap[s.department].minGpa) deptMap[s.department].minGpa = s.gpa;
      if (s.gpa > deptMap[s.department].maxGpa) deptMap[s.department].maxGpa = s.gpa;
    });

    const departmentDistribution = Object.values(deptMap).map((d) => ({
      _id: d._id,
      count: d.count,
      avgGpa: Number((d.totalGpa / d.count).toFixed(2)),
      minGpa: d.minGpa,
      maxGpa: d.maxGpa,
    }));

    res.status(200).json({
      success: true,
      departmentDistribution,
      overallSummary: {
        totalStudents: memoryStudents.length,
        overallAvgGpa: memoryStudents.length ? Number((totalGpa / memoryStudents.length).toFixed(2)) : 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentAnalytics,
};
