const mongoose = require('mongoose');

const gradeRecordSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  semester: { type: Number, required: true },
  internalMarks: { type: Number, required: true, min: 0, max: 20 },
  assignmentMarks: { type: Number, required: true, min: 0, max: 10 },
  practicalMarks: { type: Number, required: true, min: 0, max: 20 },
  externalMarks: { type: Number, required: true, min: 0, max: 50 },
  totalMarks: { type: Number },
  grade: { type: String, enum: ['O', 'A+', 'A', 'B+', 'B', 'C', 'F'] },
  status: { type: String, enum: ['Pass', 'Fail'] }
}, { timestamps: true });

gradeRecordSchema.pre('save', function(next) {
  this.totalMarks = (this.internalMarks || 0) + (this.assignmentMarks || 0) + (this.practicalMarks || 0) + (this.externalMarks || 0);
  
  if (this.totalMarks >= 90) this.grade = 'O';
  else if (this.totalMarks >= 80) this.grade = 'A+';
  else if (this.totalMarks >= 70) this.grade = 'A';
  else if (this.totalMarks >= 60) this.grade = 'B+';
  else if (this.totalMarks >= 50) this.grade = 'B';
  else if (this.totalMarks >= 40) this.grade = 'C';
  else this.grade = 'F';

  this.status = this.grade === 'F' ? 'Fail' : 'Pass';
  next();
});

module.exports = mongoose.model('GradeRecord', gradeRecordSchema);