import { useEffect, useMemo, useState } from "react";
import "./RoadMap.css";

const API_URL = "/api/roadmap";

function formatTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;

  if (hours && remaining) return `${hours}h ${remaining}m`;
  if (hours) return `${hours}h`;
  return `${remaining}m`;
}

export default function Roadmap({ company = "Microsoft" }) {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [error, setError] = useState("");

  async function request(url, options = {}) {
    const token = localStorage.getItem("prepiqToken");

    if (!token) {
      throw new Error("Please log in again to access your roadmap.");
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {})
      }
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result.message || "Roadmap request failed.");
    }

    return result;
  }

  useEffect(() => {
    let cancelled = false;

    async function loadRoadmap() {
      setLoading(true);
      setError("");

      try {
        const result = await request(API_URL);

        if (!cancelled) {
          setRoadmap(result.roadmap);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadRoadmap();

    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    const days = roadmap?.days || [];
    const tasks = days.flatMap(day => day.tasks || []);
    const completed = tasks.filter(task => task.completed).length;
    const totalMinutes = tasks.reduce((sum, task) => sum + task.minutes, 0);
    const completedMinutes = tasks
      .filter(task => task.completed)
      .reduce((sum, task) => sum + task.minutes, 0);

    return {
      total: tasks.length,
      completed,
      percent: tasks.length ? Math.round(completed / tasks.length * 100) : 0,
      totalMinutes,
      completedMinutes
    };
  }, [roadmap]);

  async function toggleTask(taskId, completed) {
    if (saving) return;

    const previous = roadmap;
    setSaving(taskId);
    setError("");

    setRoadmap(old => ({
      ...old,
      days: old.days.map(day => ({
        ...day,
        tasks: day.tasks.map(task =>
          task.id === taskId
            ? { ...task, completed, completedAt: completed ? new Date().toISOString() : null }
            : task
        )
      }))
    }));

    try {
      const result = await request(`${API_URL}/task`, {
        method: "PATCH",
        body: JSON.stringify({ taskId, completed })
      });

      setRoadmap(result.roadmap);
    } catch (err) {
      setRoadmap(previous);
      setError(err.message);
    } finally {
      setSaving("");
    }
  }

  if (loading) {
    return (
      <section className="roadmap-planner">
        <p className="roadmap-eyebrow">YOUR ACTION PLAN</p>
        <h2>Loading your 7-day roadmap…</h2>
      </section>
    );
  }

  if (error && !roadmap) {
    return (
      <section className="roadmap-planner">
        <p className="roadmap-eyebrow">YOUR ACTION PLAN</p>
        <h2>Your roadmap</h2>
        <div className="roadmap-error" role="alert">{error}</div>
        <button className="roadmap-retry" onClick={() => window.location.reload()}>
          Reload page
        </button>
      </section>
    );
  }

  if (!roadmap) return null;

  return (
    <section className="roadmap-planner">
      <div className="roadmap-planner-heading">
        <div>
          <p className="roadmap-eyebrow">YOUR ACTION PLAN</p>
          <h2>Your 7-Day Mission.</h2>
          <p>Small daily actions. Measurable progress.</p>
        </div>
        <div className="roadmap-company">
          <span>PREPARING FOR</span>
          <strong>{roadmap.company || company}</strong>
          <small>{roadmap.studyHours || 4} hours/day</small>
        </div>
      </div>

      <div className="roadmap-stats">
        <div>
          <span>OVERALL PROGRESS</span>
          <strong>{stats.percent}%</strong>
        </div>
        <div>
          <span>TASKS COMPLETED</span>
          <strong>{stats.completed}/{stats.total}</strong>
        </div>
        <div>
          <span>STUDY TIME COMPLETED</span>
          <strong>{formatTime(stats.completedMinutes)}</strong>
        </div>
      </div>

      <div
        className="roadmap-main-track"
        role="progressbar"
        aria-label="Overall roadmap completion"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={stats.percent}
      >
        <div style={{ width: `${stats.percent}%` }} />
      </div>

      {error && <div className="roadmap-error" role="alert">{error}</div>}

      <div className="roadmap-days">
        {roadmap.days.map(day => {
          const completed = day.tasks.filter(task => task.completed).length;
          const total = day.tasks.length;
          const dayPercent = total ? Math.round(completed / total * 100) : 0;
          const minutes = day.tasks.reduce((sum, task) => sum + task.minutes, 0);

          return (
            <article className="roadmap-day" key={day.day}>
              <div className="roadmap-day-header">
                <div className="roadmap-day-number">
                  {String(day.day).padStart(2, "0")}
                </div>
                <div className="roadmap-day-title">
                  <span>DAY {day.day}</span>
                  <h3>{day.title}</h3>
                  <small>{formatTime(minutes)} planned</small>
                </div>
                <div className="roadmap-day-progress">
                  <strong>{completed}/{total}</strong>
                  <span>{dayPercent}%</span>
                </div>
              </div>

              <div className="roadmap-day-track">
                <div style={{ width: `${dayPercent}%` }} />
              </div>

              <div className="roadmap-tasks">
                {day.tasks.map(task => (
                  <label
                    className={`roadmap-task ${task.completed ? "task-done" : ""}`}
                    key={task.id}
                  >
                    <input
                      type="checkbox"
                      checked={task.completed}
                      disabled={Boolean(saving)}
                      onChange={event => toggleTask(task.id, event.target.checked)}
                    />
                    <span className="roadmap-custom-check">
                      {task.completed ? "✓" : ""}
                    </span>
                    <span className="roadmap-task-text">
                      <strong>{task.title}</strong>
                      <small>{task.description}</small>
                    </span>
                    <span className="roadmap-task-time">
                      {formatTime(task.minutes)}
                    </span>
                  </label>
                ))}
              </div>
            </article>
          );
        })}
      </div>

      {stats.percent === 100 && (
        <div className="roadmap-success">
          <strong>All seven days completed!</strong>
          <p>Now take a fresh assessment to measure your progress.</p>
        </div>
      )}

      <p className="roadmap-footnote">
        Progress is saved to your account. Completing a task records activity,
        but skill improvement should be verified through practice results and reassessment.
      </p>
    </section>
  );
  
}