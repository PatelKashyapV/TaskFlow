function Footer() {
  const year = new Date().getFullYear();
  const links = [
    { label: "Home", href: "#" },
    { label: "Analytics", href: "#" },
    { label: "About", href: "#" },
  ];

  return (
    <footer className="footer">
      <div className="footer-inner">

        {/* Brand */}
        <div className="footer-brand">
          <span className="footer-brand__logo">✅ TaskFlow</span>
          <p className="footer-brand__tagline">
            Your personal productivity companion.<br />
            Built for focus. Designed to inspire.
          </p>
        </div>

        {/* Links */}
        <div className="footer-links">
          <p className="footer-links__heading">Navigation</p>
          {links.map((l) => (
            <a key={l.label} href={l.href} className="footer-links__item">{l.label}</a>
          ))}
        </div>

        {/* Stats/Features */}
        <div className="footer-links">
          <p className="footer-links__heading">Features</p>
          {["Smart Scheduling", "Streak Tracking", "Tag Filtering", "Export Tasks"].map((f) => (
            <span key={f} className="footer-links__item footer-links__item--plain">{f}</span>
          ))}
        </div>

        {/* Built with */}
        <div className="footer-links">
          <p className="footer-links__heading">Built With</p>
          {["React 18", "Vite 5", "Chrome MV3", "Web Audio API"].map((t) => (
            <span key={t} className="footer-links__item footer-links__item--plain">{t}</span>
          ))}
        </div>

      </div>

      <div className="footer-bottom">
        <span>© {year} TaskFlow — All rights reserved</span>
        <span>Crafted with ❤️ by <strong>Kashyap Patel</strong></span>
      </div>
    </footer>
  );
}

export default Footer;
