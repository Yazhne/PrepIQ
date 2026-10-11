
const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const allowedSkills = [
  "java",
  "python",
  "dsa",
  "dbms",
  "os",
  "cn",
  "aptitude"
];

const companyBenchmarks = {
  Google: { java: 75, python: 70, dsa: 85, dbms: 75, os: 75, cn: 75, aptitude: 70 },
  Microsoft: { java: 75, python: 70, dsa: 82, dbms: 72, os: 70, cn: 70, aptitude: 68 },
  Amazon: { java: 72, python: 68, dsa: 85, dbms: 70, os: 72, cn: 68, aptitude: 70 },
  TCS: { java: 65, python: 60, dsa: 65, dbms: 60, os: 55, cn: 55, aptitude: 70 },
  Infosys: { java: 62, python: 58, dsa: 62, dbms: 58, os: 52, cn: 52, aptitude: 68 },
  Accenture: { java: 60, python: 58, dsa: 60, dbms: 55, os: 50, cn: 50, aptitude: 65 }
};

router.post("/career-coach", authMiddleware, async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        message: "AI is not configured. Add GEMINI_API_KEY to the backend .env file."
      });
    }

    const { company, skills, studyHours } = req.body;

    if (!skills || typeof skills !== "object" || Array.isArray(skills)) {
      return res.status(400).json({
        message: "Please provide the candidate's skill scores."
      });
    }

    const safeSkills = {};

    for (const key of allowedSkills) {
      const value = Number(skills[key]);

      if (!Number.isFinite(value) || value < 0 || value > 100) {
        return res.status(400).json({
          message: `A valid score from 0 to 100 is required for ${key}.`
        });
      }

      safeSkills[key] = value;
    }

    const selectedCompany = companyBenchmarks[company]
      ? company
      : "Google";

    const benchmark = companyBenchmarks[selectedCompany];

    const skillNames = {
      java: "Java",
      python: "Python",
      dsa: "Data Structures and Algorithms",
      dbms: "Database Management Systems",
      os: "Operating Systems",
      cn: "Computer Networks",
      aptitude: "Placement Aptitude"
    };

    const skillReport = allowedSkills.map(key => ({
      skill: skillNames[key],
      score: safeSkills[key],
      target: benchmark[key],
      gap: Math.max(benchmark[key] - safeSkills[key], 0)
    }));

    const hours = Math.min(
      Math.max(Number(studyHours) || 2, 1),
      8
    );

    const prompt = `
You are PrepIQ's placement preparation coach.

Create a realistic and encouraging preparation report using the supplied assessment data.

Target company: ${selectedCompany}
Available study time per day: ${hours} hours

Candidate skill scores and targets:
${JSON.stringify(skillReport, null, 2)}

Requirements:
1. Start with a short overall assessment of the candidate's preparation.
2. Identify the three most important skill gaps using the provided scores and targets.
3. Explain why each selected skill matters for interview preparation.
4. Create a practical 7-day study plan. Include daily topics, practice activities, and a suggested time allocation that fits the daily study limit.
5. Give three relevant interview practice questions with brief hints, not full answers.
6. Suggest a simple way to measure progress after seven days.
7. Be supportive, specific, and suitable for a college student preparing for placements.
8. Do not invent official company hiring cutoffs or guarantee interview selection.
9. Clearly distinguish recommendations from official company requirements.
10. Use clear headings and readable bullet points.
11. Do not request or reveal personal, confidential, or sensitive information.

Return the report in Markdown. Use only the assessment data provided; do not invent additional candidate qualifications.
`;

    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });

    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: prompt
    });

    const analysis = response.text;

    if (!analysis) {
      return res.status(502).json({
        message: "The AI did not return a report. Please try again."
      });
    }

    return res.json({
      success: true,
      company: selectedCompany,
      studyHours: hours,
      analysis
    });
  } catch (error) {
    console.error("AI Career Coach error:", error.message);

    return res.status(502).json({
      message: "Could not generate the AI report. Please try again later."
    });
  }
});

module.exports = router;
