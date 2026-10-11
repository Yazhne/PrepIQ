const express = require("express");
const Assessment = require("../models/Assessment");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const skillNames = [
  "java", "python", "dsa", "dbms", "os", "cn", "aptitude"
];

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, cgpa, company, projects, certifications, score } = req.body;

    if (!name || !company || cgpa === undefined || score === undefined) {
      return res.status(400).json({
        message: "Name, CGPA, company and score are required."
      });
    }

    const numericCgpa = Number(cgpa);
    const numericScore = Number(score);

    if (!Number.isFinite(numericCgpa) || numericCgpa < 0 ||
        numericCgpa > 10 || !Number.isFinite(numericScore) ||
        numericScore < 0 || numericScore > 100) {
      return res.status(400).json({
        message: "Enter a valid CGPA and score."
      });
    }

    const skills = {};

    for (const skill of skillNames) {
      const value = Number(req.body[skill]);

      if (req.body[skill] === undefined ||
          !Number.isFinite(value) || value < 0 || value > 100) {
        return res.status(400).json({
          message: `Enter a valid score for ${skill}.`
        });
      }

      skills[skill] = value;
    }

    const assessment = await Assessment.create({
      user: req.userId,
      name: name.trim(),
      cgpa: numericCgpa,
      company: company.trim(),
      skills,
      projects: Number(projects ?? 0),
      certifications: Number(certifications ?? 0),
      score: numericScore
    });

    return res.status(201).json({
      message: "Assessment saved successfully!",
      assessment
    });
  } catch (error) {
    console.error("Save assessment error:", error.message);
    return res.status(500).json({
      message: "Unable to save assessment."
    });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const assessments = await Assessment.find({
      user: req.userId
    }).sort({ createdAt: -1 }).lean();

    const results = assessments.map(item => ({
      ...item,
      ...item.skills
    }));

    return res.json({ assessments: results });
  } catch (error) {
    console.error("Fetch assessments error:", error.message);
    return res.status(500).json({
      message: "Unable to retrieve assessments."
    });
  }
});

module.exports = router;