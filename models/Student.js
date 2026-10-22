const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  rollNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  department: { type: String, required: true, trim: true },
  semester: { type: Number, required: true, min: 1, max: 8 },
  cgpa: { type: Number, default: 0.0, min: 0, max: 10 },
  attendancePercentage: { type: Number, default: 85, min: 0, max: 100 },
  enrollmentYear: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);