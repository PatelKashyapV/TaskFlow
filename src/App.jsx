import React, { useState, useEffect, useRef, useCallback } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import AboutPage from "./components/AboutPage";
import "./App.css";

/* ========================================================================== */
/* WEB AUDIO TONES (replaces external audio URLs — CSP-safe for extensions)   */
/* ========================================================================== */

function playTone(frequency, duration, type = "sine", volume = 0.25) {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
    osc.onended = () => ctx.close();
  } catch (_) {}
}

const playClick = () => playTone(880, 0.12, "sine", 0.2);
const playDelete = () => playTone(220, 0.25, "sawtooth", 0.15);
const playSuccess = () => {
  playTone(523, 0.1, "sine", 0.2);
  setTimeout(() => playTone(659, 0.1, "sine", 0.2), 110);
  setTimeout(() => playTone(784, 0.18, "sine", 0.2), 220);
};

/* ========================================================================== */
/* CHROME EXTENSION HELPERS                                                   */
/* ========================================================================== */

const isChromeExtension =
  typeof chrome !== "undefined" && !!chrome?.runtime?.id;

function syncAlarmsWithBg(tasks) {
  if (!isChromeExtension) return;
  chrome.runtime.sendMessage({ type: "SYNC_ALARMS", tasks });
}

function setBadge(count) {
  if (!isChromeExtension) return;
  chrome.runtime.sendMessage({ type: "SET_BADGE", count });
}

/* ========================================================================== */
/* TAG COLOURS                                                                 */
/* ========================================================================== */

const TAG_COLOURS = {
  Work: "#3b82f6",
  Personal: "#8b5cf6",
  Health: "#22c55e",
  Finance: "#f59e0b",
  Education: "#06b6d4",
  Other: "#9ca3af",
};

function tagColour(tag) {
  return TAG_COLOURS[tag] || "#4fd1c5";
}

/* ========================================================================== */
/* STREAK HELPERS                                                              */
/* ========================================================================== */

function loadStreak() {
  try {
    return (
      JSON.parse(localStorage.getItem("streakData")) || {
        lastDate: null,
        current: 0,
        best: 0,
      }
    );
  } catch {
    return { lastDate: null, current: 0, best: 0 };
  }
}

function updateStreak(streakData) {
  const today = new Date().toDateString();
  if (streakData.lastDate === today) return streakData; // already counted today
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const newCurrent =
    streakData.lastDate === yesterday ? streakData.current + 1 : 1;
  const newBest = Math.max(newCurrent, streakData.best);
  return { lastDate: today, current: newCurrent, best: newBest };
}

/* ========================================================================== */
/* ANALOG CLOCK                                                                */
/* ========================================================================== */

function AnalogClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours();

  const secDeg = seconds * 6;
  const minDeg = minutes * 6 + seconds * 0.1;
  const hourDeg = (hours % 12) * 30 + minutes * 0.5;

  return (
    <div
      className="clock-face"
      style={{
        width: "70px",
        height: "70px",
        minWidth: "70px",
        minHeight: "70px",
        borderRadius: "50%",
        flexShrink: 0,
        position: "relative",
      }}
    >
      <div className="hand hour-hand" style={{ transform: `rotate(${hourDeg}deg)` }} />
      <div className="hand minute-hand" style={{ transform: `rotate(${minDeg}deg)` }} />
      <div className="hand second-hand" style={{ transform: `rotate(${secDeg}deg)` }} />
      <div className="center-dot" />
    </div>
  );
}

/* ========================================================================== */
/* THEME SWITCHER                                                              */
/* ========================================================================== */

function ThemeSwitcher({ theme, setTheme }) {
  const themes = ["dark", "light"];
  return (
    <div className="theme-switcher">
      {themes.map((t) => (
        <button
          key={t}
          className={`theme-btn theme-btn--${t}${theme === t ? " theme-btn--active" : ""}`}
          onClick={() => setTheme(t)}
          title={`${t.charAt(0).toUpperCase() + t.slice(1)} theme`}
        />
      ))}
    </div>
  );
}

/* ========================================================================== */
/* EXPORT MENU                                                                 */
/* ========================================================================== */

function ExportMenu({ tasks, completedTasks }) {
  const [open, setOpen] = useState(false);

  const exportJSON = () => {
    const data = JSON.stringify({ active: tasks, completed: completedTasks }, null, 2);
    download("taskflow_export.json", data, "application/json");
    setOpen(false);
  };

  const exportCSV = () => {
    const header = "ID,Text,Due Date,Tags,Recurring,Status\n";
    const rows = [
      ...tasks.map((t) => rowCSV(t, "active")),
      ...completedTasks.map((t) => rowCSV(t, "completed")),
    ].join("\n");
    download("taskflow_export.csv", header + rows, "text/csv");
    setOpen(false);
  };

  const rowCSV = (t, status) =>
    `"${t.id}","${t.text.replace(/"/g, '""')}","${t.dueDate}","${(t.tags || []).join(";")}","${t.recurring || "none"}","${status}"`;

  const download = (filename, content, type) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([content], { type }));
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="export-menu" style={{ position: "relative" }}>
      <button className="export-btn" onClick={() => setOpen((o) => !o)} title="Export tasks">
        📤 Export
      </button>
      {open && (
        <div className="export-dropdown">
          <button onClick={exportJSON}>⬇ JSON</button>
          <button onClick={exportCSV}>⬇ CSV</button>
        </div>
      )}
    </div>
  );
}

/* ========================================================================== */
/* HOME PAGE CONTENT                                                           */
/* ========================================================================== */

const QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "Small daily improvements lead to staggering long-term results.", author: "Robin Sharma" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "Done is better than perfect.", author: "Sheryl Sandberg" },
];

function HomeContent({ tasks, completedTasks }) {
  const quote = QUOTES[new Date().getDay() % QUOTES.length];
  const todayCompleted = completedTasks.filter(
    (t) => t.completedAt && new Date(t.completedAt).toDateString() === new Date().toDateString()
  ).length;
  const overdue = tasks.filter((t) => new Date(t.dueDate) < new Date()).length;

  const tips = [
    { icon: "⚡", title: "Quick Add", desc: "Type a task in the header and press Enter to add it instantly with today's due date." },
    { icon: "🔖", title: "Use Tags", desc: "Assign Work, Personal, or Health tags so you can filter tasks by area of your life." },
    { icon: "🔁", title: "Automate Repeats", desc: "Set recurring tasks to daily, weekly, or monthly and TaskFlow handles the rest." },
    { icon: "📈", title: "Check Analytics", desc: "Visit the Analytics tab to see your streak, completion rate, and productivity trends." },
  ];

  return (
    <div className="home-content">

      {/* Welcome + Quote */}
      <div className="home-welcome">
        <div className="home-welcome__left">
          <h2 className="home-welcome__heading">
            Good {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 17 ? "Afternoon" : "Evening"} 👋
          </h2>
          <p className="home-welcome__sub">
            {tasks.length === 0
              ? "Your task list is clear. Add something to get started!"
              : `You have ${tasks.length} active task${tasks.length !== 1 ? "s" : ""}${overdue > 0 ? ` — ${overdue} overdue` : ". Keep up the great work!"}`
            }
          </p>
          {todayCompleted > 0 && (
            <p className="home-welcome__completed">✅ {todayCompleted} completed today</p>
          )}
        </div>
        <div className="home-welcome__quote">
          <span className="home-welcome__quote-icon">💬</span>
          <p className="home-welcome__quote-text">"{quote.text}"</p>
          <p className="home-welcome__quote-author">— {quote.author}</p>
        </div>
      </div>

      {/* Tips Grid */}
      <div className="home-tips-heading">💡 Pro Tips</div>
      <div className="home-tips-grid">
        {tips.map((tip, i) => (
          <div className="home-tip-card" key={i}>
            <span className="home-tip-card__icon">{tip.icon}</span>
            <div>
              <h4 className="home-tip-card__title">{tip.title}</h4>
              <p className="home-tip-card__desc">{tip.desc}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

/* ========================================================================== */
/* ANALYTICS DASHBOARD + STREAK CARD                                          */
/* ========================================================================== */

function StreakCard({ streak }) {
  return (
    <div className="streak-card">
      <div className="streak-card__item">
        <span className="streak-card__icon">🔥</span>
        <p className="streak-card__value">{streak.current}</p>
        <p className="streak-card__label">Current Streak</p>
      </div>
      <div className="streak-card__divider" />
      <div className="streak-card__item">
        <span className="streak-card__icon">⭐</span>
        <p className="streak-card__value">{streak.best}</p>
        <p className="streak-card__label">Best Streak</p>
      </div>
      <div className="streak-card__divider" />
      <div className="streak-card__item">
        <span className="streak-card__icon">📅</span>
        <p className="streak-card__value" style={{ fontSize: "14px" }}>
          {streak.lastDate || "—"}
        </p>
        <p className="streak-card__label">Last Active</p>
      </div>
    </div>
  );
}

function BuiltInAnalytics({ tasks, completedTasks, deletedTasks, isMobile, streak }) {
  const totalEver = tasks.length + completedTasks.length + deletedTasks.length;
  const completionRate = totalEver === 0 ? 0 : Math.round((completedTasks.length / totalEver) * 100);
  const deleteRate = totalEver === 0 ? 0 : Math.round((deletedTasks.length / totalEver) * 100);

  // Tag distribution from all tasks ever
  const allForTags = [...tasks, ...completedTasks];
  const tagCounts = allForTags.reduce((acc, t) => {
    (t.tags || []).forEach((tag) => { acc[tag] = (acc[tag] || 0) + 1; });
    return acc;
  }, {});
  const maxTagCount = Math.max(1, ...Object.values(tagCounts));

  // Productivity score
  const score = Math.min(100, Math.round(
    completionRate * 0.5 + Math.min(streak.current, 30) * 1.5 + Math.min(completedTasks.length, 20) * 0.5
  ));

  const scoreLabel = score >= 80 ? "🏆 Excellent" : score >= 60 ? "⚡ Great" : score >= 40 ? "💪 Good" : "🌱 Growing";

  const insights = [
    { icon: "✅", label: "Total Completed", value: completedTasks.length },
    { icon: "🗑️", label: "Total Deleted", value: deletedTasks.length },
    { icon: "📋", label: "Total Ever Created", value: totalEver },
    { icon: "📈", label: "Delete Rate", value: `${deleteRate}%` },
  ];

  const tips = completionRate < 50
    ? ["Try completing smaller tasks first to build momentum.", "Use the 'Today' view to focus on just what matters now.", "Recurring tasks can help build daily habits."]
    : ["Excellent completion rate! Keep the streak alive 🔥", "Try tagging tasks to better organise your workflow.", "Export your tasks periodically as a backup."];

  return (
    <div className="analytics-page">

      {/* Header */}
      <div className="analytics-hero">
        <h2 className="analytics-hero__title">📊 Performance Dashboard</h2>
        <p className="analytics-hero__sub">Track your productivity, streaks, and task trends in real time.</p>
      </div>

      {/* Productivity Score */}
      <div className="analytics-score-row">
        <div className="analytics-score-card">
          <div className="analytics-score-ring" style={{ "--pct": `${score * 3.6}deg` }}>
            <span className="analytics-score-ring__value">{score}</span>
          </div>
          <div>
            <p className="analytics-score-card__label">Productivity Score</p>
            <p className="analytics-score-card__badge">{scoreLabel}</p>
            <p className="analytics-score-card__hint">Based on completion rate, streak & total work done.</p>
          </div>
        </div>
        <div className="analytics-score-stats">
          <div className="analytics-stat-pill" style={{ borderColor: "var(--accent)" }}>
            <span style={{ fontSize: "22px" }}>🎯</span>
            <div>
              <p className="analytics-stat-pill__value" style={{ color: "var(--accent)" }}>{completionRate}%</p>
              <p className="analytics-stat-pill__label">Completion Rate</p>
            </div>
          </div>
          <div className="analytics-stat-pill" style={{ borderColor: "#ffc107" }}>
            <span style={{ fontSize: "22px" }}>⏳</span>
            <div>
              <p className="analytics-stat-pill__value" style={{ color: "#ffc107" }}>{tasks.length}</p>
              <p className="analytics-stat-pill__label">Pending Tasks</p>
            </div>
          </div>
          <div className="analytics-stat-pill" style={{ borderColor: "#2ecc71" }}>
            <span style={{ fontSize: "22px" }}>✅</span>
            <div>
              <p className="analytics-stat-pill__value" style={{ color: "#2ecc71" }}>{completedTasks.length}</p>
              <p className="analytics-stat-pill__label">Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Streak Card */}
      <StreakCard streak={streak} />

      {/* Extra insights grid */}
      <div className="analytics-insights-grid">
        {insights.map((it) => (
          <div className="analytics-insight-card" key={it.label}>
            <span style={{ fontSize: "24px" }}>{it.icon}</span>
            <p className="analytics-insight-card__value">{it.value}</p>
            <p className="analytics-insight-card__label">{it.label}</p>
          </div>
        ))}
      </div>

      {/* Completion Progress Bar */}
      <div className="analytics-progress-section">
        <h3 className="analytics-section-title">📉 Task Distribution</h3>
        <div className="analytics-progress-row">
          <span className="analytics-progress-row__label">Completed</span>
          <div className="analytics-progress-bar">
            <div className="analytics-progress-bar__fill" style={{ width: `${completionRate}%`, background: "#2ecc71" }} />
          </div>
          <span className="analytics-progress-row__pct">{completionRate}%</span>
        </div>
        <div className="analytics-progress-row">
          <span className="analytics-progress-row__label">Active</span>
          <div className="analytics-progress-bar">
            <div className="analytics-progress-bar__fill" style={{ width: `${totalEver === 0 ? 0 : Math.round(tasks.length / totalEver * 100)}%`, background: "var(--accent)" }} />
          </div>
          <span className="analytics-progress-row__pct">{totalEver === 0 ? 0 : Math.round(tasks.length / totalEver * 100)}%</span>
        </div>
        <div className="analytics-progress-row">
          <span className="analytics-progress-row__label">Deleted</span>
          <div className="analytics-progress-bar">
            <div className="analytics-progress-bar__fill" style={{ width: `${deleteRate}%`, background: "#ff4d4d" }} />
          </div>
          <span className="analytics-progress-row__pct">{deleteRate}%</span>
        </div>
      </div>

      {/* Tag distribution */}
      {Object.keys(tagCounts).length > 0 && (
        <div className="analytics-progress-section">
          <h3 className="analytics-section-title">🏷️ Tasks by Tag</h3>
          {Object.entries(tagCounts).map(([tag, count]) => (
            <div className="analytics-progress-row" key={tag}>
              <span className="analytics-progress-row__label">{tag}</span>
              <div className="analytics-progress-bar">
                <div className="analytics-progress-bar__fill" style={{ width: `${Math.round(count / maxTagCount * 100)}%`, background: tagColour(tag) }} />
              </div>
              <span className="analytics-progress-row__pct">{count} task{count !== 1 ? "s" : ""}</span>
            </div>
          ))}
        </div>
      )}

      {/* Tips */}
      <div className="analytics-tips-section">
        <h3 className="analytics-section-title">💡 Personalised Tips</h3>
        <div className="analytics-tips-list">
          {tips.map((tip, i) => (
            <div className="analytics-tip" key={i}>
              <span className="analytics-tip__dot" />
              {tip}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

/* ========================================================================== */
/* STAT CARD                                                                   */
/* ========================================================================== */

function StatCard({ title, value, active, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        flex: 1,
        width: "32%",
        padding: "10px 4px",
        minHeight: "80px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.3s ease",
        overflow: "hidden",
        borderRadius: "12px",
        cursor: "pointer",
        background: active ? "rgba(79,209,197,0.15)" : "rgba(255,255,255,0.05)",
        border: active ? "1px solid var(--accent)" : "1px solid rgba(255,255,255,0.05)",
        boxShadow: active ? "0 0 20px rgba(79,209,197,0.2)" : "none",
      }}
    >
      <h3
        style={{
          fontSize: "12px",
          margin: 0,
          fontWeight: active ? "bold" : "normal",
          color: active ? "var(--accent)" : "#ccc",
          letterSpacing: "0.5px",
          whiteSpace: "nowrap",
          textTransform: "uppercase",
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: "24px",
          margin: "4px 0 0 0",
          color: active ? "var(--accent)" : "var(--text-primary)",
          fontWeight: "bold",
        }}
      >
        {value}
      </p>
    </div>
  );
}

/* ========================================================================== */
/* TAG FILTER BAR                                                              */
/* ========================================================================== */

function TagFilterBar({ allTags, activeTag, setActiveTag }) {
  if (allTags.length === 0) return null;
  return (
    <div className="tag-filter-bar">
      <button
        className={`tag-chip${activeTag === null ? " tag-chip--active" : ""}`}
        style={{ background: activeTag === null ? "var(--accent)" : "rgba(255,255,255,0.08)", color: activeTag === null ? "#000" : "var(--text-secondary)" }}
        onClick={() => setActiveTag(null)}
      >
        All
      </button>
      {allTags.map((tag) => (
        <button
          key={tag}
          className={`tag-chip${activeTag === tag ? " tag-chip--active" : ""}`}
          style={{
            background: activeTag === tag ? tagColour(tag) : "rgba(255,255,255,0.08)",
            color: activeTag === tag ? "#fff" : "var(--text-secondary)",
          }}
          onClick={() => setActiveTag(activeTag === tag ? null : tag)}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}

/* ========================================================================== */
/* TASK SECTION                                                                */
/* ========================================================================== */

function TaskSection({ title, tasks, completeTask, deleteTask, startEdit }) {
  if (tasks.length === 0) return null;
  return (
    <div className="section-wrapper" style={{ width: "100%", marginBottom: "2%" }}>
      <h3
        className="task-section"
        style={{ fontSize: "13px", color: "#888", marginBottom: "1%", textTransform: "uppercase" }}
      >
        {title}
      </h3>
      {tasks.map((task) => (
        <TaskRow
          key={task.id}
          task={task}
          primary="Complete"
          primaryColor="#38d26b"
          secondary="Delete"
          secondaryColor="#ff4d4d"
          onPrimary={completeTask}
          onSecondary={deleteTask}
          onEdit={startEdit}
          showEdit
        />
      ))}
    </div>
  );
}

/* ========================================================================== */
/* TASK ROW                                                                    */
/* ========================================================================== */

function TaskRow({ task, primary, secondary, primaryColor, secondaryColor, onPrimary, onSecondary, onEdit, showEdit }) {
  const date = new Date(task.dueDate);
  const isOverdue = date.getTime() < new Date().getTime();

  const formattedTime = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  const formattedDate = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const dueString = `${formattedDate}, ${formattedTime}`;

  const recurringLabel = task.recurring && task.recurring !== "none"
    ? { daily: "🔁 Daily", weekly: "🔁 Weekly", monthly: "🔁 Monthly" }[task.recurring]
    : null;

  return (
    <div className={`task-row${isOverdue ? " task-row--overdue" : ""}`}>
      <div className="task-row__info">
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <span className="task-row__text">{task.text}</span>
          {(task.tags || []).map((tag) => (
            <span
              key={tag}
              className="tag-chip-inline"
              style={{ background: tagColour(tag) + "33", color: tagColour(tag), border: `1px solid ${tagColour(tag)}55` }}
            >
              {tag}
            </span>
          ))}
          {recurringLabel && (
            <span className="tag-chip-inline" style={{ background: "rgba(79,209,197,0.15)", color: "var(--accent)" }}>
              {recurringLabel}
            </span>
          )}
        </div>
        <span className="task-row__due">Due: {dueString}</span>
      </div>

      <div className="task-row__actions">
        <div className="task-row__buttons">
          {showEdit && (
            <button
              className="task-row__btn task-row__btn--edit"
              onClick={() => onEdit && onEdit(task)}
              title="Edit task"
            >
              ✏️
            </button>
          )}
          <button
            className="task-row__btn"
            style={{ background: primaryColor, color: "#000" }}
            onClick={() => onPrimary(task.id)}
          >
            {primary}
          </button>
          {secondary && (
            <button
              className="task-row__btn"
              style={{ background: secondaryColor, color: "#fff" }}
              onClick={() => onSecondary(task.id)}
            >
              {secondary}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ========================================================================== */
/* COMPLETED SECTION                                                           */
/* ========================================================================== */

function CompletedSection({ completedTasks, sendToActive, deleteFromCompleted }) {
  if (completedTasks.length === 0)
    return <p style={{ color: "#aaa", marginTop: "20px", textAlign: "center" }}>No completed tasks</p>;

  const grouped = completedTasks.reduce((groups, task) => {
    const date = new Date(task.dueDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" });
    if (!groups[date]) groups[date] = [];
    groups[date].push(task);
    return groups;
  }, {});

  return (
    <div className="completed-list" style={{ width: "100%" }}>
      {Object.entries(grouped).map(([date, tasks]) => (
        <div key={date} style={{ marginBottom: "2%" }}>
          <h3 className="task-section" style={{ fontSize: "13px", color: "#888", marginBottom: "1%" }}>
            {date}
          </h3>
          {tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              primary="Restore"
              primaryColor="#4fd1c5"
              secondary="Delete"
              secondaryColor="#ff4d4d"
              onPrimary={sendToActive}
              onSecondary={deleteFromCompleted}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ========================================================================== */
/* DATE/TIME MODAL (create + edit)                                             */
/* ========================================================================== */

const TAGS_LIST = Object.keys(TAG_COLOURS);
const RECURRING_OPTIONS = ["none", "daily", "weekly", "monthly"];

function DateTimeModal({
  taskText, setTaskText,
  dueDate, setDueDate,
  dueTime, setDueTime,
  selectedTags, setSelectedTags,
  recurring, setRecurring,
  lastMeridiem,
  saveTaskWithDate,
  close,
  isEditing,
}) {
  const toggleTag = (tag) =>
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ width: "360px", maxWidth: "95vw" }}>
        <h3 style={{ margin: "0 0 10px 0", fontSize: "16px" }}>
          {isEditing ? "✏️ Edit Task" : "📝 New Task"}
        </h3>

        {/* Task name */}
        <input
          type="text"
          className="task-input"
          style={{ width: "100%", marginBottom: "16px", padding: "12px", boxSizing: "border-box" }}
          placeholder="What needs to be done?"
          value={taskText}
          onChange={(e) => setTaskText(e.target.value)}
          autoFocus
        />

        {/* Due Date */}
        <h3 style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#aaa" }}>Due Date</h3>
        <DatePicker
          selected={dueDate}
          onChange={(date) => setDueDate(date)}
          dateFormat="dd MMM yyyy"
          placeholderText="Select date"
          className="calendar-input"
        />

        {/* Due Time */}
        <h3 style={{ margin: "14px 0 8px 0", fontSize: "14px", color: "#aaa" }}>Time</h3>
        <input
          className="time-input"
          type="time"
          value={dueTime}
          onChange={(e) => {
            const value = e.target.value;
            setDueTime(value);
            const d = new Date(`1970-01-01T${value}`);
            const meridiem = d.getHours() >= 12 ? "PM" : "AM";
            // When the user crosses AM/PM boundary on the native time picker,
            // some browsers scroll the spinner unexpectedly. Blurring after 150ms
            // prevents the picker from jumping to an unintended hour.
            if (lastMeridiem.current && lastMeridiem.current !== meridiem) {
              setTimeout(() => document.activeElement.blur(), 150);
            }
            lastMeridiem.current = meridiem;
          }}
        />

        {/* Tags */}
        <h3 style={{ margin: "14px 0 8px 0", fontSize: "14px", color: "#aaa" }}>Tags</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "4px" }}>
          {TAGS_LIST.map((tag) => (
            <button
              key={tag}
              className="tag-chip"
              style={{
                background: selectedTags.includes(tag) ? tagColour(tag) : "var(--bg-secondary)",
                color: selectedTags.includes(tag) ? "#fff" : "var(--text-secondary)",
                border: `1px solid ${selectedTags.includes(tag) ? tagColour(tag) : "var(--border-subtle)"}`,
              }}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Recurring */}
        <h3 style={{ margin: "14px 0 8px 0", fontSize: "14px", color: "#aaa" }}>Recurring</h3>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
          {RECURRING_OPTIONS.map((opt) => (
            <button
              key={opt}
              className="tag-chip"
              style={{
                background: recurring === opt ? "var(--accent)" : "var(--bg-secondary)",
                color: recurring === opt ? "#fff" : "var(--text-secondary)",
                border: `1px solid ${recurring === opt ? "calc(var(--accent))" : "var(--border-subtle)"}`,
              }}
              onClick={() => setRecurring(opt)}
            >
              {opt.charAt(0).toUpperCase() + opt.slice(1)}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="modal-actions" style={{ marginTop: "20px" }}>
          <button onClick={close}>Cancel</button>
          <button onClick={saveTaskWithDate}>{isEditing ? "Save Changes" : "Add Task"}</button>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================== */
/* MAIN APP                                                                   */
/* ========================================================================== */

function App() {
  // ── Theme ──────────────────────────────────────────────────────────────────
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // ── Responsive / mobile ────────────────────────────────────────────────────
  const [mobileMenu, setMobileMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const lastMeridiem = useRef(null);
  // Force a re-render every 60 seconds so task categories (Overdue/Today/Tomorrow)
  // stay accurate without requiring user interaction.
  const [, forceUpdate] = useState(0);

  // ── Navigation ─────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [page, setPage] = useState("home");
  const [view, setView] = useState("active");
  const [activeTag, setActiveTag] = useState(null);

  // ── Data helpers ───────────────────────────────────────────────────────────
  const safeParse = (key) => {
    try { return JSON.parse(localStorage.getItem(key)) || []; }
    catch { return []; }
  };

  // ── Task state ─────────────────────────────────────────────────────────────
  const [tasks, setTasks] = useState(() => safeParse("tasks"));
  const [completedTasks, setCompletedTasks] = useState(() => safeParse("completedTasks"));
  const [deletedTasks, setDeletedTasks] = useState(() => safeParse("deletedTasks"));

  // ── Streak ─────────────────────────────────────────────────────────────────
  const [streak, setStreak] = useState(() => loadStreak());

  // ── Modal / form state ─────────────────────────────────────────────────────
  const [taskText, setTaskText] = useState("");
  const [showDateModal, setShowDateModal] = useState(false);
  const [dueDate, setDueDate] = useState(null);
  const [dueTime, setDueTime] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [recurring, setRecurring] = useState("none");
  const [editingTask, setEditingTask] = useState(null); // null = create mode

  // ── Persist to localStorage ────────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
    localStorage.setItem("completedTasks", JSON.stringify(completedTasks));
    localStorage.setItem("deletedTasks", JSON.stringify(deletedTasks));
    localStorage.setItem("streakData", JSON.stringify(streak));
    // Sync alarms and badge with the background service worker
    syncAlarmsWithBg(tasks);
    setBadge(tasks.length);
  }, [tasks, completedTasks, deletedTasks, streak]);

  // ── Responsive ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => forceUpdate((n) => n + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  // ── All tags derived from current tasks ────────────────────────────────────
  const allTags = [...new Set(tasks.flatMap((t) => t.tags || []))];

  // ── Open modal helpers ─────────────────────────────────────────────────────
  const openCreateModal = () => {
    setEditingTask(null);
    setTaskText("");
    setDueDate(null);
    setDueTime("");
    setSelectedTags([]);
    setRecurring("none");
    setShowDateModal(true);
  };

  const startEdit = (task) => {
    setEditingTask(task);
    setTaskText(task.text);
    setDueDate(task.dueDate ? new Date(task.dueDate) : null);
    setDueTime(
      task.dueDate
        ? new Date(task.dueDate).toTimeString().slice(0, 5)
        : ""
    );
    setSelectedTags(task.tags || []);
    setRecurring(task.recurring || "none");
    setShowDateModal(true);
  };

  const addTask = (text) => {
    if (!text.trim()) return;
    setEditingTask(null);
    setTaskText(text.trim());
    setDueDate(null);
    setDueTime("");
    setSelectedTags([]);
    setRecurring("none");
    setShowDateModal(true);
  };


  // ── Save / edit task ───────────────────────────────────────────────────────
  const saveTaskWithDate = () => {
    if (!taskText.trim()) {
      alert("Please enter a task name.");
      return;
    }
    if (!dueDate) {
      alert("Please select a due date.");
      return;
    }

    let finalDate = new Date(dueDate);
    if (dueTime) {
      const [h, m] = dueTime.split(":");
      finalDate.setHours(parseInt(h, 10));
      finalDate.setMinutes(parseInt(m, 10));
    }

    if (editingTask) {
      // Edit mode — update existing task in-place
      setTasks((prev) =>
        prev.map((t) =>
          t.id === editingTask.id
            ? { ...t, text: taskText, dueDate: finalDate.toISOString(), tags: selectedTags, recurring }
            : t
        )
      );
    } else {
      // Create mode
      const newTask = {
        id: Date.now(),
        text: taskText,
        dueDate: finalDate.toISOString(),
        tags: selectedTags,
        recurring,
      };
      setTasks((prev) => [...prev, newTask]);
      playSuccess();
    }

    setTaskText("");
    setDueDate(null);
    setDueTime("");
    setSelectedTags([]);
    setRecurring("none");
    setEditingTask(null);
    setShowDateModal(false);
  };

  // ── Task actions ───────────────────────────────────────────────────────────
  const completeTask = useCallback((id) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    setTasks((prev) => {
      const remaining = prev.filter((t) => t.id !== id);
      // Recurring: auto-add a clone with next due date
      if (task.recurring && task.recurring !== "none") {
        const nextDue = new Date(task.dueDate);
        if (task.recurring === "daily") nextDue.setDate(nextDue.getDate() + 1);
        else if (task.recurring === "weekly") nextDue.setDate(nextDue.getDate() + 7);
        else if (task.recurring === "monthly") nextDue.setMonth(nextDue.getMonth() + 1);
        const clone = { ...task, id: Date.now() + 1, dueDate: nextDue.toISOString() };
        return [...remaining, clone];
      }
      return remaining;
    });

    setCompletedTasks((prev) => [...prev, { ...task, completedAt: new Date().toISOString() }]);

    // Update streak
    setStreak((prev) => updateStreak(prev));

    playClick();
  }, [tasks]);

  const deleteTask = useCallback((id) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setDeletedTasks((prev) => [...prev, task]);
    playDelete();
  }, [tasks]);

  const sendToActive = (id) => {
    const task = completedTasks.find((t) => t.id === id);
    if (!task) return;
    setCompletedTasks((prev) => prev.filter((t) => t.id !== id));
    setTasks((prev) => [...prev, task]);
  };

  const deleteFromCompleted = (id) => {
    const task = completedTasks.find((t) => t.id === id);
    if (!task) return;
    setCompletedTasks((prev) => prev.filter((t) => t.id !== id));
    setDeletedTasks((prev) => [...prev, task]);
  };

  const restoreSingle = (id) => {
    const task = deletedTasks.find((t) => t.id === id);
    if (!task) return;
    setDeletedTasks((prev) => prev.filter((t) => t.id !== id));
    setTasks((prev) => [...prev, task]);
  };

  const permanentDelete = (id) => setDeletedTasks((prev) => prev.filter((t) => t.id !== id));

  // ── Filtering ──────────────────────────────────────────────────────────────
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.text.toLowerCase().includes(search.toLowerCase());
    const matchesTag = activeTag === null || (t.tags || []).includes(activeTag);
    return matchesSearch && matchesTag;
  });

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  const dayAfter = new Date(today); dayAfter.setDate(today.getDate() + 2);

  const overdueTasks = filteredTasks.filter((t) => new Date(t.dueDate) < today);
  const todayTasks = filteredTasks.filter((t) => { const d = new Date(t.dueDate); return d >= today && d < tomorrow; });
  const tomorrowTasks = filteredTasks.filter((t) => { const d = new Date(t.dueDate); return d >= tomorrow && d < dayAfter; });
  const upcomingTasks = filteredTasks.filter((t) => new Date(t.dueDate) >= dayAfter);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="app" style={{ width: "100vw", overflowX: "hidden" }}>

      {/* NAVBAR */}
      <nav
        className="navbar"
        style={{ position: "relative", width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        <h2 className="logo" style={{ width: "20%" }}>TaskFlow</h2>

        {isMobile && (
          <div className="hamburger" onClick={() => setMobileMenu(!mobileMenu)} style={{ display: "block", zIndex: 10000 }}>
            ☰
          </div>
        )}

        {!isMobile && (
          <div className="nav-menu show" style={{ width: "60%", display: "flex", justifyContent: "center" }}>
            <button onClick={() => setPage("home")} className={page === "home" ? "active" : ""}>Home</button>
            <button onClick={() => setPage("analytics")} className={page === "analytics" ? "active" : ""}>Analytics</button>
            <button onClick={() => setPage("about")} className={page === "about" ? "active" : ""}>About</button>
          </div>
        )}

        {isMobile && mobileMenu && (
          <div
            style={{
              position: "absolute", top: "100%", left: 0, width: "100%",
              background: "rgba(0,0,0,0.95)", borderBottom: "1px solid var(--accent)",
              display: "flex", flexDirection: "column", padding: "2% 0", zIndex: 9999,
            }}
          >
          {["home", "analytics", "about"].map((p) => (
              <button
                key={p}
                style={{ background: "none", border: "none", color: "var(--accent)", padding: "15px", fontSize: "16px" }}
                onClick={() => { setPage(p); setMobileMenu(false); }}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}

            {/* Theme + Export inside mobile menu */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", padding: "12px 0", borderTop: "1px solid var(--border-accent)", marginTop: "4px" }}>
              <ThemeSwitcher theme={theme} setTheme={setTheme} />
              <ExportMenu tasks={tasks} completedTasks={completedTasks} />
            </div>
          </div>
        )}

        <div
          className="nav-clock"
          style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "12px" }}
        >
          {/* On desktop, show theme + export in navbar; on mobile they live in the hamburger menu */}
          {!isMobile && <ThemeSwitcher theme={theme} setTheme={setTheme} />}
          {!isMobile && <ExportMenu tasks={tasks} completedTasks={completedTasks} />}
          <AnalogClock />
        </div>
      </nav>

      {/* MAIN */}
      <main
        className="main"
        style={{ width: "100%", padding: isMobile ? "5% 2%" : "2%" }}
      >
        {page === "analytics" && (
          <BuiltInAnalytics
            tasks={tasks}
            completedTasks={completedTasks}
            deletedTasks={deletedTasks}
            isMobile={isMobile}
            streak={streak}
          />
        )}
        {page === "about" && <AboutPage />}

        {page === "home" && (
          <div className="dashboard-container" style={{ width: "100%" }}>
            <div className="dashboard-card" style={{ width: "100%", padding: isMobile ? "4%" : "2%" }}>

              {/* Stat Cards */}
              <div
                style={{
                  display: "flex", flexDirection: "row", flexWrap: "nowrap",
                  justifyContent: "space-between", width: "100%", gap: "2%", marginBottom: "2%",
                }}
              >
                <StatCard title="ACTIVE" value={tasks.length} active={view === "active"} onClick={() => setView("active")} />
                <StatCard title="COMPLETED" value={completedTasks.length} active={view === "completed"} onClick={() => setView("completed")} />
                <StatCard title="DELETED" value={deletedTasks.length} active={view === "deleted"} onClick={() => setView("deleted")} />
              </div>

              {/* Header (task input) */}
              <div style={{ width: "100%", marginBottom: "2%" }}>
                <Header addTask={addTask} />
              </div>

              {/* Search */}
              <input
                className="task-search"
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: "100%", marginBottom: "1%", boxSizing: "border-box" }}
              />

              {/* Tag filter bar */}
              {view === "active" && (
                <TagFilterBar allTags={allTags} activeTag={activeTag} setActiveTag={setActiveTag} />
              )}

              {/* Active view */}
              {view === "active" && (
                <div className="task-list-container" style={{ width: "100%" }}>
                  <TaskSection title="OVERDUE" tasks={overdueTasks} completeTask={completeTask} deleteTask={deleteTask} startEdit={startEdit} />
                  <TaskSection title="TODAY" tasks={todayTasks} completeTask={completeTask} deleteTask={deleteTask} startEdit={startEdit} />
                  <TaskSection title="TOMORROW" tasks={tomorrowTasks} completeTask={completeTask} deleteTask={deleteTask} startEdit={startEdit} />
                  <TaskSection title="UPCOMING" tasks={upcomingTasks} completeTask={completeTask} deleteTask={deleteTask} startEdit={startEdit} />
                  {filteredTasks.length === 0 && (
                    <p style={{ color: "#aaa", textAlign: "center", marginTop: "30px" }}>
                      {activeTag ? `No tasks tagged "${activeTag}"` : "No active tasks. Add one! ✨"}
                    </p>
                  )}
                </div>
              )}

              {view === "completed" && (
                <CompletedSection
                  completedTasks={completedTasks}
                  sendToActive={sendToActive}
                  deleteFromCompleted={deleteFromCompleted}
                />
              )}

              {view === "deleted" && (
                <div className="deleted-tasks-view" style={{ width: "100%" }}>
                  {deletedTasks.length === 0 && (
                    <p style={{ color: "#aaa", marginTop: "20px", textAlign: "center" }}>No deleted tasks</p>
                  )}
                  {deletedTasks.map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      primary="Restore"
                      primaryColor="#3b82f6"
                      secondary="Delete Permanently"
                      secondaryColor="#ff4d4d"
                      onPrimary={restoreSingle}
                      onSecondary={permanentDelete}
                    />
                  ))}
                </div>
              )}
            </div>

            <HomeContent tasks={tasks} completedTasks={completedTasks} />
            <Footer />
          </div>
        )}
      </main>

      {/* FAB: opens the create modal */}
      <div className="fab-add" onClick={openCreateModal}>+</div>

      {/* Date/Time Modal (shared for create + edit) */}
      {showDateModal && (
        <DateTimeModal
          taskText={taskText}
          setTaskText={setTaskText}
          dueDate={dueDate}
          setDueDate={setDueDate}
          dueTime={dueTime}
          setDueTime={setDueTime}
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
          recurring={recurring}
          setRecurring={setRecurring}
          lastMeridiem={lastMeridiem}
          saveTaskWithDate={saveTaskWithDate}
          close={() => { setShowDateModal(false); setEditingTask(null); }}
          isEditing={!!editingTask}
        />
      )}
    </div>
  );
}

export default App;