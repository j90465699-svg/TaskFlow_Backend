const express = require("express");
const Project = require("../models/Project");
const protect = require("../middleware/auth");

const router = express.Router();

// CREATE PROJECT
router.post("/", protect, async (req, res) => {
    try {
        const { title, description } = req.body;

        if (!title) {
            return res.status(400).json({
                message: "Project title is required."
            });
        }

        const project = await Project.create({
            title,
            description,
            ownerId: req.user.id,
            members: [req.user.id]
        });

        res.status(201).json({
            message: "Project created successfully!",
            project
        });

   } catch (error) {
    console.error("CREATE PROJECT ERROR:", error);

    res.status(500).json({
        message: "Failed to create project.",
        error: error.message
    });
}
});

// GET ALL USER PROJECTS
router.get("/", protect, async (req, res) => {
    try {
        const projects = await Project.find({
            members: req.user.id
        })
        .populate("ownerId", "name email")
        .populate("members", "name email");

        res.json({
            count: projects.length,
            projects
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to retrieve projects."
        });
    }
});

module.exports = router;