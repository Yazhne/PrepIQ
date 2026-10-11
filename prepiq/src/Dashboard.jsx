
import { useEffect, useMemo, useState } from "react";
import PDFReportButton from "./PDFReportButton";
import AICareerCoach from "./AICareerCoach";
import "./Dashboard.css";
import Roadmap from "./RoadMap";

const API_URL = "/api/assessments";

const skills = [
  { key: "java", name: "Java" },
  { key: "python", name: "Python" },
  { key: "dsa", name: "DSA" },
  { key: "dbms", name: "DBMS" },
  { key: "os", name: "Operating Systems" },
  { key: "cn", name: "Computer Networks" },
  { key: "aptitude", name: "Aptitude" }
];

const benchmarks = {
  Google: { java: 75, python: 70, dsa: 85, dbms: 75, os: 75, cn: 75, aptitude: 70 },
  Microsoft: { java: 75, python: 70, dsa: 82, dbms: 72, os: 70, cn: 70, aptitude: 68 },
  Amazon: { java: 72, python: 68, dsa: 85, dbms: 70, os: 72, cn: 68, aptitude: 70 },
  TCS: { java: 65, python: 60, dsa: 65, dbms: 60, os: 55, cn: 55, aptitude: 70 },
  Infosys: { java: 62, python: 58, dsa: 62, dbms: 58, os: 52, cn: 52, aptitude: 68 },
  Accenture: { java: 60, python: 58, dsa: 60, dbms: 55, os: 50, cn: 50, aptitude: 65 }
};

const roadmapText = {
  java: "Practice OOP, exception handling, collections and core Java interview questions.",
  python: "Strengthen syntax, functions, OOP, lists, dictionaries and problem solving.",
  dsa: "Focus on arrays, strings, sorting, searching, linked lists and common interview patterns.",
  dbms: "Revise SQL, joins, normalization, keys, transactions and indexing.",
  os: "Study processes, threads, scheduling, memory management and deadlocks.",
  cn: "Learn OSI/TCP-IP, HTTP, DNS, IP addressing and networking concepts.",
  aptitude: "Practice quantitative aptitude, logical reasoning and timed placement tests."
};

const learningResources = {
  java: {
    title: "Java Programming",
    channel: "Bro Code",
    topics: "OOP, classes, inheritance, exceptions and collections",
    url: "https://www.youtube.com/results?search_query=Bro+Code+Java+full+course"
  },
  python: {
    title: "Python Programming",
    channel: "Corey Schafer",
    topics: "Syntax, functions, OOP, lists and dictionaries",
    url: "https://www.youtube.com/results?search_query=Corey+Schafer+Python+tutorial"
  },
  dsa: {
    title: "Data Structures & Algorithms",
    channel: "take U forward",
    topics: "Arrays, strings, sorting, searching and interview problems",
    url: "https://www.youtube.com/results?search_query=Striver+A2Z+DSA+playlist"
  },
  dbms: {
    title: "Database Management Systems",
    channel: "Gate Smashers",
    topics: "SQL, joins, keys, normalization and transactions",
    url: "https://www.youtube.com/results?search_query=Gate+Smashers+DBMS+playlist"
  },
  os: {
    title: "Operating Systems",
    channel: "Gate Smashers",
    topics: "Processes, threads, scheduling, memory and deadlocks",
    url: "https://www.youtube.com/results?search_query=Gate+Smashers+Operating+System+playlist"
  },
  cn: {
    title: "Computer Networks",
    channel: "Neso Academy",
    topics: "OSI model, TCP/IP, DNS, HTTP and IP addressing",
    url: "https://www.youtube.com/results?search_query=Neso+Academy+Computer+Networks+playlist"
  },
  aptitude: {
    title: "Placement Aptitude",
    channel: "CareerRide",
    topics: "Quantitative aptitude, logical reasoning and placement tests",
    url: "https://www.youtube.com/results?search_query=CareerRide+placement+aptitude"
  }
};

function normalizeAssessment(item) {
  return { ...item, ...(item.skills || {}) };
}

function getDate(item) {
  const date = item.createdAt || item.updatedAt || item.date;
  if (!date) return "Date unavailable";

  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime())
    ? "Date unavailable"
    : parsed.toLocaleString();
}

function scoreValue(item) {
  return Number(item?.score) || 0;
}

function Change({ value }) {
  if (value > 0) {
    return <span className="history-change improved">↑ {value} pts</span>;
  }
  if (value < 0) {
    return <span className="history-change declined">↓ {Math.abs(value)} pts</span>;
  }
  return <span className="history-change unchanged">— 0 pts</span>;
}

function Dashboard({ data, onBack }) {
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadHistory() {
      const token = localStorage.getItem("prepiqToken");

      if (!token) {
        setHistoryLoading(false);
        setHistoryError("Please log in again to load your saved assessment history.");
        return;
      }

      try {
        const response = await fetch(API_URL, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
          throw new Error("Could not load assessment history.");
        }

        const result = await response.json();
        const records = (result.assessments || [])
          .map(normalizeAssessment)
          .sort((a, b) =>
            new Date(b.createdAt || b.updatedAt || 0) -
            new Date(a.createdAt || a.updatedAt || 0)
          );

        if (!cancelled) {
          setHistory(records);
          setHistoryError("");
        }
      } catch (error) {
        if (!cancelled) setHistoryError(error.message);
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    }

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, []);

  const current = useMemo(
    () => normalizeAssessment(data || {}),
    [data]
  );

  const latest = history[0] || current;
  const previous = history.length > 1 ? history[1] : null;
  const benchmark = benchmarks[current.company] || benchmarks.Google;

  const sortedSkills = [...skills].sort(
    (a, b) => Number(current[a.key] || 0) - Number(current[b.key] || 0)
  );

  const weakSkills = sortedSkills.filter(
    skill => Number(current[skill.key] || 0) < 60
  );

  const strongSkills = skills.filter(
    skill => Number(current[skill.key] || 0) >= 75
  );

  const companyFit = Math.round(
    skills.reduce((total, skill) => {
      const value = Number(current[skill.key] || 0);
      return total + Math.min((value / benchmark[skill.key]) * 100, 100);
    }, 0) / skills.length
  );

  const getLevel = value => {
    if (value >= 75) return "Strong";
    if (value >= 50) return "Developing";
    return "Needs Work";
  };

  const getPriority = value => {
    if (value < 40) return "HIGH";
    if (value < 60) return "MEDIUM";
    return "LOW";
  };

  const readinessChange = previous
    ? scoreValue(latest) - scoreValue(previous)
    : 0;

  return (
    <div className="dashboard">
      <header className="dashboard-nav">
        <div className="dashboard-logo"><span>◆</span> PrepIQ</div>
        <div className="dashboard-nav-right">
          <span>Assessment Report</span>
          <button onClick={onBack} className="back-btn">← Retake</button>
        </div>
      </header>

      <main className="dashboard-main">
        <section className="welcome-section">
          <div>
            <p className="eyebrow">YOUR PLACEMENT INTELLIGENCE</p>
            <h1>Welcome, <span>{current.name || "Candidate"}</span></h1>
            <p className="welcome-text">
              Your personalized placement readiness report for
              <strong> {current.company || "your target company"}</strong>.
            </p>
          </div>
          <div className="company-badge">
            <small>TARGET COMPANY</small>
            <strong>{current.company || "Not selected"}</strong>
          </div>
        </section>

        <section className="pdf-download-section">
          <PDFReportButton />
        </section>

        <section className="score-grid">
          <div className="score-card main-score">
            <div
              className="score-circle"
              style={{
                background: `conic-gradient(#f5b84b ${Math.min(Math.max(scoreValue(current), 0), 100) * 3.6}deg, #292b33 0deg)`
              }}
            >
              <div className="score-inner">
                <strong>{scoreValue(current)}</strong><span>/100</span>
              </div>
            </div>
            <div className="score-info">
              <p>OVERALL READINESS</p>
              <h2>
                {scoreValue(current) >= 80 ? "Placement Ready" :
                  scoreValue(current) >= 60 ? "Almost Ready" : "Needs Improvement"}
              </h2>
              <span>Your current preparation level based on the assessment.</span>
            </div>
          </div>

          <div className="mini-card">
            <div className="mini-icon">◎</div>
            <small>COMPANY FIT</small>
            <strong>{companyFit}%</strong>
            <span>PrepIQ benchmark</span>
          </div>
          <div className="mini-card">
            <div className="mini-icon">◇</div>
            <small>CGPA</small>
            <strong>{current.cgpa || "N/A"}</strong>
            <span>Academic profile</span>
          </div>
          <div className="mini-card">
            <div className="mini-icon">✦</div>
            <small>PROJECTS</small>
            <strong>{current.projects ?? 0}</strong>
            <span>Portfolio strength</span>
          </div>
        </section>

        <section className="insight-card">
          <div className="insight-symbol">✦</div>
          <div>
            <small>PREPIQ INSIGHT</small>
            <h3>
              {weakSkills.length
                ? `Your biggest opportunity is ${weakSkills[0].name}.`
                : "Your fundamentals are looking strong."}
            </h3>
            <p>
              {weakSkills.length
                ? `Focus on ${weakSkills.slice(0, 3).map(skill => skill.name).join(", ")} to strengthen your placement profile.`
                : "Continue practicing consistently and focus on interview-level problem solving."}
            </p>
          </div>
        </section>

        <section className="dashboard-section history-section">
          <div className="section-title">
            <div>
              <p>YOUR PROGRESS</p>
              <h2>Assessment history.</h2>
            </div>
            <span>
              {history.length} saved assessment{history.length === 1 ? "" : "s"}
            </span>
          </div>

          {historyLoading ? (
            <div className="history-message">Loading your saved assessments…</div>
          ) : historyError ? (
            <div className="history-message">{historyError}</div>
          ) : history.length === 0 ? (
            <div className="history-message">
              No saved assessments found yet. Complete and save an assessment to start tracking your progress.
            </div>
          ) : (
            <>
              <div className="history-summary-grid">
                <div className="history-summary-card">
                  <small>LATEST READINESS</small>
                  <strong>{scoreValue(latest)}<span>/100</span></strong>
                  <p>{getDate(latest)}</p>
                </div>

                <div className="history-summary-card">
                  <small>CHANGE SINCE LAST TEST</small>
                  {previous ? (
                    <>
                      <strong className={
                        readinessChange > 0
                          ? "positive-number"
                          : readinessChange < 0
                            ? "negative-number"
                            : ""
                      }>
                        {readinessChange > 0 ? "+" : ""}{readinessChange}
                        <span> pts</span>
                      </strong>
                      <p>Previous score: {scoreValue(previous)}/100</p>
                    </>
                  ) : (
                    <>
                      <strong>—</strong>
                      <p>Complete another assessment to compare.</p>
                    </>
                  )}
                </div>

                <div className="history-summary-card">
                  <small>ASSESSMENTS TAKEN</small>
                  <strong>{history.length}</strong>
                  <p>Saved to your account</p>
                </div>
              </div>

              {previous && (
                <div className="panel progress-comparison">
                  <div className="panel-heading">
                    <div>
                      <p>SKILL-BY-SKILL COMPARISON</p>
                      <h2>What changed?</h2>
                    </div>
                    <span className="comparison-caption">Latest vs previous</span>
                  </div>

                  <div className="comparison-list">
                    {skills.map(skill => {
                      const now = Number(latest[skill.key] || 0);
                      const before = Number(previous[skill.key] || 0);
                      const difference = now - before;

                      return (
                        <div className="comparison-item" key={skill.key}>
                          <div className="comparison-label">
                            <strong>{skill.name}</strong>
                            <span>{before} → {now}</span>
                            <Change value={difference} />
                          </div>
                          <div className="comparison-track">
                            <div
                              className="comparison-before"
                              style={{
                                width: `${Math.min(Math.max(before, 0), 100)}%`
                              }}
                            />
                            <div
                              className="comparison-after"
                              style={{
                                width: `${Math.min(Math.max(now, 0), 100)}%`
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="comparison-note">
                    Gold bars show your latest score; the muted bar shows your previous score.
                  </p>
                </div>
              )}

              <div className="history-list">
                {history.map((item, index) => {
                  const older = history[index + 1];
                  const change = older
                    ? scoreValue(item) - scoreValue(older)
                    : null;

                  return (
                    <article
                      className="history-item"
                      key={item._id || item.id || `${getDate(item)}-${index}`}
                    >
                      <div className="history-index">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                      <div className="history-details">
                        <strong>{item.company || "Assessment"}</strong>
                        <span>{getDate(item)}</span>
                        <small>
                          CGPA: {item.cgpa || "N/A"} · Projects: {item.projects ?? 0}
                        </small>
                      </div>
                      <div className="history-score">
                        <strong>{scoreValue(item)}<span>/100</span></strong>
                        <small>Readiness</small>
                      </div>
                      <div className="history-delta">
                        {change === null
                          ? <span className="history-change unchanged">Most recent</span>
                          : <Change value={change} />}
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </section>

        <section className="dashboard-section">
          <div className="section-title">
            <div>
              <p>SKILL ANALYSIS</p>
              <h2>Know where you stand.</h2>
            </div>
            <span>7 skill areas analyzed</span>
          </div>

          <div className="skills-grid">
            {skills.map(skill => {
              const value = Number(current[skill.key] || 0);

              return (
                <div className="skill-card" key={skill.key}>
                  <div className="skill-top">
                    <strong>{skill.name}</strong>
                    <span className={`level ${getLevel(value).toLowerCase().replace(" ", "-")}`}>
                      {getLevel(value)}
                    </span>
                  </div>
                  <div className="skill-number">{value}<span>/100</span></div>
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${Math.min(Math.max(value, 0), 100)}%`
                      }}
                    />
                  </div>
                  <div className="benchmark">Target: {benchmark[skill.key]}+</div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="analysis-grid">
          <div className="panel">
            <div className="panel-heading">
              <div>
                <p>STRENGTHS</p>
                <h2>Your strong areas</h2>
              </div>
              <span className="count-badge">{strongSkills.length}</span>
            </div>

            {strongSkills.length ? (
              <div className="strength-list">
                {strongSkills.map(skill => (
                  <div className="strength-item" key={skill.key}>
                    <div className="check">✓</div>
                    <div>
                      <strong>{skill.name}</strong>
                      <span>You have a strong foundation in this area.</span>
                    </div>
                    <b>{current[skill.key]}%</b>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-message">
                Keep practicing. Your strongest areas will appear here once your scores reach 75+.
              </div>
            )}
          </div>

          <div className="panel">
            <div className="panel-heading">
              <div>
                <p>SKILL GAPS</p>
                <h2>What needs attention?</h2>
              </div>
              <span className="count-badge warning">{weakSkills.length}</span>
            </div>

            {weakSkills.length ? (
              <div className="gap-list">
                {weakSkills.slice(0, 4).map(skill => (
                  <div className="gap-item" key={skill.key}>
                    <div className="gap-info">
                      <strong>{skill.name}</strong>
                      <span>{current[skill.key]} / 100</span>
                    </div>
                    <div className="gap-bar">
                      <div
                        style={{
                          width: `${Math.min(Math.max(Number(current[skill.key] || 0), 0), 100)}%`
                        }}
                      />
                    </div>
                    <b>{getPriority(Number(current[skill.key] || 0))}</b>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-message">No major skill gaps detected.</div>
            )}
          </div>
        </section>

        <section className="roadmap-section">
          <div className="section-title">
            <div>
              <p>PERSONALIZED ROADMAP</p>
              <h2>Your next moves.</h2>
            </div>
            <span>Priority based</span>
          </div>

          <div className="roadmap-grid">
            {sortedSkills.slice(0, 4).map((skill, index) => (
              <div className="roadmap-card" key={skill.key}>
                <div className="roadmap-number">0{index + 1}</div>
                <div className="roadmap-content">
                  <div className="roadmap-header">
                    <h3>{skill.name}</h3>
                    <span>{getPriority(Number(current[skill.key] || 0))}</span>
                  </div>
                  <p>{roadmapText[skill.key]}</p>
                  <div className="roadmap-progress">
                    <span>Current level: {current[skill.key] || 0}%</span>
                    <span>Target: {benchmark[skill.key]}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="learning-section">
          <div className="section-title">
            <div>
              <p>SMART LEARNING</p>
              <h2>Learn. Practice. Improve.</h2>
            </div>
            <span>7 skill resources</span>
          </div>

          <p className="learning-intro">
            Curated YouTube learning resources for every placement skill.
            Your lowest-scoring skills appear first.
          </p>

          <div className="learning-grid">
            {[...skills]
              .sort((a, b) =>
                Number(current[a.key] || 0) - Number(current[b.key] || 0)
              )
              .map(skill => {
                const resource = learningResources[skill.key];
                const value = Number(current[skill.key] || 0);
                const needsFocus = value < benchmark[skill.key];

                return (
                  <article className="learning-card" key={skill.key}>
                    <div className="learning-card-top">
                      <span className="learning-icon">▶</span>
                      <span className={
                        needsFocus
                          ? "learning-status focus"
                          : "learning-status good"
                      }>
                        {needsFocus ? "Needs focus" : "On target"}
                      </span>
                    </div>

                    <h3>{resource.title}</h3>
                    <p className="learning-channel">
                      Recommended channel: {resource.channel}
                    </p>

                    <div className="learning-score">
                      <span>Your score</span>
                      <strong>{value}/100</strong>
                    </div>

                    <div className="learning-track">
                      <div
                        style={{
                          width: `${Math.min(Math.max(value, 0), 100)}%`
                        }}
                      />
                    </div>

                    <p className="learning-topics">
                      <strong>Focus topics:</strong> {resource.topics}
                    </p>

                    <a
                      className="learning-link"
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Watch on YouTube ↗
                    </a>
                  </article>
                );
              })}
          </div>
        </section>
        <Roadmap company={current.company || "Microsoft"} />

        <AICareerCoach assessment={current} />

        <section className="bottom-cta">
          <div>
            <p>READY FOR THE NEXT STEP?</p>
            <h2>Turn your gaps into <em>strengths.</em></h2>
            <span>Follow your roadmap consistently and reassess your readiness.</span>
          </div>
          <button onClick={onBack}>Retake Assessment →</button>
        </section>
      </main>

      <footer className="dashboard-footer">
        <div className="dashboard-logo"><span>◆</span> PrepIQ</div>
        <p>Know Your Gaps. Prepare Smarter. Get Hired.</p>
      </footer>
    </div>
  );
}

export default Dashboard;
