const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Department name is required'],
      unique: true,
      trim: true,
    },
    head: {
      type: String,
      required: [true, 'Department head is required'],
    },
    budget: {
      type: Number,
      required: true,
      default: 100000,
    },
    location: {
      type: String,
      default: 'Building A, Floor 2',
    },
    description: {
      type: String,
      default: 'Core business operational department',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Department', departmentSchema);
