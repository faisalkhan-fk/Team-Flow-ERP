const mongoose = require('mongoose');

// Unit 5: Mongoose Schema - Validation, Types, Defaults, and Virtuals
const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, 'Employee Name is required'],
      trim: true,
      minlength: [2, 'Name must have at least 2 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      enum: {
        values: ['Engineering', 'Product', 'Design', 'Marketing', 'Human Resources', 'Finance'],
        message: '{VALUE} is not a valid department',
      },
    },
    role: {
      type: String,
      required: [true, 'Role/Designation is required'],
      trim: true,
    },
    salary: {
      type: Number,
      required: [true, 'Salary is required'],
      min: [10000, 'Salary must be at least 10,000'],
    },
    skills: {
      type: [String],
      default: ['JavaScript', 'React'],
    },
    status: {
      type: String,
      enum: ['Active', 'On Leave', 'Inactive'],
      default: 'Active',
    },
    performanceScore: {
      type: Number,
      min: [1, 'Minimum score is 1'],
      max: [5, 'Maximum score is 5'],
      default: 4.2,
    },
    joinedDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// Virtual: Experience level based on performance score
employeeSchema.virtual('experienceRating').get(function () {
  if (this.performanceScore >= 4.5) return 'Senior / Top Performer';
  if (this.performanceScore >= 3.5) return 'Mid-Level / Consistent';
  return 'Associate / Needs Mentoring';
});

module.exports = mongoose.model('Employee', employeeSchema);
