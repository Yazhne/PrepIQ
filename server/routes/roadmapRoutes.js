const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const Roadmap = require("../models/Roadmap");

const router = express.Router();

const plan = [
  {
    title: "Trees and Graphs",
    tasks: [
      ["Revise tree traversals and BST", "Study preorder, inorder, postorder and BST operations.", 90],
      ["Solve three DSA problems", "Practice tree traversal, tree views or BFS/DFS.", 120],
      ["Review complexity", "Explain time and space complexity for each solution.", 30]
    ]
  },
  {
    title: "Java and OOP",
    tasks: [
      ["Revise Java Collections", "Review List, Set, Map and common implementations.", 90],
      ["Study Java concurrency", "Understand threads, synchronized and volatile.", 90],
      ["Practice Java interview questions", "Explain OOP, exceptions and HashMap collisions.", 60]
    ]
  },
  {
    title: "DBMS and SQL",
    tasks: [
      ["Revise ACID and transactions", "Review transaction properties and isolation levels.", 90],
      ["Practice SQL queries", "Write joins, grouping, subqueries and window functions.", 90],
      ["Study indexing", "Understand indexes and their read/write trade-offs.", 60]
    ]
  },
  {
    title: "Dynamic Programming",
    tasks: [
      ["Learn DP patterns", "Review overlapping subproblems and optimal substructure.", 90],
      ["Solve two DP problems", "Practice one-dimensional and grid-based DP.", 120],
      ["Review string problems", "Test edge cases and explain complexity.", 30]
    ]
  },
  {
    title: "OS and Computer Networks",
    tasks: [
      ["Revise Operating Systems", "Study processes, threads, scheduling and deadlocks.", 120],
      ["Revise Computer Networks", "Study TCP, DNS, HTTP/HTTPS and OSI layers.", 90],
      ["Practice concept recall", "Answer quick questions without looking at notes.", 30]
    ]
  },
  {
    title: "Mock Interview Day",
    tasks: [
      ["Complete a timed coding drill", "Solve two mixed DSA problems under time limits.", 120],
      ["Explain a technical design", "Connect Java, DBMS and OS concepts in one example.", 90],
      ["Review mistakes", "Record topics where you hesitated and why.", 30]
    ]
  },
  {
    title: "Review and Reassessment",
    tasks: [
      ["Revisit weak topics", "Retry problems and concepts that caused difficulty.", 90],
      ["Take a timed DSA challenge", "Solve an unseen medium problem and test edge cases.", 90],
      ["Review Java, DBMS and aptitude", "Answer questions aloud and summarize key concepts.", 60]
    ]
  }
];

function createDays() {
  return plan.map((day, index) => ({
    day: index + 1,
    title: day.title,
    tasks: day.tasks.map((task, taskIndex) => ({
      id: `day-${index + 1}-task-${taskIndex + 1}`,
      title: task[0],
      description: task[1],
      minutes: task[2],
      completed: false
    }))
  }));
}

router.get("/", authMiddleware, async (req, res) => {
  try {
    let roadmap = await Roadmap.findOne({ user: req.userId });

    if (!roadmap) {
      roadmap = await Roadmap.create({
        user: req.userId,
        company: "Microsoft",
        studyHours: 4,
        days: createDays()
      });
    }

    res.json({ success: true, roadmap });
  } catch (error) {
    console.error("Load roadmap error:", error.message);
    res.status(500).json({ message: "Could not load your roadmap." });
  }
});

router.patch("/task", authMiddleware, async (req, res) => {
  try {
    const { taskId, completed } = req.body;

    if (
      typeof taskId !== "string" ||
      !/^day-[1-7]-task-[1-3]$/.test(taskId) ||
      typeof completed !== "boolean"
    ) {
      return res.status(400).json({
        message: "A valid task ID and completion status are required."
      });
    }

    const roadmap = await Roadmap.findOne({ user: req.userId });

    if (!roadmap) {
      return res.status(404).json({
        message: "Roadmap not found. Reload the roadmap and try again."
      });
    }

    let found = false;

    for (const day of roadmap.days) {
      for (const task of day.tasks) {
        if (task.id === taskId) {
          task.completed = completed;
          task.completedAt = completed ? new Date() : null;
          found = true;
          break;
        }
      }
      if (found) break;
    }

    if (!found) {
      return res.status(404).json({ message: "Task not found." });
    }

    await roadmap.save();
    res.json({ success: true, roadmap });
  } catch (error) {
    console.error("Update roadmap task error:", error.message);
    res.status(500).json({ message: "Could not save task progress." });
  }
});

module.exports = router;