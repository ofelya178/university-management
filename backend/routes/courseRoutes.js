const express = require("express");
const router = express.Router();

const Course = require("../models/Course");

// GET courses
router.get("/", async (req, res) => {
    try {
        const courses = await Course.find();
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST course
router.post("/", async (req, res) => {
    try {
        const newCourse = new Course({
            name: req.body.name,
            code: req.body.code,
            teacher: req.body.teacher,
            credit: req.body.credit
        });

        const savedCourse = await newCourse.save();
        res.status(201).json(savedCourse);

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT course (fənni yenilə)
router.put("/:id", async (req, res) => {
    try {
        const updatedCourse = await Course.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedCourse) {
            return res.status(404).json({
                message: "Fənn tapılmadı"
            });
        }

        res.json(updatedCourse);

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE course
router.delete("/:id", async (req, res) => {
    try {
        const deletedCourse = await Course.findByIdAndDelete(req.params.id);

        if (!deletedCourse) {
            return res.status(404).json({
                message: "Fənn tapılmadı"
            });
        }

        res.json({ message: "Fənn uğurla silindi" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;