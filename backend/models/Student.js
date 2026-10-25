const mongoose = require('mongoose');

// Unit 5: Mongoose Schema Definition with Types, Validations and Defaults
const studentSchema = new mongoose.Schema(
  {
    rollNumber: {
      type: String,
      required: [true, 'Roll Number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, 'Student Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      enum: {
        values: ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil'],
        message: '{VALUE} is not a supported department',
      },
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: [1, 'Semester cannot be less than 1'],
      max: [8, 'Semester cannot be more than 8'],
    },
    gpa: {
      type: Number,
      min: [0, 'GPA cannot be negative'],
      max: [10, 'GPA cannot exceed 10.0'],
      default: 0.0,
    },
    skills: {
      type: [String],
      default: ['JavaScript', 'React'],
    },
    status: {
      type: String,
      enum: ['Active', 'Graduated', 'Suspended'],
      default: 'Active',
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// Virtual property for academic standing
studentSchema.virtual('academicStanding').get(function () {
  if (this.gpa >= 8.5) return 'Distinction';
  if (this.gpa >= 7.0) return 'First Class';
  if (this.gpa >= 5.5) return 'Second Class';
  return 'Pass';
});

module.exports = mongoose.model('Student', studentSchema);
