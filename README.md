
```markdown
# University Academic Record & Performance Management System

An enterprise-grade, full-stack web application designed to manage student academic records, course catalogs, grade transcripts, attendance metrics, and performance analytics. Built with a modern **Node.js, Express, MongoDB, and Tailwind CSS** architecture.

---

## 🌟 Key Features & Capabilities

1. **Student & Course CRUD Operations:** Full management capabilities to add, view, edit, and delete student records and course catalogs with strict validation.
2. **Advanced Search, Filter & Sort:** Filter students by department or semester, sort by CGPA or name, and search dynamically by roll number, name, or email. Filter courses by department, semester, or search by code/title.
3. **Automated Seeding System:** Automatically pre-seeds **64 foundational courses** (2 core subjects per department across all 8 semesters) and **13 initial student profiles** complete with pre-calculated marksheets and attendance metrics upon server initialization.
4. **Comprehensive Marks Management:** Record breakdown scores including **Internal Assessments (/20)**, **Assignments (/10)**, **Practical Work (/20)**, and **External Examinations (/50)**.
5. **Smart Course Filtering:** Restricts mark entry dropdowns to only show subjects matching the student's department and ongoing/completed semesters.
6. **Automated Grading & CGPA Calculator:** Computes credit-weighted GPA/CGPA and letter grades (O, A+, A, B+, B, C, F) with an on-demand calculation engine.
7. **Attendance Tracking:** Monitor student attendance percentages with threshold alerts and aggregate metrics.
8. **Performance Analytics Dashboards:** Interactive data visualizations powered by **Chart.js** displaying:
   * Department enrollment metrics
   * CGPA tier distribution
   * Student attendance score ranges
   * Academic standing ratios (Good standing vs. academic warning)
9. **Printable Academic Transcripts & Report Cards:** Generates clean, formatted student report cards with print functionality.
10. **CSV Bulk Import & Export:** Seamlessly upload bulk student data via CSV files or export existing directory lists.
11. **Role-Based Access Control (RBAC):** Secure authorization supporting **Admin**, **Faculty**, and **Student** roles via JWT authentication.
12. **Cascading Deletions:** Deleting a course automatically cleans up orphaned grade records and recalibrates student transcripts in real time.

---

## 🛠️ Technology Stack

* **Frontend:** HTML5, Tailwind CSS (via CDN), JavaScript (ES6+), Chart.js
* **Backend:** Node.js, Express.js
* **Database:** MongoDB, Mongoose ODM
* **Authentication:** JSON Web Tokens (JWT), bcryptjs

---

## 📋 Prerequisites

Before running the application locally, ensure you have the following installed:
* **Node.js** (v16 or higher)
* **MongoDB** (Local instance running on `mongodb://localhost:27017` or a cloud MongoDB Atlas URI)

---

## ⚙️ Setup & Installation Instructions

1. **Clone or Extract the Project:**
   ```bash
   git clone [https://github.com/Manisha2006-7/academic-record-system.git](https://github.com/Manisha2006-7/academic-record-system.git)
   cd academic-record-system

```

2. **Install Dependencies:**
```bash
npm install

```


3. **Configure Environment Variables:**
Create a `.env` file in the root directory and add your configuration details:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/student_academic_db
JWT_SECRET=your_super_secret_jwt_key_here

```


4. **Start the Development Server:**
```bash
npm run dev

```


5. **Access the Application:**
Open your web browser and navigate to:
`http://localhost:5000`

---

## 📁 Project Structure

```text
academic-record-system/
├── models/             # Mongoose schemas (User, Student, Course, GradeRecord)
├── routes/             # Express API endpoints (auth, students, courses, grades)
├── middleware/         # JWT verification & Role authorization logic
├── public/             # Frontend assets (index.html, dashboard.html, app.js)
├── server.js           # Main application entry point & auto-seeding engine
├── package.json        # Project dependencies & scripts
└── .env                # Environment variables (git-ignored)

```

---

## 🔒 Default Access Roles

* **Admin:** Full CRUD privileges for students, courses, and records deletion.
* **Faculty:** Can add/edit students, courses, and record marks.
* **Student:** Read-only access to directory, courses, and personal transcripts.

```

---

### 💡 To update this file on GitHub:
1. Open your `README.md` file in VS Code.
2. Select all and paste the block above.
3. Save the file and run these commands in your terminal:
   ```bash
   git add README.md
   git commit -m "Update README with professional title and feature documentation"
   git push origin main

```