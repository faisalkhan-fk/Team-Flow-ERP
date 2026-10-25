const express = require('express');
const router = express.Router();
const { askAI } = require('../controllers/aiController');
const { memoryStore } = require('../controllers/employeeController');

router.post('/query', askAI);

// Notifications route matching ai-tech-erp
router.get('/notifications', (req, res) => {
  res.json(memoryStore.notifications || []);
});

router.put('/notifications/:id/read', (req, res) => {
  const notif = (memoryStore.notifications || []).find((n) => n.id === req.params.id);
  if (notif) notif.read = true;
  res.json({ success: true });
});

module.exports = router;
