const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  title: { type: String, required: true, trim: true },
  credits: { type: Number, required: true, min: 1, max: 6 },
  department: { type: String, required: true, trim: true },
  semester: { type: Number, required: true, min: 1, max: 8 }
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);