// Unit 5: Express Router Setup for RESTful APIs
const express = require('express');
const router = express.Router();
const {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentAnalytics,
} = require('../controllers/studentController');

// Aggregation analytics route (placed before :id to prevent matching as id)
router.get('/stats/analytics', getStudentAnalytics);

// RESTful CRUD routes
router.route('/')
  .get(getStudents)      // GET /api/students
  .post(createStudent);  // POST /api/students

router.route('/:id')
  .get(getStudentById)   // GET /api/students/:id
  .put(updateStudent)    // PUT /api/students/:id
  .delete(deleteStudent);// DELETE /api/students/:id

module.exports = router;
