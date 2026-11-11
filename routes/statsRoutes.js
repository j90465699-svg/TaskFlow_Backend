const express = require("express");
const Task = require("../models/Task");
const protect = require("../middleware/auth");

const router = express.Router();

// GET PRODUCTIVITY STATISTICS
router.get("/", protect, async (req, res) => {
    try {
        const stats = await Task.aggregate([
            {
                $match: {
                    status: "completed"
                }
            },
            {
                $group: {
                    _id: "$assignedTo",
                    completedTasks: {
                        $sum: 1
                    }
                }
            },
            {
                $sort: {
                    completedTasks: -1
                }
            },
            {
                $limit: 5
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $unwind: "$user"
            },
            {
                $project: {
                    _id: 0,
                    userId: "$user._id",
                    name: "$user.name",
                    completedTasks: 1
                }
            }
        ]);

        res.json({
            message: "Productivity statistics retrieved successfully!",
            topPerformers: stats
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to retrieve statistics."
        });
    }
});

module.exports = router;