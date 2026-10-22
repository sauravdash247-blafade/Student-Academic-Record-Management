const router = require('express').Router();
const GradeRecord = require('../models/GradeRecord');
const Student = require('../models/Student');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

// Get grades / transcript for a student (automatically filters out deleted courses & updates CGPA)
router.get('/student/:studentId', verifyToken, async (req, res) => {
  try {
    const studentId = req.params.studentId;

    // Fetch grades populated with course details
    let grades = await GradeRecord.find({ student: studentId }).populate('course');

    // Filter out grade records where the course has been deleted (course === null)
    const validGrades = grades.filter(g => g.course !== null);

    // Remove orphaned grade records from the database
    const orphanedGradeIds = grades.filter(g => g.course === null).map(g => g._id);
    if (orphanedGradeIds.length > 0) {
      await GradeRecord.deleteMany({ _id: { $in: orphanedGradeIds } });
    }

    // Recalculate CGPA based on active courses only
    let totalGradePoints = 0;
    let totalCredits = 0;
    const gradePointsMap = { 'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'F': 0 };

    validGrades.forEach(g => {
      const credits = g.course.credits || 3;
      const gp = gradePointsMap[g.grade] || 0;
      totalGradePoints += gp * credits;
      totalCredits += credits;
    });

    const cgpa = totalCredits > 0 ? Number((totalGradePoints / totalCredits).toFixed(2)) : 0;
    await Student.findByIdAndUpdate(studentId, { cgpa });

    res.json(validGrades);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Explicit Recalculate Endpoint
router.get('/recalculate/:studentId', verifyToken, async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const allGrades = await GradeRecord.find({ student: studentId }).populate('course');
    const validGrades = allGrades.filter(g => g.course !== null);

    let totalGradePoints = 0;
    let totalCredits = 0;
    const gradePointsMap = { 'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'F': 0 };

    validGrades.forEach(g => {
      const credits = g.course.credits || 3;
      const gp = gradePointsMap[g.grade] || 0;
      totalGradePoints += gp * credits;
      totalCredits += credits;
    });

    const cgpa = totalCredits > 0 ? Number((totalGradePoints / totalCredits).toFixed(2)) : 0;
    const updatedStudent = await Student.findByIdAndUpdate(studentId, { cgpa }, { new: true });

    res.json({ message: 'CGPA calculated successfully!', cgpa: updatedStudent.cgpa });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add or update grade for a student in a course
router.post('/', verifyToken, verifyRole(['admin', 'faculty']), async (req, res) => {
  try {
    const { student, course, semester, internalMarks, assignmentMarks, practicalMarks, externalMarks } = req.body;

    let gradeRecord = await GradeRecord.findOne({ student, course });
    if (gradeRecord) {
      gradeRecord.internalMarks = internalMarks;
      gradeRecord.assignmentMarks = assignmentMarks;
      gradeRecord.practicalMarks = practicalMarks;
      gradeRecord.externalMarks = externalMarks;
      gradeRecord.semester = semester;
      await gradeRecord.save();
    } else {
      gradeRecord = new GradeRecord({
        student,
        course,
        semester,
        internalMarks,
        assignmentMarks,
        practicalMarks,
        externalMarks
      });
      await gradeRecord.save();
    }

    // Recalculate student CGPA
    const allGrades = await GradeRecord.find({ student }).populate('course');
    const validGrades = allGrades.filter(g => g.course !== null);

    let totalGradePoints = 0;
    let totalCredits = 0;
    const gradePointsMap = { 'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'F': 0 };

    validGrades.forEach(g => {
      const credits = g.course.credits || 3;
      const gp = gradePointsMap[g.grade] || 0;
      totalGradePoints += gp * credits;
      totalCredits += credits;
    });

    const cgpa = totalCredits > 0 ? Number((totalGradePoints / totalCredits).toFixed(2)) : 0;
    await Student.findByIdAndUpdate(student, { cgpa });

    res.status(201).json({ message: 'Grade recorded & CGPA updated successfully!', gradeRecord });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;