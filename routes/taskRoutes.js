const express = require("express");
const Task = require("../models/Task");
const protect = require("../middleware/auth");

const router = express.Router();

// CREATE TASK
router.post("/", protect, async (req, res) => {
    try {
        const {
            title,
            description,
            projectId,
            assignedTo,
            priority,
            dueDate
        } = req.body;

        if (!title || !projectId || !assignedTo) {
            return res.status(400).json({
                message: "Title, projectId, and assignedTo are required."
            });
        }

        const task = await Task.create({
            title,
            description,
            projectId,
            assignedTo,
            priority,
            dueDate
        });

        res.status(201).json({
            message: "Task created successfully!",
            task
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to create task."
        });
    }
});

// GET ALL TASKS
router.get("/", protect, async (req, res) => {
    try {
        const tasks = await Task.find({
            assignedTo: req.user.id
        })
        .populate("assignedTo", "name email")
        .populate("projectId", "title description");

        res.json({
            count: tasks.length,
            tasks
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to retrieve tasks."
        });
    }
});

// UPDATE TASK STATUS
router.patch("/:id/status", protect, async (req, res) => {
    try {
        const { status } = req.body;

        const allowedStatuses = [
            "pending",
            "in-progress",
            "completed"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid task status."
            });
        }

        const task = await Task.findOneAndUpdate(
            {
                _id: req.params.id,
                assignedTo: req.user.id
            },
            { status },
            { new: true, runValidators: true }
        );

        if (!task) {
            return res.status(404).json({
                message: "Task not found."
            });
        }

        res.json({
            message: "Task status updated successfully!",
            task
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update task status."
        });
    }
});

module.exports = router;