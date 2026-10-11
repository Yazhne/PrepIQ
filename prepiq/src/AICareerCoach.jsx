
import { useState } from "react";
import "./AICareerCoach.css";

const API_URL = "http://localhost:5000/api/ai/career-coach";

const skillKeys = [
  "java",
  "python",
  "dsa",
  "dbms",
  "os",
  "cn",
  "aptitude"
];

export default function AICareerCoach({ assessment }) {
  const [studyHours, setStudyHours] = useState("4");
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generatePlan() {
    setLoading(true);
    setError("");
    setReport("");

    try {
      const token = localStorage.getItem("prepiqToken");

      if (!token) {
        throw new Error("Please log in again to use the AI Career Coach.");
      }

      const skills = {};

      for (const key of skillKeys) {
        const value = Number(
          assessment?.[key] ?? assessment?.skills?.[key]
        );

        if (!Number.isFinite(value) || value < 0 || value > 100) {
          throw new Error(
            `The ${key.toUpperCase()} score is missing or invalid. Please complete a new assessment.`
          );
        }

        skills[key] = value;
      }

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          company: assessment?.company || "Google",
          skills,
          studyHours: Number(studyHours)
        })
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to generate your AI study plan."
        );
      }

      if (!result.analysis) {
        throw new Error("The AI returned an empty report. Please try again.");
      }

      setReport(result.analysis);
    } catch (err) {
      setError(
        err.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="ai-coach-section">
      <div className="ai-coach-heading">
        <div className="ai-coach-symbol">✦</div>
        <div>
          <p className="ai-eyebrow">POWERED BY GEMINI AI</p>
          <h2>Your AI Career Coach</h2>
          <p>
            Turn your assessment results into an actionable placement plan.
          </p>
        </div>
      </div>

      <div className="ai-coach-control">
        <div>
          <label htmlFor="study-hours">Daily study time</label>
          <select
            id="study-hours"
            value={studyHours}
            onChange={event => setStudyHours(event.target.value)}
            disabled={loading}
          >
            <option value="1">1 hour per day</option>
            <option value="2">2 hours per day</option>
            <option value="3">3 hours per day</option>
            <option value="4">4 hours per day</option>
            <option value="5">5 hours per day</option>
            <option value="6">6 hours per day</option>
            <option value="7">7 hours per day</option>
            <option value="8">8 hours per day</option>
          </select>
        </div>

        <button
          type="button"
          className="ai-generate-button"
          onClick={generatePlan}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="ai-spinner" />
              Generating your plan...
            </>
          ) : (
            <>✦ Generate My AI Plan</>
          )}
        </button>
      </div>

      <div className="ai-feature-list">
        <span>✓ Skill gap analysis</span>
        <span>✓ 7-day study plan</span>
        <span>✓ Interview practice</span>
      </div>

      {loading && (
        <div className="ai-loading" role="status">
          <div className="ai-loading-orb">✦</div>
          <strong>Building your personalized plan</strong>
          <p>
            PrepIQ is analyzing your scores and preparing recommendations.
            This may take a little while.
          </p>
        </div>
      )}

      {error && (
        <div className="ai-error" role="alert">
          <strong>We couldn't generate your plan.</strong>
          <p>{error}</p>
          <button type="button" onClick={generatePlan} disabled={loading}>
            Try again
          </button>
        </div>
      )}

      {report && (
        <article className="ai-report" aria-live="polite">
          <div className="ai-report-header">
            <div>
              <p className="ai-eyebrow">YOUR PERSONALIZED REPORT</p>
              <h3>Your next seven days</h3>
            </div>
            <button
              type="button"
              className="ai-copy-button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(report);
                } catch {
                  setError(
                    "Copying was blocked by your browser. You can select the report text and copy it manually."
                  );
                }
              }}
            >
              Copy report
            </button>
          </div>
          <div className="ai-report-content">{report}</div>
          <p className="ai-disclaimer">
            AI-generated guidance is for preparation support. Company hiring
            criteria can change; verify official requirements independently.
          </p>
        </article>
      )}
    </section>
  );
}
