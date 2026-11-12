const Teacher = require("../models/Teacher");

const getTeachers = async (req, res) => {
    try {
        const teachers = await Teacher.find();
        res.status(200).json(teachers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addTeacher = async (req, res) => {
    try {
        const teacher = await Teacher.create(req.body);
        res.status(201).json(teacher);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteTeacher = async (req, res) => {
    try {
        const teacher = await Teacher.findByIdAndDelete(req.params.id);

        if (!teacher) {
            return res.status(404).json({ message: "Müəllim tapılmadı" });
        }

        res.status(200).json({ message: "Müəllim silindi" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getTeachers, addTeacher, deleteTeacher };