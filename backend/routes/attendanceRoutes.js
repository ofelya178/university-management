const express = require("express");
const router = express.Router();

const Attendance = require("../models/Attendance");

// GET attendance
router.get("/", async (req, res) => {
    try {
        const attendance = await Attendance.find()
            .populate("student", "name surname")
            .populate("course", "name code");

        res.json(attendance);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST attendance
router.post("/", async (req, res) => {
    try {
        const newAttendance = new Attendance({
            student: req.body.student,
            course: req.body.course,
            date: req.body.date,
            status: req.body.status
        });

        const savedAttendance = await newAttendance.save();

        res.status(201).json(savedAttendance);

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE attendance
router.delete("/:id", async (req, res) => {
    try {
        const deletedAttendance = await Attendance.findByIdAndDelete(req.params.id);

        if (!deletedAttendance) {
            return res.status(404).json({
                message: "Davamiyyət qeydi tapılmadı"
            });
        }

        res.json({ message: "Davamiyyət uğurla silindi" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;