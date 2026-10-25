const mongoose = require('mongoose');

// Unit 5: Task Model
const taskSchema = new mongoose.Schema(
  {
    taskId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    projectCode: {
      type: String,
      required: true,
    },
    assignedTo: {
      type: String, // Employee Name or ID
      required: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Todo', 'In Progress', 'Review', 'Done'],
      default: 'Todo',
    },
    dueDate: {
      type: Date,
    },
    estimatedHours: {
      type: Number,
      default: 4,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
