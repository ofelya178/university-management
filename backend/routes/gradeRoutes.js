const express = require("express");
const router = express.Router();

const Grade = require("../models/Grade");

// GET grades
router.get("/", async (req, res) => {
    try {
        const grades = await Grade.find()
            .populate("student", "name surname")
            .populate("course", "name code");

        res.json(grades);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST grade
router.post("/", async (req, res) => {
    try {
        const newGrade = new Grade({
            student: req.body.student,
            course: req.body.course,
            value: req.body.value
        });

        const savedGrade = await newGrade.save();

        res.status(201).json(savedGrade);

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE grade
router.delete("/:id", async (req, res) => {
    try {
        const deletedGrade = await Grade.findByIdAndDelete(req.params.id);

        if (!deletedGrade) {
            return res.status(404).json({
                message: "Qiymət tapılmadı"
            });
        }

        res.json({ message: "Qiymət uğurla silindi" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;