const express = require('express');
const router = express.Router();
const { getProjects, createProject, updateProjectProgress } = require('../controllers/projectController');

router.route('/')
  .get(getProjects)
  .post(createProject);

router.route('/:id/progress')
  .patch(updateProjectProgress);

module.exports = router;
