const express = require("express");
const router = express.Router();

const Teacher = require("../models/Teacher");

// GET teachers
router.get("/", async (req, res) => {
    try {
        const teachers = await Teacher.find();
        res.json(teachers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST teacher
router.post("/", async (req, res) => {
    try {
        const newTeacher = new Teacher({
            name: req.body.name,
            surname: req.body.surname,
            email: req.body.email,
            department: req.body.department,
            subject: req.body.subject,
            phone: req.body.phone
        });

        const savedTeacher = await newTeacher.save();
        res.status(201).json(savedTeacher);

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT teacher (müəllimi yenilə)
router.put("/:id", async (req, res) => {
    try {
        const updatedTeacher = await Teacher.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedTeacher) {
            return res.status(404).json({
                message: "Müəllim tapılmadı"
            });
        }

        res.json(updatedTeacher);

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


// DELETE teacher
router.delete("/:id", async (req, res) => {
    try {
        const deletedTeacher = await Teacher.findByIdAndDelete(req.params.id);

        if (!deletedTeacher) {
            return res.status(404).json({
                message: "Müəllim tapılmadı"
            });
        }

        res.json({
            message: "Müəllim uğurla silindi"
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;