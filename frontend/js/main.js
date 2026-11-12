// ========================================
// DASHBOARD
// ========================================

// Tələbələri yaddaşdan yüklə
let students = JSON.parse(localStorage.getItem("students")) || [];

// Dashboard sayğacları
function updateDashboard() {
    const studentCount = document.getElementById("studentCount");
    const teacherCount = document.getElementById("teacherCount");
    const courseCount = document.getElementById("courseCount");

    if (studentCount) studentCount.textContent = students.length;
    if (teacherCount) teacherCount.textContent = teachers.length;
    if (courseCount) courseCount.textContent = courses.length;
}


// ========================================
// TƏLƏBƏLƏR
// ========================================

// Tələbələri ekranda göstər
function displayStudents() {
    const studentList = document.getElementById("studentList");

    if (!studentList) return;

    studentList.innerHTML = "";

    students.forEach((student, index) => {
        studentList.innerHTML += `
            <div class="card">
                <h3>${student.name}</h3>
                <p>${student.email}</p>
                <p>${student.number}</p>
                <button onclick="deleteStudent(${index})">
                    Sil
                </button>
            </div>
        `;
    });
}

// Yeni tələbə əlavə et
const studentForm = document.getElementById("studentForm");

if (studentForm) {
    studentForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const name = document.getElementById("studentName").value;
        const email = document.getElementById("studentEmail").value;
        const number = document.getElementById("studentNumber").value;

        const newStudent = {
            name: name,
            email: email,
            number: number
        };

        students.push(newStudent);

        localStorage.setItem("students", JSON.stringify(students));

        studentForm.reset();

        displayStudents();
        updateDashboard();

        alert("Tələbə uğurla əlavə edildi!");
    });
}

// Tələbəni sil
function deleteStudent(index) {
    students.splice(index, 1);

    localStorage.setItem("students", JSON.stringify(students));

    displayStudents();
    updateDashboard();
}

// Səhifə açılanda
displayStudents();


// ========================================
// MÜƏLLİMLƏR - MONGODB
// ========================================

let teachers = [];
let editingTeacherId = null;

const teacherSearch = document.getElementById("teacherSearch");
const teacherForm = document.getElementById("teacherForm");

// Müəllimləri cədvəl formasında göstər
async function displayTeachers() {
    const teacherList = document.getElementById("teacherList");

    try {
        const response = await fetch("https://university-management-djwt.onrender.com/api/teachers");

        if (!response.ok) {
            throw new Error("Müəllimləri yükləmək mümkün olmadı");
        }

        teachers = await response.json();

        const searchText = teacherSearch
            ? teacherSearch.value.toLowerCase().trim()
            : "";

        const filteredTeachers = teachers.filter(teacher =>
            `${teacher.name} ${teacher.surname} ${teacher.email} ${teacher.subject} ${teacher.department}`
                .toLowerCase()
                .includes(searchText)
        );

        if (!teacherList) return;

        teacherList.innerHTML = "";

        if (filteredTeachers.length === 0) {
            teacherList.textContent = "Müəllim tapılmadı.";
            updateDashboard();
            return;
        }

        const tableWrapper = document.createElement("div");
        tableWrapper.className = "table-wrapper";

        const table = document.createElement("table");
        table.className = "data-table";

        table.innerHTML = `
            <thead>
                <tr>
                    <th>№</th>
                    <th>Ad Soyad</th>
                    <th>E-poçt</th>
                    <th>Kafedra</th>
                    <th>Fənn</th>
                    <th>Telefon</th>
                    <th>Əməliyyatlar</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;

        const tbody = table.querySelector("tbody");

        filteredTeachers.forEach((teacher, index) => {
            const tr = document.createElement("tr");

            const values = [
                index + 1,
                `${teacher.name} ${teacher.surname}`,
                teacher.email,
                teacher.department,
                teacher.subject,
                teacher.phone || "-"
            ];

            values.forEach(value => {
                const td = document.createElement("td");
                td.textContent = value;
                tr.appendChild(td);
            });

            const actions = document.createElement("td");

            const editButton = document.createElement("button");
            editButton.textContent = "✏️";
            editButton.className = "edit-btn";
            editButton.title = "Redaktə et";

            editButton.addEventListener("click", () => {
                editTeacher(teacher);
            });

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "🗑️";
            deleteButton.className = "delete-btn";
            deleteButton.title = "Sil";

            deleteButton.addEventListener("click", () => {
                deleteTeacher(teacher._id);
            });

            actions.appendChild(editButton);
            actions.appendChild(deleteButton);
            tr.appendChild(actions);

            tbody.appendChild(tr);
        });

        tableWrapper.appendChild(table);
        teacherList.appendChild(tableWrapper);

        updateDashboard();

    } catch (error) {
        console.log("Xəta:", error);
        if (teacherList) {
            teacherList.textContent = "Müəllimləri yükləmək mümkün olmadı.";
        }
    }
}

// Müəllim əlavə et və ya yenilə
if (teacherForm) {
    teacherForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const teacher = {
            name: document.getElementById("teacherName").value,
            surname: document.getElementById("teacherSurname").value,
            email: document.getElementById("teacherEmail").value,
            department: document.getElementById("teacherDepartment").value,
            subject: document.getElementById("teacherSubject").value,
            phone: document.getElementById("teacherPhone").value
        };

        try {
            const response = await fetch(
                editingTeacherId
                    ? `https://university-management-djwt.onrender.com/api/teachers/${editingTeacherId}`
                    : "https://university-management-djwt.onrender.com/api/teachers",
                {
                    method: editingTeacherId ? "PUT" : "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(teacher)
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Xəta baş verdi");
            }

            const wasEditing = Boolean(editingTeacherId);

            editingTeacherId = null;
            teacherForm.reset();

            const submitButton = teacherForm.querySelector("button[type='submit']");

            if (submitButton) {
                submitButton.textContent = "Müəllim əlavə et";
            }

            await displayTeachers();

            alert(
                wasEditing
                    ? "Müəllim məlumatları yeniləndi!"
                    : "Müəllim uğurla əlavə edildi!"
            );

        } catch (error) {
            alert(error.message);
            console.log(error);
        }
    });
}

// Müəllimi redaktə et
function editTeacher(teacher) {
    editingTeacherId = teacher._id;

    document.getElementById("teacherName").value = teacher.name;
    document.getElementById("teacherSurname").value = teacher.surname;
    document.getElementById("teacherEmail").value = teacher.email;
    document.getElementById("teacherDepartment").value = teacher.department;
    document.getElementById("teacherSubject").value = teacher.subject;
    document.getElementById("teacherPhone").value = teacher.phone || "";

    const submitButton = teacherForm.querySelector("button[type='submit']");

    if (submitButton) {
        submitButton.textContent = "Dəyişiklikləri yadda saxla";
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// Müəllimi sil
async function deleteTeacher(id) {
    const confirmDelete = confirm("Bu müəllimi silmək istəyirsən?");

    if (!confirmDelete) return;

    try {
        const response = await fetch(
            `https://university-management-djwt.onrender.com/api/teachers/${id}`,
            {
                method: "DELETE"
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Müəllimi silmək mümkün olmadı");
        }

        if (editingTeacherId === id) {
            editingTeacherId = null;
            teacherForm.reset();

            const submitButton = teacherForm.querySelector("button[type='submit']");

            if (submitButton) {
                submitButton.textContent = "Müəllim əlavə et";
            }
        }

        await displayTeachers();

        alert("Müəllim uğurla silindi!");

    } catch (error) {
        alert(error.message);
        console.log(error);
    }
}

// Səhifə açılanda müəllimləri yüklə
displayTeachers();

// Müəllim axtarışı
if (teacherSearch) {
    teacherSearch.addEventListener("input", displayTeachers);
}


// ========================================
// FƏNLƏR - MONGODB
// ========================================

let courses = [];
let editingCourseId = null;

const courseSearch = document.getElementById("courseSearch");
const courseForm = document.getElementById("courseForm");

// Fənləri cədvəl formasında göstər
async function displayCourses() {
    const courseList = document.getElementById("courseList");

    try {
        const response = await fetch("https://university-management-djwt.onrender.com/api/courses");

        if (!response.ok) {
            throw new Error("Fənləri yükləmək mümkün olmadı");
        }

        courses = await response.json();

        const searchText = courseSearch
            ? courseSearch.value.toLowerCase().trim()
            : "";

        const filteredCourses = courses.filter(course =>
            `${course.name} ${course.code} ${course.teacher}`
                .toLowerCase()
                .includes(searchText)
        );

        if (!courseList) return;

        courseList.innerHTML = "";

        if (filteredCourses.length === 0) {
            courseList.textContent = "Fənn tapılmadı.";
            updateDashboard();
            return;
        }

        const tableWrapper = document.createElement("div");
        tableWrapper.className = "table-wrapper";

        const table = document.createElement("table");
        table.className = "data-table";

        table.innerHTML = `
            <thead>
                <tr>
                    <th>№</th>
                    <th>Fənnin adı</th>
                    <th>Fənn kodu</th>
                    <th>Müəllim</th>
                    <th>Kredit</th>
                    <th>Əməliyyatlar</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;

        const tbody = table.querySelector("tbody");

        filteredCourses.forEach((course, index) => {
            const tr = document.createElement("tr");

            const values = [
                index + 1,
                course.name,
                course.code,
                course.teacher,
                course.credit
            ];

            values.forEach(value => {
                const td = document.createElement("td");
                td.textContent = value;
                tr.appendChild(td);
            });

            const actions = document.createElement("td");

            const editButton = document.createElement("button");
            editButton.textContent = "✏️";
            editButton.className = "edit-btn";
            editButton.title = "Redaktə et";

            editButton.addEventListener("click", () => {
                editCourse(course);
            });

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "🗑️";
            deleteButton.className = "delete-btn";
            deleteButton.title = "Sil";

            deleteButton.addEventListener("click", () => {
                deleteCourse(course._id);
            });

            actions.appendChild(editButton);
            actions.appendChild(deleteButton);
            tr.appendChild(actions);

            tbody.appendChild(tr);
        });

        tableWrapper.appendChild(table);
        courseList.appendChild(tableWrapper);

        updateDashboard();

    } catch (error) {
        console.log("Xəta:", error);

        if (courseList) {
            courseList.textContent = "Fənləri yükləmək mümkün olmadı.";
        }
    }
}

// Fənn əlavə et və ya yenilə
if (courseForm) {
    courseForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const course = {
            name: document.getElementById("courseName").value,
            code: document.getElementById("courseCode").value,
            teacher: document.getElementById("courseTeacher").value,
            credit: Number(document.getElementById("courseCredit").value)
        };

        try {
            const response = await fetch(
                editingCourseId
                    ? `https://university-management-djwt.onrender.com/api/courses/${editingCourseId}`
                    : "https://university-management-djwt.onrender.com/api/courses",
                {
                    method: editingCourseId ? "PUT" : "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(course)
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Xəta baş verdi");
            }

            const wasEditing = Boolean(editingCourseId);

            editingCourseId = null;
            courseForm.reset();

            const submitButton = courseForm.querySelector("button[type='submit']");

            if (submitButton) {
                submitButton.textContent = "Fənn əlavə et";
            }

            await displayCourses();

            alert(
                wasEditing
                    ? "Fənn məlumatları yeniləndi!"
                    : "Fənn uğurla əlavə edildi!"
            );

        } catch (error) {
            alert(error.message);
            console.log(error);
        }
    });
}

// Fənni redaktə et
function editCourse(course) {
    editingCourseId = course._id;

    document.getElementById("courseName").value = course.name;
    document.getElementById("courseCode").value = course.code;
    document.getElementById("courseTeacher").value = course.teacher;
    document.getElementById("courseCredit").value = course.credit;

    const submitButton = courseForm.querySelector("button[type='submit']");

    if (submitButton) {
        submitButton.textContent = "Dəyişiklikləri yadda saxla";
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// Fənni sil
async function deleteCourse(id) {
    if (!confirm("Bu fənni silmək istəyirsən?")) return;

    try {
        const response = await fetch(
            `https://university-management-djwt.onrender.com/api/courses/${id}`,
            {
                method: "DELETE"
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Fənni silmək mümkün olmadı");
        }

        if (editingCourseId === id) {
            editingCourseId = null;
            courseForm.reset();

            const submitButton = courseForm.querySelector("button[type='submit']");

            if (submitButton) {
                submitButton.textContent = "Fənn əlavə et";
            }
        }

        await displayCourses();

        alert("Fənn uğurla silindi!");

    } catch (error) {
        alert(error.message);
        console.log(error);
    }
}

// Səhifə açılanda fənləri yüklə
displayCourses();

// Fənn axtarışı
if (courseSearch) {
    courseSearch.addEventListener("input", displayCourses);
}


// ========================================
// QİYMƏTLƏR - MONGODB
// ========================================

const GRADE_API = "https://university-management-djwt.onrender.com/api/grades";
const STUDENT_API = "https://university-management-djwt.onrender.com/api/students";
const COURSE_API = "https://university-management-djwt.onrender.com/api/courses";

// Tələbə və fənn seçimlərini MongoDB-dən yüklə
async function loadGradeOptions() {
    const studentSelect = document.getElementById("gradeStudent");
    const courseSelect = document.getElementById("gradeCourse");

    if (!studentSelect || !courseSelect) return;

    try {
        const [studentResponse, courseResponse] = await Promise.all([
            fetch(STUDENT_API),
            fetch(COURSE_API)
        ]);

        if (!studentResponse.ok || !courseResponse.ok) {
            throw new Error("Məlumatları yükləmək mümkün olmadı");
        }

        const students = await studentResponse.json();
        const courses = await courseResponse.json();

        studentSelect.innerHTML = '<option value="">Tələbə seçin</option>';
        courseSelect.innerHTML = '<option value="">Fənn seçin</option>';

        students.forEach(student => {
            studentSelect.innerHTML += `
                <option value="${student._id}">
                    ${student.name} ${student.surname}
                </option>
            `;
        });

        courses.forEach(course => {
            courseSelect.innerHTML += `
                <option value="${course._id}">
                    ${course.name}
                </option>
            `;
        });

    } catch (error) {
        console.log("Xəta:", error);
        alert("Tələbə və fənn məlumatları yüklənmədi!");
    }
}

// Qiymətləri cədvəl formasında göstər
async function displayGrades() {
    const gradeList = document.getElementById("gradeList");

    if (!gradeList) return;

    try {
        const response = await fetch(GRADE_API);

        if (!response.ok) {
            throw new Error("Qiymətləri yükləmək mümkün olmadı");
        }

        const grades = await response.json();

        gradeList.innerHTML = "";

        if (grades.length === 0) {
            gradeList.textContent = "Hələ qiymət əlavə edilməyib.";
            return;
        }

        const tableWrapper = document.createElement("div");
        tableWrapper.className = "table-wrapper";

        const table = document.createElement("table");
        table.className = "data-table";

        table.innerHTML = `
            <thead>
                <tr>
                    <th>№</th>
                    <th>Tələbənin adı</th>
                    <th>Fənn</th>
                    <th>Qiymət</th>
                    <th>Əməliyyatlar</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;

        const tbody = table.querySelector("tbody");

        grades.forEach((grade, index) => {
            const tr = document.createElement("tr");

            const values = [
                index + 1,
                `${grade.student.name} ${grade.student.surname}`,
                grade.course.name,
                grade.value
            ];

            values.forEach(value => {
                const td = document.createElement("td");
                td.textContent = value;
                tr.appendChild(td);
            });

            const actions = document.createElement("td");

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "🗑️";
            deleteButton.className = "delete-btn";
            deleteButton.title = "Sil";

            deleteButton.addEventListener("click", () => {
                deleteGrade(grade._id);
            });

            actions.appendChild(deleteButton);
            tr.appendChild(actions);

            tbody.appendChild(tr);
        });

        tableWrapper.appendChild(table);
        gradeList.appendChild(tableWrapper);

    } catch (error) {
        console.log("Xəta:", error);
        gradeList.textContent = "Qiymətləri yükləmək mümkün olmadı.";
    }
}
// Qiymət əlavə et
const gradeForm = document.getElementById("gradeForm");

if (gradeForm) {
    loadGradeOptions();

    gradeForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const student = document.getElementById("gradeStudent").value;
        const course = document.getElementById("gradeCourse").value;
        const value = Number(document.getElementById("gradeValue").value);

        try {
            const response = await fetch(GRADE_API, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    student,
                    course,
                    value
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Qiymət əlavə edilmədi");
            }

            gradeForm.reset();

            await displayGrades();

            await displayGrades();

// Bildiriş əlavə et
if (notificationPanel && notificationToggle) {

    // İlk bildirişdə köhnə yazını sil
    const oldMessage = notificationPanel.querySelector(".empty-notification");

    if (oldMessage) {
        oldMessage.remove();
    }

    const notification = document.createElement("p");
    notification.textContent = `Yeni qiymət əlavə edildi: ${value} bal`;
    notification.style.marginTop = "10px";

    notificationPanel.appendChild(notification);

    // Bildiriş sayını artır
    let badge = notificationToggle.querySelector(".notification-count");

    if (!badge) {
        badge = document.createElement("span");
        badge.className = "notification-count";

        Object.assign(badge.style, {
            background: "red",
            color: "white",
            borderRadius: "50%",
            padding: "2px 6px",
            fontSize: "11px",
            marginLeft: "4px"
        });

        notificationToggle.appendChild(badge);
    }

    const count = Number(badge.textContent || 0) + 1;
    badge.textContent = count;
}

alert("Qiymət uğurla əlavə edildi!");

        } catch (error) {
            alert(error.message);
            console.log(error);
        }
    });
}

// Qiyməti sil
async function deleteGrade(id) {
    if (!confirm("Bu qiyməti silmək istəyirsən?")) return;

    try {
        const response = await fetch(`${GRADE_API}/${id}`, {
            method: "DELETE"
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Qiyməti silmək mümkün olmadı");
        }

        await displayGrades();

        alert("Qiymət uğurla silindi!");

    } catch (error) {
        alert(error.message);
        console.log(error);
    }
}

// Səhifə açılanda
loadGradeOptions();
displayGrades();

// ========================================
// DAVAMIYYƏT - MONGODB
// ========================================

const ATTENDANCE_API = "https://university-management-djwt.onrender.com/api/attendance";
const ATTENDANCE_STUDENT_API = "https://university-management-djwt.onrender.com/api/students";
const ATTENDANCE_COURSE_API = "https://university-management-djwt.onrender.com/api/courses";

// Tələbə və fənn seçimlərini doldur
async function loadAttendanceOptions() {
    const studentSelect = document.getElementById("attendanceStudent");
    const courseSelect = document.getElementById("attendanceCourse");

    if (!studentSelect || !courseSelect) return;

    try {
        const [studentsResponse, coursesResponse] = await Promise.all([
            fetch(ATTENDANCE_STUDENT_API),
            fetch(ATTENDANCE_COURSE_API)
        ]);

        const students = await studentsResponse.json();
        const courses = await coursesResponse.json();

        studentSelect.innerHTML = '<option value="">Tələbə seçin</option>';
        courseSelect.innerHTML = '<option value="">Fənn seçin</option>';

        students.forEach(student => {
            studentSelect.innerHTML += `
                <option value="${student._id}">
                    ${student.name} ${student.surname}
                </option>
            `;
        });

        courses.forEach(course => {
            courseSelect.innerHTML += `
                <option value="${course._id}">
                    ${course.name}
                </option>
            `;
        });

    } catch (error) {
        console.log("Seçimlər yüklənmədi:", error);
    }
}

// Davamiyyət siyahısını cədvəl formasında göstər
async function displayAttendance() {
    const attendanceList = document.getElementById("attendanceList");

    if (!attendanceList) return;

    try {
        const response = await fetch(ATTENDANCE_API);
        const attendance = await response.json();

        attendanceList.innerHTML = "";

        if (!response.ok) {
            attendanceList.textContent = "Davamiyyət yüklənmədi.";
            return;
        }

        if (attendance.length === 0) {
            attendanceList.textContent = "Hələ davamiyyət qeydi yoxdur.";
            return;
        }

        const tableWrapper = document.createElement("div");
        tableWrapper.className = "table-wrapper";

        const table = document.createElement("table");
        table.className = "data-table";

        table.innerHTML = `
            <thead>
                <tr>
                    <th>№</th>
                    <th>Tələbə</th>
                    <th>Fənn</th>
                    <th>Tarix</th>
                    <th>Status</th>
                    <th>Əməliyyatlar</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;

        const tbody = table.querySelector("tbody");

        attendance.forEach((item, index) => {
            const tr = document.createElement("tr");

            const values = [
                index + 1,
                `${item.student.name} ${item.student.surname}`,
                item.course.name,
                item.date.substring(0, 10)
            ];

            values.forEach(value => {
                const td = document.createElement("td");
                td.textContent = value;
                tr.appendChild(td);
            });

            // Status rəngi
            const statusCell = document.createElement("td");
            const statusBadge = document.createElement("span");

            statusBadge.textContent = item.status;
            statusBadge.className =
                item.status === "İştirak edib"
                    ? "attendance-present"
                    : "attendance-absent";

            statusCell.appendChild(statusBadge);
            tr.appendChild(statusCell);

            // Sil düyməsi
            const actions = document.createElement("td");

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "🗑️";
            deleteButton.className = "delete-btn";
            deleteButton.title = "Sil";

            deleteButton.addEventListener("click", () => {
                deleteAttendance(item._id);
            });

            actions.appendChild(deleteButton);
            tr.appendChild(actions);

            tbody.appendChild(tr);
        });

        tableWrapper.appendChild(table);
        attendanceList.appendChild(tableWrapper);

    } catch (error) {
        console.log("Davamiyyət yüklənmədi:", error);
        attendanceList.textContent =
            "Serverlə əlaqə yaratmaq mümkün olmadı.";
    }
}

// Davamiyyət əlavə et
const attendanceForm = document.getElementById("attendanceForm");

if (attendanceForm) {
    loadAttendanceOptions();

    attendanceForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const attendance = {
            student: document.getElementById("attendanceStudent").value,
            course: document.getElementById("attendanceCourse").value,
            date: document.getElementById("attendanceDate").value,
            status: document.getElementById("attendanceStatus").value
        };

        try {
            const response = await fetch(ATTENDANCE_API, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(attendance)
            });

            const result = await response.json();

            if (!response.ok) {
                alert(result.message || "Davamiyyət əlavə edilmədi!");
                return;
            }

            alert("Davamiyyət uğurla əlavə edildi!");

            attendanceForm.reset();
            displayAttendance();

        } catch (error) {
            console.log(error);
            alert("Serverlə əlaqə yaratmaq mümkün olmadı!");
        }
    });
}

// Davamiyyəti sil
async function deleteAttendance(id) {
    if (!confirm("Bu davamiyyət qeydini silmək istəyirsən?")) return;

    try {
        const response = await fetch(`${ATTENDANCE_API}/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            alert("Davamiyyət silinmədi!");
            return;
        }

        alert("Davamiyyət silindi!");
        displayAttendance();

    } catch (error) {
        console.log(error);
        alert("Serverlə əlaqə yoxdur!");
    }
}

// Səhifə açılanda
if (document.getElementById("attendanceForm")) {
    displayAttendance();
}

// LOGIN YOXLANIŞI
const currentPage = window.location.pathname;

if (
    currentPage.includes("index.html") ||
    currentPage.includes("students.html") ||
    currentPage.includes("teachers.html") ||
    currentPage.includes("courses.html") ||
    currentPage.includes("grades.html") ||
    currentPage.includes("attendance.html")
) {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "login.html";
    }
}


// ========================================
// LOGIN
// ========================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;
        const message = document.getElementById("authMessage");

        try {
            const response = await fetch("https://university-management-djwt.onrender.com/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                message.textContent = data.message;
                return;
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            message.textContent = "Giriş uğurludur!";

            window.location.href = "index.html";

        } catch (error) {
            message.textContent = "Serverlə əlaqə qurulmadı!";
        }
    });
}


// ========================================
// QEYDİYYAT
// ========================================

const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const name = document.getElementById("registerName").value;
        const email = document.getElementById("registerEmail").value;
        const password = document.getElementById("registerPassword").value;
        const message = document.getElementById("authMessage");

        try {
            const response = await fetch("https://university-management-djwt.onrender.com/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            message.textContent = data.message;

            if (response.ok) {
                registerForm.reset();
            }

        } catch (error) {
            message.textContent = "Serverlə əlaqə qurulmadı!";
        }
    });
}

// ========================================
// DASHBOARD STATİSTİKALARI
// ========================================

async function loadDashboardStats() {
    try {
        const [students, teachers, courses, grades, attendance] =
            await Promise.all([
                fetch("https://university-management-djwt.onrender.com/api/students").then(res => res.json()),
                fetch("https://university-management-djwt.onrender.com/api/teachers").then(res => res.json()),
                fetch("https://university-management-djwt.onrender.com/api/courses").then(res => res.json()),
                fetch("https://university-management-djwt.onrender.com/api/grades").then(res => res.json()),
                fetch("https://university-management-djwt.onrender.com/api/attendance").then(res => res.json())
            ]);

        const studentCount = document.getElementById("studentCount");
        const teacherCount = document.getElementById("teacherCount");
        const courseCount = document.getElementById("courseCount");
        const gradeCount = document.getElementById("gradeCount");
        const attendanceCount = document.getElementById("attendanceCount");

        if (studentCount) studentCount.textContent = students.length;
        if (teacherCount) teacherCount.textContent = teachers.length;
        if (courseCount) courseCount.textContent = courses.length;
        if (gradeCount) gradeCount.textContent = grades.length;
        const averageGrade = document.getElementById("averageGrade");

if (averageGrade) {
    const total = grades.reduce((sum, grade) => sum + Number(grade.value), 0);

    const average = grades.length > 0
        ? total / grades.length
        : 0;

    averageGrade.textContent = average.toFixed(2);
}
        if (attendanceCount) attendanceCount.textContent = attendance.length;
        const attendancePercentage = document.getElementById("attendancePercentage");

if (attendancePercentage) {
    const presentCount = attendance.filter(
        item => item.status === "İştirak edib"
    ).length;

    const percentage = attendance.length > 0
        ? (presentCount / attendance.length) * 100
        : 0;

    attendancePercentage.textContent = percentage.toFixed(1) + "%";
}

    } catch (error) {
        console.log("Dashboard statistikaları yüklənmədi:", error);
    }
}

// Ana səhifə açıldıqda statistikaları yüklə
loadDashboardStats();

// SOL MENYUNU AÇIB-BAĞLAMAQ

const sidebarToggle = document.getElementById("sidebarToggle");
const adminLayout = document.querySelector(".admin-layout");

if (sidebarToggle && adminLayout) {
    sidebarToggle.addEventListener("click", function () {
        adminLayout.classList.toggle("sidebar-collapsed");
    });
}

// BİLDİRİŞ PANELİ

const notificationToggle = document.getElementById("notificationToggle");
const notificationPanel = document.getElementById("notificationPanel");

if (notificationToggle && notificationPanel) {
    notificationToggle.addEventListener("click", function (event) {
        event.stopPropagation();
        notificationPanel.classList.toggle("show");
    });

    document.addEventListener("click", function (event) {
        if (
            !notificationPanel.contains(event.target) &&
            !notificationToggle.contains(event.target)
        ) {
            notificationPanel.classList.remove("show");
        }
    });
}

// ADMIN PROFİL MENYUSU

const adminToggle = document.getElementById("adminToggle");
const adminPanel = document.getElementById("adminPanel");

if (adminToggle && adminPanel) {
    adminToggle.addEventListener("click", function (event) {
        event.stopPropagation();
        adminPanel.classList.toggle("show");
    });

    document.addEventListener("click", function (event) {
        if (
            !adminPanel.contains(event.target) &&
            !adminToggle.contains(event.target)
        ) {
            adminPanel.classList.remove("show");
        }
    });
}

// LOGOUT TƏSDİQİ

const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {
    logoutButton.addEventListener("click", function () {
        const confirmLogout = confirm(
            "Hesabdan çıxmaq istədiyinizə əminsiniz?"
        );

        if (confirmLogout) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "login.html";
        } 
    });
}

// ÜMUMİ AXTARIŞ

const globalSearch = document.getElementById("globalSearch");

if (globalSearch) {
    globalSearch.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            const searchText = globalSearch.value.toLowerCase().trim();

            if (searchText.includes("tələbə") || searchText.includes("telebe")) {
                window.location.href = "students.html";
            } 
            else if (searchText.includes("müəllim") || searchText.includes("muellim")) {
                window.location.href = "teachers.html";
            } 
            else if (searchText.includes("fənn") || searchText.includes("fenn")) {
                window.location.href = "courses.html";
            } 
            else if (searchText.includes("qiymət") || searchText.includes("qiymet")) {
                window.location.href = "grades.html";
            } 
            else if (searchText.includes("davamiyyət") || searchText.includes("davamiyyet")) {
                window.location.href = "attendance.html";
            } 
            else {
                alert("Axtarış üzrə uyğun bölmə tapılmadı!");
            }
        }
    });
}

// ADMIN ADINI GÖSTƏR
const savedUser = JSON.parse(localStorage.getItem("user"));
const adminButton = document.getElementById("adminToggle");

if (savedUser && adminButton) {
    adminButton.textContent = "👤 " + savedUser.name + " ⌄";
}