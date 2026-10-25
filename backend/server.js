const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const { connectDB, getDbStatus } = require('./config/db');
const requestLogger = require('./middleware/loggerMiddleware');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const aiRoutes = require('./routes/aiRoutes');
const nodeFsRoutes = require('./routes/nodeFsRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Database Connection
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(requestLogger);

// System Health API
app.get('/api/health', (req, res) => {
  res.status(200).json({
    project: 'TeamFlow ERP',
    version: '2.0.0',
    status: 'ONLINE',
    database: getDbStatus(),
    timestamp: new Date().toISOString(),
  });
});

// Feature API Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api', aiRoutes); // /api/query and /api/notifications
app.use('/api/reports', nodeFsRoutes);
app.use('/api/node-fs', nodeFsRoutes);

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  🚀 TeamFlow ERP Server running on http://localhost:${PORT}`);
  console.log(`=======================================================`);
});

module.exports = app;
