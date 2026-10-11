import { useState } from "react";
import "./Assessment.css";

function Assessment({ onComplete }) {
  const [form, setForm] = useState({
    name: "",
    cgpa: "",
    company: "Google",
    java: 50,
    python: 50,
    dsa: 50,
    dbms: 50,
    os: 50,
    cn: 50,
    aptitude: 50,
    projects: 1,
    certifications: 0
  });

  const [error, setError] = useState("");

  const update = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }));
    setError("");
  };

  const submit = () => {
    const name = form.name.trim();
    const cgpa = Number(form.cgpa);

    if (!name || form.cgpa === "") {
      setError("Please enter your full name and CGPA.");
      return;
    }

    if (!Number.isFinite(cgpa) || cgpa < 0 || cgpa > 10) {
      setError("Please enter a valid CGPA between 0 and 10.");
      return;
    }

    const score = Math.round(
      Number(form.java) * 0.12 +
      Number(form.python) * 0.08 +
      Number(form.dsa) * 0.20 +
      Number(form.dbms) * 0.12 +
      Number(form.os) * 0.10 +
      Number(form.cn) * 0.10 +
      Number(form.aptitude) * 0.13 +
      Math.min(Number(form.projects) * 5, 10) +
      Math.min(Number(form.certifications) * 2, 5)
    );

    setError("");

    if (typeof onComplete !== "function") {
      setError("Unable to submit the assessment. Please refresh and try again.");
      return;
    }

    onComplete({
      ...form,
      name,
      cgpa,
      score
    });
  };

  return (
    <div className="assessment-page">
      <nav className="assessment-nav">
        <div className="logo">
          <span>◆</span> PrepIQ
        </div>

        <div className="progress">
          <span>PROFILE ASSESSMENT</span>
          <div className="progress-line">
            <div></div>
          </div>
          <b>1 / 1</b>
        </div>
      </nav>

      <main className="assessment-main">
        <div className="assessment-heading">
          <p>LET'S GET TO KNOW YOU</p>
          <h1>Build your <span>placement profile.</span></h1>
          <p>
            Be honest with your skill levels. PrepIQ uses this information
            to identify your strengths and gaps.
          </p>
        </div>

        <div className="assessment-card">
          <h2>Basic Information</h2>

          <div className="form-grid">
            <div className="field">
              <label>Full Name</label>
              <input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Enter your name"
              />
            </div>

            <div className="field">
              <label>CGPA</label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={form.cgpa}
                onChange={(e) => update("cgpa", e.target.value)}
                placeholder="e.g. 8.5"
              />
            </div>

            <div className="field full">
              <label>Target Company</label>
              <select
                value={form.company}
                onChange={(e) => update("company", e.target.value)}
              >
                <option>Google</option>
                <option>Microsoft</option>
                <option>Amazon</option>
                <option>TCS</option>
                <option>Infosys</option>
                <option>Accenture</option>
              </select>
            </div>
          </div>

          <div className="section-title">
            <h2>Technical Skills</h2>
            <p>Rate your current confidence from 0 to 100.</p>
          </div>

          <div className="skills">
            {[
              ["Java", "java"],
              ["Python", "python"],
              ["Data Structures & Algorithms", "dsa"],
              ["DBMS & SQL", "dbms"],
              ["Operating Systems", "os"],
              ["Computer Networks", "cn"],
              ["Aptitude", "aptitude"]
            ].map(([label, field]) => (
              <div className="skill" key={field}>
                <div className="skill-top">
                  <label>{label}</label>
                  <strong>{form[field]}%</strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={form[field]}
                  onChange={(e) => update(field, Number(e.target.value))}
                />
              </div>
            ))}
          </div>

          <div className="section-title">
            <h2>Experience</h2>
            <p>Tell us about your profile.</p>
          </div>

          <div className="form-grid">
            <div className="field">
              <label>Projects Completed</label>
              <input
                type="number"
                min="0"
                value={form.projects}
                onChange={(e) =>
                  update("projects", Math.max(0, Number(e.target.value)))
                }
              />
            </div>

            <div className="field">
              <label>Certifications</label>
              <input
                type="number"
                min="0"
                value={form.certifications}
                onChange={(e) =>
                  update("certifications", Math.max(0, Number(e.target.value)))
                }
              />
            </div>
          </div>

          {error && (
            <p role="alert" style={{ color: "#d9534f", marginTop: "16px" }}>
              {error}
            </p>
          )}

          <button className="analyze-btn" type="button" onClick={submit}>
            Analyze My Profile <span>→</span>
          </button>
        </div>
      </main>
    </div>
  );
}

export default Assessment;