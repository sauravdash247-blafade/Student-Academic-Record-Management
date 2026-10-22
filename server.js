const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Course = require('./models/Course');
const Student = require('./models/Student');
const GradeRecord = require('./models/GradeRecord');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// Database Connection & Pre-seeding Courses and Students with Marks
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/student_academic_db';

async function seedDatabase() {
  try {
    // 1. Seed Courses if empty
    const courseCount = await Course.countDocuments();
    if (courseCount === 0) {
      const departments = ['Computer Science', 'Electronics', 'Mechanical', 'Civil'];
      const sampleCourses = [];
      
      departments.forEach(dept => {
        const prefix = dept === 'Computer Science' ? 'CS' : dept === 'Electronics' ? 'EC' : dept === 'Mechanical' ? 'ME' : 'CV';
        for (let sem = 1; sem <= 8; sem++) {
          sampleCourses.push(
            { code: `${prefix}${sem}01`, title: `${dept} Core Subject I (Sem ${sem})`, credits: 4, department: dept, semester: sem },
            { code: `${prefix}${sem}02`, title: `${dept} Core Subject II (Sem ${sem})`, credits: 3, department: dept, semester: sem }
          );
        }
      });

      await Course.insertMany(sampleCourses);
      console.log('Successfully pre-seeded 64 default courses!');
    }

    // 2. Seed Students if empty
    const studentCount = await Student.countDocuments();
    if (studentCount === 0) {
      const studentData = [
        { rollNumber: '1NH23CS139', name: 'Manisha P', email: 'manishaparadesi9@gmail.com', department: 'Computer Science', semester: 7, attendancePercentage: 92, enrollmentYear: 2023 },
        { rollNumber: '1NH23CS121', name: 'Lekhashree R', email: 'lekhashree@college.edu', department: 'Computer Science', semester: 5, attendancePercentage: 88, enrollmentYear: 2023 },
        { rollNumber: '1NH24MS403', name: 'Ashmitha Suma Raj', email: 'ashmitha@college.edu', department: 'Mechanical', semester: 5, attendancePercentage: 90, enrollmentYear: 2024 },
        { rollNumber: '1NH24CV416', name: 'Sahana Hiremath', email: 'sahana.h@college.edu', department: 'Civil', semester: 3, attendancePercentage: 85, enrollmentYear: 2024 },
        { rollNumber: '1NH23CS105', name: 'Manoj P', email: 'manoj@college.edu', department: 'Computer Science', semester: 3, attendancePercentage: 94, enrollmentYear: 2023 },
        { rollNumber: '1NH23EC112', name: 'Jyothi P', email: 'jyothi@college.edu', department: 'Electronics', semester: 4, attendancePercentage: 89, enrollmentYear: 2023 },
        { rollNumber: '1NH23ME104', name: 'Sahana M', email: 'sahana.m@college.edu', department: 'Mechanical', semester: 4, attendancePercentage: 86, enrollmentYear: 2023 },
        { rollNumber: '1NH22CV101', name: 'Madhurima Avancha', email: 'madhurima@college.edu', department: 'Civil', semester: 6, attendancePercentage: 91, enrollmentYear: 2022 },
        { rollNumber: '1NH22CS150', name: 'Mannem Sushmitha', email: 'sushmitha@college.edu', department: 'Computer Science', semester: 6, attendancePercentage: 95, enrollmentYear: 2022 },
        { rollNumber: '1NH24EC201', name: 'Sai Thukaram', email: 'thukaram@college.edu', department: 'Electronics', semester: 2, attendancePercentage: 87, enrollmentYear: 2024 },
        { rollNumber: '1NH24ME202', name: 'Monisha K', email: 'monisha@college.edu', department: 'Mechanical', semester: 2, attendancePercentage: 84, enrollmentYear: 2024 },
        { rollNumber: '1NH23CV205', name: 'Deekshitha K', email: 'deekshitha@college.edu', department: 'Civil', semester: 4, attendancePercentage: 93, enrollmentYear: 2023 },
        { rollNumber: '1NH23CS210', name: 'Naveen Kumar', email: 'naveen@college.edu', department: 'Computer Science', semester: 4, attendancePercentage: 88, enrollmentYear: 2023 }
      ];

      const createdStudents = await Student.insertMany(studentData);
      console.log('Successfully pre-seeded 13 student records!');

      // 3. Seed Grades and marks for each student up to their semester
      for (const student of createdStudents) {
        const eligibleCourses = await Course.find({
          department: student.department,
          semester: { $lte: student.semester }
        });

        for (const course of eligibleCourses) {
          const internalMarks = Math.floor(Math.random() * 6) + 15;     // 15 - 20
          const assignmentMarks = Math.floor(Math.random() * 3) + 8;   // 8 - 10
          const practicalMarks = Math.floor(Math.random() * 5) + 16;   // 16 - 20
          const externalMarks = Math.floor(Math.random() * 11) + 40;   // 40 - 50

          const gradeRecord = new GradeRecord({
            student: student._id,
            course: course._id,
            semester: course.semester,
            internalMarks,
            assignmentMarks,
            practicalMarks,
            externalMarks
          });
          await gradeRecord.save();
        }

        // Calculate and update student CGPA
        const allGrades = await GradeRecord.find({ student: student._id }).populate('course');
        let totalGradePoints = 0;
        let totalCredits = 0;
        const gradePointsMap = { 'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'F': 0 };

        allGrades.forEach(g => {
          const credits = g.course ? g.course.credits : 3;
          const gp = gradePointsMap[g.grade] || 0;
          totalGradePoints += gp * credits;
          totalCredits += credits;
        });

        const cgpa = totalCredits > 0 ? Number((totalGradePoints / totalCredits).toFixed(2)) : 0;
        await Student.findByIdAndUpdate(student._id, { cgpa });
      }
      console.log('Successfully generated marks and calculated CGPA for all students!');
    }
  } catch (err) {
    console.error('Error during database pre-seeding:', err);
  }
}

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('MongoDB Connected Successfully');
    await seedDatabase();
  })
  .catch(err => console.error('MongoDB Connection Error:', err));

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/grades', require('./routes/gradeRoutes'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});