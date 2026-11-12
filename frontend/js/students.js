// TƏLƏBƏLƏR SƏHİFƏSİ ÜÇÜN LOGIN YOXLAMASI
if (!localStorage.getItem("token")) {
    window.location.href = "login.html";
}

const API_URL = "https://university-management-djwt.onrender.com/api/students";


const studentForm = document.getElementById("studentForm");
const studentList = document.getElementById("studentList");
const studentSearch = document.getElementById("studentSearch");

// Redaktə rejimi üçün dəyişən
let editingStudentId = null;

// Tələbələri MongoDB-dən gətir
// Tələbələri MongoDB-dən gətir və cədvəldə göstər
async function loadStudents() {
    try {
        const response = await fetch(API_URL);
        const students = await response.json();

        const searchText = studentSearch
            ? studentSearch.value.toLowerCase().trim()
            : "";

        const filteredStudents = students.filter(student =>
            `${student.name} ${student.surname} ${student.studentNumber} ${student.department}`
                .toLowerCase()
                .includes(searchText)
        );

        studentList.innerHTML = "";

        if (filteredStudents.length === 0) {
            studentList.textContent = "Axtarış nəticəsi tapılmadı.";
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
                    <th>Tələbə №</th>
                    <th>İxtisas</th>
                    <th>Telefon</th>
                    <th>Əməliyyatlar</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;

        const tbody = table.querySelector("tbody");

        filteredStudents.forEach((student, index) => {
            const tr = document.createElement("tr");

            const values = [
                index + 1,
                `${student.name} ${student.surname}`,
                student.email,
                student.studentNumber,
                student.department,
                student.phone || "-"
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
                editStudent(student);
            });

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "🗑️";
            deleteButton.className = "delete-btn";
            deleteButton.title = "Sil";

            deleteButton.addEventListener("click", () => {
                deleteStudent(student._id);
            });

            actions.appendChild(editButton);
            actions.appendChild(deleteButton);

            tr.appendChild(actions);
            tbody.appendChild(tr);
        });

        tableWrapper.appendChild(table);
        studentList.appendChild(tableWrapper);

    } catch (error) {
        console.log("Tələbələr yüklənmədi:", error);
        studentList.textContent =
            "Serverlə əlaqə yaratmaq mümkün olmadı.";
    }
}

// Tələbə məlumatlarını formaya gətir
function editStudent(student) {
    editingStudentId = student._id;

    document.getElementById("studentName").value = student.name;
    document.getElementById("studentSurname").value = student.surname;
    document.getElementById("studentEmail").value = student.email;
    document.getElementById("studentNumber").value = student.studentNumber;
    document.getElementById("studentDepartment").value = student.department;
    document.getElementById("studentPhone").value = student.phone || "";

    const submitButton = studentForm.querySelector("button[type='submit']");
    submitButton.textContent = "Dəyişiklikləri yadda saxla";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// Yeni tələbə əlavə et və ya yenilə
studentForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const student = {
        name: document.getElementById("studentName").value,
        surname: document.getElementById("studentSurname").value,
        email: document.getElementById("studentEmail").value,
        studentNumber: document.getElementById("studentNumber").value,
        department: document.getElementById("studentDepartment").value,
        phone: document.getElementById("studentPhone").value
    };

    try {
        const response = await fetch(
            editingStudentId
                ? `${API_URL}/${editingStudentId}`
                : API_URL,
            {
                method: editingStudentId ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(student)
            }
        );

        const result = await response.json();

        if (!response.ok) {
            alert(result.message || "Əməliyyat uğursuz oldu!");
            return;
        }

        alert(
            editingStudentId
                ? "Tələbə məlumatları yeniləndi!"
                : "Tələbə uğurla əlavə edildi!"
        );

        editingStudentId = null;
        studentForm.reset();

        const submitButton = studentForm.querySelector("button[type='submit']");
        submitButton.textContent = "Tələbə əlavə et";

        loadStudents();

    } catch (error) {
        alert("Serverlə əlaqə yoxdur!");
        console.log(error);
    }
});

// Tələbəni sil
async function deleteStudent(id) {
    const confirmDelete = confirm("Bu tələbəni silmək istəyirsən?");

    if (!confirmDelete) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            alert("Tələbə silinmədi!");
            return;
        }

        alert("Tələbə silindi!");

        if (editingStudentId === id) {
            editingStudentId = null;
            studentForm.reset();

            const submitButton = studentForm.querySelector("button[type='submit']");
            submitButton.textContent = "Tələbə əlavə et";
        }

        loadStudents();

    } catch (error) {
        alert("Serverlə əlaqə yoxdur!");
        console.log(error);
    }
}

// Səhifə açılanda tələbələri göstər
loadStudents();

// Axtarış funksiyası
if (studentSearch) {
    studentSearch.addEventListener("input", loadStudents);
}

// BİLDİRİŞ PANELİ
const notificationToggle = document.getElementById("notificationToggle");
const notificationPanel = document.getElementById("notificationPanel");

if (notificationToggle && notificationPanel) {
    notificationToggle.addEventListener("click", function(event) {
        event.stopPropagation();
        notificationPanel.classList.toggle("show");
    });
}

// ADMIN MENYUSU
const adminToggle = document.getElementById("adminToggle");
const adminPanel = document.getElementById("adminPanel");

if (adminToggle && adminPanel) {
    adminToggle.addEventListener("click", function(event) {
        event.stopPropagation();
        adminPanel.classList.toggle("show");
    });
}

// MENYULARI KƏNARA BASANDA BAĞLA
document.addEventListener("click", function(event) {
    if (notificationPanel &&
        !notificationPanel.contains(event.target) &&
        !notificationToggle.contains(event.target)) {
        notificationPanel.classList.remove("show");
    }

    if (adminPanel &&
        !adminPanel.contains(event.target) &&
        !adminToggle.contains(event.target)) {
        adminPanel.classList.remove("show");
    }
});

// SIDEBAR
const sidebarToggle = document.getElementById("sidebarToggle");
const adminLayout = document.querySelector(".admin-layout");

if (sidebarToggle && adminLayout) {
    sidebarToggle.addEventListener("click", function() {
        adminLayout.classList.toggle("sidebar-collapsed");
    });
}

// LOGOUT
const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {
    logoutButton.addEventListener("click", function() {
        if (confirm("Hesabdan çıxmaq istəyirsiniz?")) {
            window.location.href = "login.html";
        }
    });
}

const savedUser = JSON.parse(localStorage.getItem("user"));
const adminButton = document.getElementById("adminToggle");

if (savedUser && adminButton) {
    adminButton.textContent = "👤 " + savedUser.name + " ⌄";
}