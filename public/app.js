const token = localStorage.getItem('token');
if (!token) window.location.href = 'index.html';

const userRole = localStorage.getItem('role');
document.getElementById('userInfo').textContent = `User: ${localStorage.getItem('username')} (${userRole})`;

document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.clear();
    window.location.href = 'index.html';
});

// Tab Navigation
const studentsSection = document.getElementById('studentsSection');
const coursesSection = document.getElementById('coursesSection');
const analyticsSection = document.getElementById('analyticsSection');

const tabStudentsBtn = document.getElementById('tabStudentsBtn');
const tabCoursesBtn = document.getElementById('tabCoursesBtn');
const tabAnalyticsBtn = document.getElementById('tabAnalyticsBtn');

tabStudentsBtn.addEventListener('click', () => {
    studentsSection.classList.remove('hidden');
    coursesSection.classList.add('hidden');
    analyticsSection.classList.add('hidden');
    setActiveTab(tabStudentsBtn);
    fetchStudents();
});

tabCoursesBtn.addEventListener('click', () => {
    coursesSection.classList.remove('hidden');
    studentsSection.classList.add('hidden');
    analyticsSection.classList.add('hidden');
    setActiveTab(tabCoursesBtn);
    fetchCourses();
});

tabAnalyticsBtn.addEventListener('click', () => {
    analyticsSection.classList.remove('hidden');
    studentsSection.classList.add('hidden');
    coursesSection.classList.add('hidden');
    setActiveTab(tabAnalyticsBtn);
    renderCharts();
});

function setActiveTab(btn) {
    [tabStudentsBtn, tabCoursesBtn, tabAnalyticsBtn].forEach(b => {
        b.className = 'py-3 px-4 border-b-2 border-transparent font-medium text-slate-400 hover:text-slate-200 text-sm transition';
    });
    btn.className = 'py-3 px-4 border-b-2 border-blue-500 font-medium text-blue-400 text-sm transition';
}

// Modals
const studentModal = document.getElementById('studentModal');
const studentModalTitle = document.getElementById('studentModalTitle');
document.getElementById('addStudentModalBtn').addEventListener('click', () => {
    document.getElementById('studentForm').reset();
    document.getElementById('editStudentId').value = '';
    studentModalTitle.textContent = 'Add New Student';
    studentModal.classList.remove('hidden');
});
document.getElementById('closeModalBtn').addEventListener('click', () => studentModal.classList.add('hidden'));

const courseModal = document.getElementById('courseModal');
const courseModalTitle = document.getElementById('courseModalTitle');
document.getElementById('addCourseModalBtn').addEventListener('click', () => {
    document.getElementById('courseForm').reset();
    document.getElementById('editCourseId').value = '';
    courseModalTitle.textContent = 'Add New Course';
    courseModal.classList.remove('hidden');
});
document.getElementById('closeCourseModalBtn').addEventListener('click', () => courseModal.classList.add('hidden'));

const transcriptModal = document.getElementById('transcriptModal');
document.getElementById('closeTranscriptModalBtn').addEventListener('click', () => transcriptModal.classList.add('hidden'));

// Fetch Students
async function fetchStudents() {
    const search = document.getElementById('searchInput').value;
    const department = document.getElementById('filterDept').value;
    const sortBy = document.getElementById('sortBy').value;

    try {
        const queryParams = new URLSearchParams();
        if (search) queryParams.append('search', search);
        if (department) queryParams.append('department', department);
        if (sortBy) queryParams.append('sortBy', sortBy);

        const res = await fetch(`/api/students?${queryParams.toString()}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const students = await res.json();
        if (!res.ok) throw new Error(students.message);

        renderStudents(students);
        updateStats(students);
    } catch (err) { console.error(err); }
}

function renderStudents(students) {
    const tbody = document.getElementById('studentTableBody');
    tbody.innerHTML = '';

    if (students.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="p-6 text-center text-slate-500">No student records found in database.</td></tr>`;
        return;
    }

    students.forEach(s => {
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-slate-900/50 transition';
        tr.innerHTML = `
            <td class="p-4 font-mono font-medium text-blue-400">${s.rollNumber}</td>
            <td class="p-4 font-medium text-white">${s.name}</td>
            <td class="p-4 text-slate-300">${s.department}</td>
            <td class="p-4 text-slate-300">Sem ${s.semester}</td>
            <td class="p-4 text-emerald-400 font-semibold">${s.attendancePercentage}%</td>
            <td class="p-4 font-semibold text-purple-400">${s.cgpa.toFixed(2)}</td>
            <td class="p-4 text-right space-x-2">
                <button onclick="openTranscript('${s._id}', '${s.name}', ${s.semester}, '${s.department}')" class="text-blue-400 hover:text-blue-300 text-xs font-medium">Transcript</button>
                ${userRole !== 'student' ? `<button onclick="openEditStudent('${s._id}', '${s.rollNumber}', '${s.name}', '${s.email}', '${s.department}',${s.semester}, ${s.attendancePercentage},${s.enrollmentYear})" class="text-amber-400 hover:text-amber-300 text-xs font-medium">Edit</button>` : ''}
                ${userRole === 'admin' ? `<button onclick="deleteStudent('${s._id}')" class="text-red-400 hover:text-red-300 text-xs font-medium">Delete</button>` : ''}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function updateStats(students) {
    document.getElementById('totalStudents').textContent = students.length;
    const avg = students.length ? students.reduce((acc, s) => acc + s.cgpa, 0) / students.length : 0;
    document.getElementById('avgCgpa').textContent = avg.toFixed(2);
    const avgAtt = students.length ? students.reduce((acc, s) => acc + (s.attendancePercentage || 85), 0) / students.length : 0;
    document.getElementById('avgAttendance').textContent = `${avgAtt.toFixed(1)}%`;
}

// Add or Edit Student Form
document.getElementById('studentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const editId = document.getElementById('editStudentId').value;
    const payload = {
        rollNumber: document.getElementById('rollNumber').value,
        name: document.getElementById('fullName').value,
        email: document.getElementById('studentEmail').value,
        department: document.getElementById('studentDept').value,
        semester: Number(document.getElementById('studentSem').value),
        attendancePercentage: Number(document.getElementById('studentAttendance').value),
        enrollmentYear: Number(document.getElementById('studentYear').value)
    };

    try {
        const endpoint = editId ? `/api/students/${editId}` : '/api/students';
        const method = editId ? 'PUT' : 'POST';

        const res = await fetch(endpoint, {
            method: method,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(payload)
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Failed to save student');
        }
        studentModal.classList.add('hidden');
        document.getElementById('studentForm').reset();
        fetchStudents();
    } catch (err) { alert(err.message); }
});

function openEditStudent(id, roll, name, email, dept, sem, att, year) {
    document.getElementById('editStudentId').value = id;
    document.getElementById('rollNumber').value = roll;
    document.getElementById('fullName').value = name;
    document.getElementById('studentEmail').value = email;
    document.getElementById('studentDept').value = dept;
    document.getElementById('studentSem').value = sem;
    document.getElementById('studentAttendance').value = att;
    document.getElementById('studentYear').value = year;
    studentModalTitle.textContent = 'Edit Student Record';
    studentModal.classList.remove('hidden');
}

async function deleteStudent(id) {
    if (!confirm('Are you sure you want to delete this student record?')) return;
    try {
        const res = await fetch(`/api/students/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to delete student');
        fetchStudents();
    } catch (err) { alert(err.message); }
}

// Fetch Courses with Search & Filters
async function fetchCourses() {
    const search = document.getElementById('courseSearchInput').value;
    const department = document.getElementById('filterCourseDept').value;
    const semester = document.getElementById('filterCourseSem').value;

    try {
        const queryParams = new URLSearchParams();
        if (search) queryParams.append('search', search);
        if (department) queryParams.append('department', department);
        if (semester) queryParams.append('semester', semester);

        const res = await fetch(`/api/courses?${queryParams.toString()}`, { headers: { 'Authorization': `Bearer ${token}` } });
        const courses = await res.json();
        const tbody = document.getElementById('courseTableBody');
        tbody.innerHTML = '';
        if (courses.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-slate-500">No matching courses found.</td></tr>`;
            return;
        }
        courses.forEach(c => {
            const tr = document.createElement('tr');
            tr.className = 'hover:bg-slate-900/50 transition';
            tr.innerHTML = `
                <td class="p-4 font-mono font-medium text-blue-400">${c.code}</td>
                <td class="p-4 font-medium text-white">${c.title}</td>
                <td class="p-4 text-slate-300">${c.credits} Credits</td>
                <td class="p-4 text-slate-300">${c.department}</td>
                <td class="p-4 text-slate-300">Sem ${c.semester}</td>
                <td class="p-4 text-right space-x-2">
                    ${userRole !== 'student' ? `<button onclick="openEditCourse('${c._id}', '${c.code}', '${c.title}',${c.credits}, '${c.department}',${c.semester})" class="text-amber-400 hover:text-amber-300 text-xs font-medium">Edit</button>` : ''}
                    ${userRole === 'admin' ? `<button onclick="deleteCourse('${c._id}')" class="text-red-400 hover:text-red-300 text-xs font-medium">Delete</button>` : ''}
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) { console.error(err); }
}

document.getElementById('courseForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const editId = document.getElementById('editCourseId').value;
    const payload = {
        code: document.getElementById('courseCode').value,
        title: document.getElementById('courseTitle').value,
        credits: Number(document.getElementById('courseCredits').value),
        department: document.getElementById('courseDept').value,
        semester: Number(document.getElementById('courseSem').value)
    };

    try {
        const endpoint = editId ? `/api/courses/${editId}` : '/api/courses';
        const method = editId ? 'PUT' : 'POST';

        const res = await fetch(endpoint, {
            method: method,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(payload)
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Failed to save course');
        }
        courseModal.classList.add('hidden');
        document.getElementById('courseForm').reset();
        fetchCourses();
    } catch (err) { alert(err.message); }
});

function openEditCourse(id, code, title, credits, dept, sem) {
    document.getElementById('editCourseId').value = id;
    document.getElementById('courseCode').value = code;
    document.getElementById('courseTitle').value = title;
    document.getElementById('courseCredits').value = credits;
    document.getElementById('courseDept').value = dept;
    document.getElementById('courseSem').value = sem;
    courseModalTitle.textContent = 'Edit Course Record';
    courseModal.classList.remove('hidden');
}

async function deleteCourse(id) {
    if (!confirm('Are you sure you want to delete this course?')) return;
    try {
        const res = await fetch(`/api/courses/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to delete course');
        fetchCourses();
    } catch (err) { alert(err.message); }
}

// Transcript & Filtered Marks Entry
async function openTranscript(studentId, studentName, studentSemester, studentDept) {
    document.getElementById('transcriptTitle').textContent = `Academic Transcript & Report Card: ${studentName}`;
    document.getElementById('gradeStudentId').value = studentId;
    transcriptModal.classList.remove('hidden');

    try {
        const courseRes = await fetch('/api/courses', { headers: { 'Authorization': `Bearer ${token}` } });
        const courses = await courseRes.json();
        const courseSelect = document.getElementById('gradeCourseSelect');
        courseSelect.innerHTML = '';

        const eligibleCourses = courses.filter(c => c.department === studentDept && c.semester <= studentSemester);

        if (eligibleCourses.length === 0) {
            const opt = document.createElement('option');
            opt.textContent = 'No eligible courses found for this department & semester';
            courseSelect.appendChild(opt);
        } else {
            eligibleCourses.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c._id;
                opt.textContent = `${c.code} - ${c.title} (Sem ${c.semester})`;
                courseSelect.appendChild(opt);
            });
        }
    } catch (err) { console.error(err); }

    loadStudentGrades(studentId);
}

async function loadStudentGrades(studentId) {
    try {
        const res = await fetch(`/api/grades/student/${studentId}`, { headers: { 'Authorization': `Bearer ${token}` } });
        const grades = await res.json();
        const container = document.getElementById('transcriptContent');

        // Filter out null courses safely
        const validGrades = grades.filter(g => g.course !== null);

        if (validGrades.length === 0) {
            container.innerHTML = `<p class="text-slate-500 text-sm">No marks or grades assigned for active courses.</p>`;
            fetchStudents(); // Refresh dashboard table for updated CGPA
            return;
        }

        let html = `
            <table class="w-full text-left text-xs border-collapse">
                <thead>
                    <tr class="text-slate-400 border-b border-slate-800">
                        <th class="p-2">Code</th>
                        <th class="p-2">Title</th>
                        <th class="p-2">Internal (20)</th>
                        <th class="p-2">Assignment (10)</th>
                        <th class="p-2">Practical (20)</th>
                        <th class="p-2">Exam (50)</th>
                        <th class="p-2">Total</th>
                        <th class="p-2">Grade</th>
                        <th class="p-2">Status</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-800">
        `;

        validGrades.forEach(g => {
            html += `
                <tr>
                    <td class="p-2 font-mono text-blue-400">${g.course.code}</td>
                    <td class="p-2 text-white">${g.course.title}</td>
                    <td class="p-2">${g.internalMarks}</td>
                    <td class="p-2">${g.assignmentMarks}</td>
                    <td class="p-2">${g.practicalMarks}</td>
                    <td class="p-2">${g.externalMarks}</td>
                    <td class="p-2 font-semibold">${g.totalMarks}</td>
                    <td class="p-2 font-bold text-purple-400">${g.grade}</td>
                    <td class="p-2 ${g.status === 'Pass' ? 'text-green-400' : 'text-red-400'}">${g.status}</td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        container.innerHTML = html;
        fetchStudents(); // Automatically sync dashboard table CGPA
    } catch (err) { console.error(err); }
}

async function calculateStudentCgpa() {
    const studentId = document.getElementById('gradeStudentId').value;
    if (!studentId) return;

    try {
        const res = await fetch(`/api/grades/recalculate/${studentId}`, { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to calculate CGPA');

        alert(`CGPA successfully recalculated! New CGPA: ${data.cgpa}`);
        fetchStudents();
    } catch (err) { alert(err.message); }
}

document.getElementById('gradeForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const studentId = document.getElementById('gradeStudentId').value;
    const payload = {
        student: studentId,
        course: document.getElementById('gradeCourseSelect').value,
        semester: 1,
        internalMarks: Number(document.getElementById('internalMarks').value),
        assignmentMarks: Number(document.getElementById('assignmentMarks').value),
        practicalMarks: Number(document.getElementById('practicalMarks').value),
        externalMarks: Number(document.getElementById('externalMarks').value)
    };

    try {
        const res = await fetch('/api/grades', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Failed to save marks');

        document.getElementById('internalMarks').value = '';
        document.getElementById('assignmentMarks').value = '';
        document.getElementById('practicalMarks').value = '';
        document.getElementById('externalMarks').value = '';
        loadStudentGrades(studentId);
        fetchStudents();
    } catch (err) { alert(err.message); }
});

// CSV Export & Import
document.getElementById('exportCsvBtn').addEventListener('click', async () => {
    try {
        const res = await fetch('/api/students', { headers: { 'Authorization': `Bearer ${token}` } });
        const students = await res.json();
        let csv = 'Roll Number,Name,Department,Semester,Attendance,CGPA,Enrollment Year\n';
        students.forEach(s => {
            csv += `"${s.rollNumber}","${s.name}","${s.department}",${s.semester},${s.attendancePercentage || 85},${s.cgpa},${s.enrollmentYear}\n`;
        });
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('href', url);
        a.setAttribute('download', 'student_academic_records.csv');
        a.click();
    } catch (err) { alert('Failed to export CSV'); }
});

const csvFileInput = document.getElementById('csvFileInput');
document.getElementById('importCsvBtn').addEventListener('click', () => csvFileInput.click());

csvFileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    const lines = text.split('\n').slice(1);
    let addedCount = 0;

    for (let line of lines) {
        if (!line.trim()) continue;
        const cols = line.split(',').map(c => c.replace(/"/g, '').trim());
        if (cols.length >= 6) {
            const payload = {
                rollNumber: cols[0],
                name: cols[1],
                department: cols[2],
                semester: Number(cols[3]),
                attendancePercentage: Number(cols[4]) || 85,
                email: `${cols[0].toLowerCase()}@college.edu`,
                enrollmentYear: Number(cols[6]) || 2024
            };
            try {
                await fetch('/api/students', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(payload)
                });
                addedCount++;
            } catch (err) { console.error('Skipped duplicate:', cols[0]); }
        }
    }
    alert(`Successfully imported ${addedCount} student records!`);
    fetchStudents();
    csvFileInput.value = '';
});

// Analytics & Performance Charts
let deptChartInstance = null;
let cgpaChartInstance = null;
let attendanceChartInstance = null;
let standingChartInstance = null;

async function renderCharts() {
    try {
        const res = await fetch('/api/students', { headers: { 'Authorization': `Bearer ${token}` } });
        const students = await res.json();

        // 1. Department Enrollment Bar Chart
        const deptCounts = {};
        students.forEach(s => {
            deptCounts[s.department] = (deptCounts[s.department] || 0) + 1;
        });
        const deptCtx = document.getElementById('deptChart').getContext('2d');
        if (deptChartInstance) deptChartInstance.destroy();
        deptChartInstance = new Chart(deptCtx, {
            type: 'bar',
            data: {
                labels: Object.keys(deptCounts),
                datasets: [{
                    label: 'Enrolled Students',
                    data: Object.values(deptCounts),
                    backgroundColor: '#3b82f6'
                }]
            },
            options: { responsive: true, plugins: { legend: { display: false } } }
        });

        // 2. CGPA Tier Doughnut Chart
        const cgpaRanges = { '0 - 6.0': 0, '6.0 - 7.5': 0, '7.5 - 9.0': 0, '9.0 - 10.0': 0 };
        students.forEach(s => {
            if (s.cgpa < 6) cgpaRanges['0 - 6.0']++;
            else if (s.cgpa < 7.5) cgpaRanges['6.0 - 7.5']++;
            else if (s.cgpa < 9) cgpaRanges['7.5 - 9.0']++;
            else cgpaRanges['9.0 - 10.0']++;
        });
        const cgpaCtx = document.getElementById('cgpaChart').getContext('2d');
        if (cgpaChartInstance) cgpaChartInstance.destroy();
        cgpaChartInstance = new Chart(cgpaCtx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(cgpaRanges),
                datasets: [{
                    data: Object.values(cgpaRanges),
                    backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6']
                }]
            },
            options: { responsive: true }
        });

        // 3. Attendance Score Ranges Bar Chart
        const attRanges = { '< 75% (Low)': 0, '75% - 85%': 0, '85% - 95%': 0, '95% - 100% (High)': 0 };
        students.forEach(s => {
            const att = s.attendancePercentage || 85;
            if (att < 75) attRanges['< 75% (Low)']++;
            else if (att < 85) attRanges['75% - 85%']++;
            else if (att < 95) attRanges['85% - 95%']++;
            else attRanges['95% - 100% (High)']++;
        });
        const attCtx = document.getElementById('attendanceChart').getContext('2d');
        if (attendanceChartInstance) attendanceChartInstance.destroy();
        attendanceChartInstance = new Chart(attCtx, {
            type: 'bar',
            data: {
                labels: Object.keys(attRanges),
                datasets: [{
                    label: 'Students Count',
                    data: Object.values(attRanges),
                    backgroundColor: '#10b981'
                }]
            },
            options: { responsive: true, plugins: { legend: { display: false } } }
        });

        // 4. Academic Standing Ratio
        let goodStanding = 0;
        let academicWarning = 0;
        students.forEach(s => {
            if (s.cgpa >= 6.0) goodStanding++;
            else academicWarning++;
        });
        const standingCtx = document.getElementById('standingChart').getContext('2d');
        if (standingChartInstance) standingChartInstance.destroy();
        standingChartInstance = new Chart(standingCtx, {
            type: 'pie',
            data: {
                labels: ['Good Standing (CGPA >= 6.0)', 'Academic Warning (CGPA < 6.0)'],
                datasets: [{
                    data: [goodStanding, academicWarning],
                    backgroundColor: ['#6366f1', '#f43f5e']
                }]
            },
            options: { responsive: true }
        });
    } catch (err) { console.error(err); }
}

// Event Listeners for Filters
document.getElementById('searchInput').addEventListener('input', fetchStudents);
document.getElementById('filterDept').addEventListener('change', fetchStudents);
document.getElementById('sortBy').addEventListener('change', fetchStudents);

document.getElementById('courseSearchInput').addEventListener('input', fetchCourses);
document.getElementById('filterCourseDept').addEventListener('change', fetchCourses);
document.getElementById('filterCourseSem').addEventListener('change', fetchCourses);

fetchStudents();