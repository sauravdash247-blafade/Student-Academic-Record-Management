const router = require('express').Router();
const Course = require('../models/Course');
const GradeRecord = require('../models/GradeRecord');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

router.get('/', verifyToken, async (req, res) => {
  try {
    const { department, semester, search } = req.query;
    let query = {};
    if (department) query.department = department;
    if (semester) query.semester = Number(semester);
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { code: new RegExp(search, 'i') }
      ];
    }
    const courses = await Course.find(query).sort({ department: 1, semester: 1, code: 1 });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', verifyToken, verifyRole(['admin', 'faculty']), async (req, res) => {
  try {
    const newCourse = new Course(req.body);
    await newCourse.save();
    res.status(201).json(newCourse);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Edit Course
router.put('/:id', verifyToken, verifyRole(['admin', 'faculty']), async (req, res) => {
  try {
    const updated = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: 'Course not found.' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete Course with Cascading Clean-up of Transcripts/Grades
router.delete('/:id', verifyToken, verifyRole(['admin']), async (req, res) => {
  try {
    const courseId = req.params.id;
    const deleted = await Course.findByIdAndDelete(courseId);
    if (!deleted) return res.status(404).json({ message: 'Course not found.' });

    await GradeRecord.deleteMany({ course: courseId });
    res.json({ message: 'Course and its associated grade records deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;