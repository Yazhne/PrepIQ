
import { useState, useEffect } from "react";
import "./App.css";
import Auth from "./Auth";
import Assessment from "./Assessment";
import Dashboard from "./Dashboard";

const API_URL = "http://localhost:5000/api/assessments";

function App() {
  const [showAuth, setShowAuth] = useState(false);
  const [showAssessment, setShowAssessment] = useState(false);
  const [assessmentData, setAssessmentData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [checkingSession, setCheckingSession] = useState(
    !!localStorage.getItem("prepiqToken")
  );

  useEffect(() => {
    let cancelled = false;

    async function loadAssessment() {
      const token = localStorage.getItem("prepiqToken");

      if (!token || showAuth) {
        setCheckingSession(false);
        return;
      }

      setCheckingSession(true);

      try {
        const response = await fetch(API_URL, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
          throw new Error("Could not load saved assessments.");
        }

        const result = await response.json();
        const saved = result.assessments?.[0];

        if (!cancelled && saved) {
          setAssessmentData({
            ...saved,
            ...saved.skills
          });
        }
      } catch (error) {
        console.error("Load assessment error:", error.message);
      } finally {
        if (!cancelled) setCheckingSession(false);
      }
    }

    loadAssessment();

    return () => {
      cancelled = true;
    };
  }, [showAuth]);

  async function saveAssessment(data) {
    const token = localStorage.getItem("prepiqToken");

    if (!token) {
      setShowAssessment(false);
      setShowAuth(true);
      setSaveError("Please log in before submitting your assessment.");
      return;
    }

    setSaving(true);
    setSaveError("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to save assessment.");
      }

      const saved = result.assessment;

      setAssessmentData({
        ...saved,
        ...saved.skills
      });
      setShowAssessment(false);
    } catch (error) {
      setSaveError(
        error.message === "Failed to fetch"
          ? "Cannot reach the backend. Make sure the server is running."
          : error.message
      );
    } finally {
      setSaving(false);
    }
  }

  if (checkingSession) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#08090d",
        color: "#d4af37"
      }}>
        Loading your PrepIQ profile...
      </div>
    );
  }

  if (showAssessment) {
    return (
      <div>
        {saveError && (
          <p role="alert" style={{ color: "#d9534f", padding: 12 }}>
            {saveError}
          </p>
        )}
        {saving && (
          <p role="status" style={{ color: "#d4af37", padding: 12 }}>
            Saving your assessment to PrepIQ...
          </p>
        )}
        <div style={{ pointerEvents: saving ? "none" : "auto" }}>
          <Assessment onComplete={saveAssessment} />
        </div>
      </div>
    );
  }

  if (assessmentData) {
    return (
      <Dashboard
        data={assessmentData}
        onBack={() => {
          setAssessmentData(null);
          setShowAssessment(true);
        }}
      />
    );
  }

  if (showAuth) {
    return (
      <Auth
        onBack={() => {
          setShowAuth(false);
          setSaveError("");
        }}
      />
    );
  }

  return (
    <div className="app">
      <nav className="navbar">
        <div className="logo"><span>◆</span> PrepIQ</div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#how">How It Works</a>
          <a href="#about">About</a>
        </div>
        <button className="login-btn" onClick={() => setShowAuth(true)}>
          Login
        </button>
      </nav>

      <main className="hero">
        <div className="badge">✦ Your Personal Placement Intelligence</div>
        <h1>
          Know Your Gaps.<br />
          <span>Prepare Smarter.</span><br />
          Get Hired.
        </h1>
        <p className="hero-text">
          PrepIQ analyzes your skills, identifies your weaknesses,
          and creates a personalized roadmap to help you become
          placement-ready.
        </p>
        <div className="hero-buttons">
          <button
            className="primary-btn"
            onClick={() => {
              setSaveError("");
              if (localStorage.getItem("prepiqToken")) {
                setShowAssessment(true);
              } else {
                setShowAuth(true);
              }
            }}
          >
            Start Your Assessment <span>→</span>
          </button>
          <button
            className="secondary-btn"
            onClick={() => document.getElementById("features")?.scrollIntoView({
              behavior: "smooth"
            })}
          >
            Explore PrepIQ
          </button>
        </div>
        {saveError && (
          <p role="alert" style={{ color: "#d9534f" }}>{saveError}</p>
        )}
        <div className="stats">
          <div><strong>10+</strong><span>Skill Areas</span></div>
          <div><strong>100%</strong><span>Personalized</span></div>
          <div><strong>24/7</strong><span>Preparation</span></div>
        </div>
      </main>

      <section className="features" id="features">
        <div className="section-heading">
          <span>WHY PREPIQ</span>
          <h2>Your preparation, <em>decoded.</em></h2>
          <p>
            Stop guessing what to study. Know exactly where you stand
            and what you should work on next.
          </p>
        </div>
        <div className="feature-grid">
          <div className="feature-card">
            <div className="icon">◈</div>
            <h3>Readiness Score</h3>
            <p>Get a clear placement-readiness score based on your technical and aptitude skills.</p>
          </div>
          <div className="feature-card">
            <div className="icon">⌁</div>
            <h3>Skill Gap Analysis</h3>
            <p>Discover your strongest areas and identify the skills holding your preparation back.</p>
          </div>
          <div className="feature-card">
            <div className="icon">✦</div>
            <h3>Smart Roadmap</h3>
            <p>Follow a personalized learning roadmap designed around your target company and current skill level.</p>
          </div>
        </div>
      </section>

      <section className="how" id="how">
        <div className="section-heading">
          <span>HOW IT WORKS</span>
          <h2>Three steps to <em>ready.</em></h2>
        </div>
        <div className="steps">
          <div className="step"><b>01</b><h3>Assess</h3><p>Tell us about your current skills and experience.</p></div>
          <div className="step"><b>02</b><h3>Analyze</h3><p>PrepIQ identifies your strengths and skill gaps.</p></div>
          <div className="step"><b>03</b><h3>Improve</h3><p>Follow your personalized roadmap and track progress.</p></div>
        </div>
      </section>

      <footer id="about">
        <div className="logo"><span>◆</span> PrepIQ</div>
        <p>Know Your Gaps. Prepare Smarter. Get Hired.</p>
      </footer>
    </div>
  );
}

export default App;
