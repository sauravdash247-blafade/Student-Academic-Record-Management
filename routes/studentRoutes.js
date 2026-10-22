const router = require('express').Router();
const Student = require('../models/Student');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

router.get('/', verifyToken, async (req, res) => {
  try {
    const { department, semester, search, sortBy } = req.query;
    let query = {};
    if (department) query.department = department;
    if (semester) query.semester = Number(semester);
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { rollNumber: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }
    
    let sortOption = { rollNumber: 1 };
    if (sortBy === 'cgpa_desc') sortOption = { cgpa: -1 };
    if (sortBy === 'name_asc') sortOption = { name: 1 };

    const students = await Student.find(query).sort(sortOption);
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', verifyToken, verifyRole(['admin', 'faculty']), async (req, res) => {
  try {
    const newStudent = new Student(req.body);
    await newStudent.save();
    res.status(201).json(newStudent);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Edit Student
router.put('/:id', verifyToken, verifyRole(['admin', 'faculty']), async (req, res) => {
  try {
    const updated = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: 'Student not found.' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', verifyToken, verifyRole(['admin']), async (req, res) => {
  try {
    const deleted = await Student.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Student not found.' });
    res.json({ message: 'Student deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;