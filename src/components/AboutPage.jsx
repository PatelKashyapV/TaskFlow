function AboutPage() {
  const features = [
    { icon: "📅", title: "Smart Scheduling", desc: "Assign precise due dates and times. Tasks auto-sort into Overdue, Today, Tomorrow, and Upcoming so you always know what's next." },
    { icon: "🏷️", title: "Tags & Categories", desc: "Categorise every task — Work, Personal, Health, Finance, Education. Filter with one tap to zoom into any area of your life." },
    { icon: "🔁", title: "Recurring Tasks", desc: "Set tasks to repeat daily, weekly, or monthly. TaskFlow automatically schedules the next occurrence the moment you complete one." },
    { icon: "🔔", title: "Smart Notifications", desc: "Never miss a deadline. Browser notifications fire 5 minutes before any task is due — even while the popup is closed." },
    { icon: "📌", title: "Live Badge Counter", desc: "See your active task count directly on the extension icon. At a glance, you know exactly how much is left to do." },
    { icon: "📊", title: "Streak Tracker", desc: "Build unstoppable momentum. Every day you complete a task grows your streak 🔥. Watch your personal best climb higher." },
    { icon: "📤", title: "Export Anytime", desc: "Download all your tasks as JSON or CSV with one click. Perfect for backup, reporting, or importing into other tools." },
    { icon: "🎨", title: "Dark & Light Themes", desc: "Switch between Dark and Light mode instantly. Your preference is remembered across sessions." },
  ];

  const stack = [
    { name: "React 18", color: "#61dafb", desc: "UI framework" },
    { name: "Vite 5", color: "#a78bfa", desc: "Build tool" },
    { name: "CSS3", color: "#4fd1c5", desc: "Styling" },
    { name: "Web Audio API", color: "#f59e0b", desc: "Sound effects" },
    { name: "Chrome MV3", color: "#34d399", desc: "Extension platform" },
    { name: "localStorage", color: "#fb923c", desc: "Data persistence" },
  ];

  const shortcuts = [
    { keys: "Enter", action: "Add task instantly from header input" },
    { keys: "+ FAB", action: "Open full modal with date, tags & recurrence" },
    { keys: "✏️ icon", action: "Edit an existing task inline" },
    { keys: "☰ menu", action: "Access theme, export & nav on mobile" },
  ];

  return (
    <div className="about-page">

      {/* Hero */}
      <div className="about-hero">
        <div className="about-hero__icon">✅</div>
        <h1 className="about-hero__title">TaskFlow</h1>
        <p className="about-hero__subtitle">Smart Task Manager for Chrome</p>
        <p className="about-hero__desc">
          A premium, glassmorphism-styled productivity extension designed to help you
          capture tasks instantly, stay organised with categories and schedules,
          and build daily completion habits with streak tracking.
        </p>
        <div className="about-hero__badges">
          <span className="about-badge">v1.0.0</span>
          <span className="about-badge">Chrome MV3</span>
          <span className="about-badge">Open Source</span>
        </div>
      </div>

      {/* Features Grid */}
      <section className="about-section">
        <h2 className="about-section__title">✨ Everything You Need</h2>
        <p className="about-section__sub">8 powerful features packed into one beautiful extension.</p>
        <div className="about-features-grid">
          {features.map((f, i) => (
            <div className="about-feature-card" key={i}>
              <span className="about-feature-card__icon">{f.icon}</span>
              <h3 className="about-feature-card__title">{f.title}</h3>
              <p className="about-feature-card__desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Keyboard Shortcuts */}
      <section className="about-section">
        <h2 className="about-section__title">⌨️ Quick Reference</h2>
        <p className="about-section__sub">Common actions at your fingertips.</p>
        <div className="about-shortcuts">
          {shortcuts.map((s, i) => (
            <div className="about-shortcut-row" key={i}>
              <span className="about-shortcut-key">{s.keys}</span>
              <span className="about-shortcut-action">{s.action}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="about-section">
        <h2 className="about-section__title">⚙️ Built With</h2>
        <p className="about-section__sub">Modern, fast, and dependency-light.</p>
        <div className="about-stack-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
          {stack.map((t, i) => (
            <div className="about-stack-card" key={i} style={{ 
              borderColor: "var(--border-subtle)", 
              boxShadow: `0 4px 16px ${t.color}15`,
              background: `linear-gradient(135deg, var(--bg-card), ${t.color}05)`
            }}>
              <span className="about-stack-card__dot" style={{ background: t.color, boxShadow: `0 0 10px ${t.color}` }} />
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span className="about-stack-card__name" style={{ fontSize: "14px" }}>{t.name}</span>
                <span className="about-stack-card__desc" style={{ marginLeft: 0 }}>{t.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Privacy */}
      <section className="about-section">
        <div className="about-privacy-card">
          <span style={{ fontSize: "32px" }}>🔒</span>
          <div>
            <h3 style={{ margin: "0 0 6px 0", color: "var(--accent)" }}>100% Private by Design</h3>
            <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "14px", lineHeight: "1.7" }}>
              TaskFlow stores all your data exclusively in your browser's localStorage.
              No account required. No server. No tracking. Your tasks never leave your device.
            </p>
          </div>
        </div>
      </section>

      {/* Developer */}
      <section className="about-section">
        <h2 className="about-section__title">👨‍💻 Developer</h2>
        <div className="about-dev-card">
          <div className="about-dev-card__avatar">KP</div>
          <div>
            <h3 style={{ margin: "0 0 4px 0", color: "var(--text-primary)", fontSize: "20px" }}>Kashyap Patel</h3>
            <p style={{ margin: "0 0 8px 0", color: "var(--accent)", fontSize: "13px" }}>Frontend Developer</p>
            <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "14px", lineHeight: "1.6" }}>
              Focused on building fast, beautiful, and accessible web applications using modern React.
              TaskFlow is a passion project built to solve real productivity problems.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}

export default AboutPage;
