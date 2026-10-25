const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
    },
    employeeName: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    checkIn: {
      type: String, // HH:mm:ss
      required: true,
    },
    checkOut: {
      type: String, // HH:mm:ss
      default: '--:--',
    },
    status: {
      type: String,
      enum: ['Present', 'Late', 'Half Day', 'Absent', 'On Leave'],
      default: 'Present',
    },
    workingHours: {
      type: Number,
      default: 8.0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Attendance', attendanceSchema);
