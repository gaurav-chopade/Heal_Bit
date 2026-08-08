import Icon from "./icons";
import Logo from "./Logo";

export default function Footer({ onAbout, onContact }) {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <div className="nav-brand as-static">
            <Logo size={30} />
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
