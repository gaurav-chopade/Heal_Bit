import Icon from "./icons";

export default function Footer({ onAbout, onContact }) {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <div className="nav-brand as-static">
            <svg className="nav-ecg" viewBox="0 0 52 36" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 18 H14 L19 8 L27 28 L33 18 H50" />
            </svg>
            Heal<span className="dot">·</span>Bit
          </div>
          <p className="muted">Coordinated healthcare for patients, hospitals, and administrators.</p>
        </div>

        <nav className="footer-links">
          <button className="link-btn" onClick={onAbout}>
            <Icon name="care" size={16} /> About us
          </button>
          <button className="link-btn" onClick={onContact}>
            <Icon name="calendar" size={16} /> Contact us
          </button>
        </nav>
      </div>
      <div className="footer-bottom muted">© {new Date().getFullYear()} Heal-Bit · All rights reserved.</div>
    </footer>
  );
}
