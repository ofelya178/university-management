const Student = require("../models/Student");

// Bütün tələbələri gətir
const getStudents = async (req, res) => {
    try {
        const students = await Student.find();
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Yeni tələbə əlavə et
const addStudent = async (req, res) => {
    try {
        const student = await Student.create(req.body);
        res.status(201).json(student);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Tələbə məlumatlarını yenilə
const updateStudent = async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!student) {
            return res.status(404).json({
                message: "Tələbə tapılmadı"
            });
        }

        res.status(200).json(student);

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Tələbəni sil
const deleteStudent = async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(req.params.id);

        if (!student) {
            return res.status(404).json({ message: "Tələbə tapılmadı" });
        }

        res.status(200).json({ message: "Tələbə silindi" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getStudents,
    addStudent,
    updateStudent,
    deleteStudent
};