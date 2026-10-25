// Unit 4: Routes for Node.js File System & Async Programming
const express = require('express');
const router = express.Router();
const {
  writeFileDemo,
  readFileDemo,
  appendFileDemo,
  deleteFileDemo,
  compareSyncVsAsync,
  listSandboxFiles,
} = require('../controllers/nodeFsController');

router.get('/list', listSandboxFiles);
router.post('/write', writeFileDemo);
router.get('/read', readFileDemo);
router.post('/append', appendFileDemo);
router.delete('/delete', deleteFileDemo);
router.get('/benchmark', compareSyncVsAsync);

module.exports = router;
