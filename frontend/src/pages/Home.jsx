import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Icon from "../components/icons";
import Modal from "../components/Modal";
import Footer from "../components/Footer";

const CONTACT = {
  email: "support@healbit.com",
  phone: "+91 98765 43210",
  hours: "Mon–Sat, 9:00–18:00 IST",
};

const ROLES = [
  {
    icon: "user", title: "For patients",
    copy: "Find hospitals, view doctors, and book 30-minute appointment slots.",
    actions: [
      { to: "/patient/login", label: "Sign in", primary: true },
      { to: "/patient/register", label: "Create account", primary: false },
    ],
  },
  {
    icon: "stethoscope", title: "For doctors",
    copy: "Set your weekly schedule and confirm or complete your appointments.",
    actions: [{ to: "/doctor/login", label: "Sign in", primary: true }],
  },
  {
    icon: "hospital", title: "For hospitals",
    copy: "Register, add or remove doctors, and track activity with live insights.",
    actions: [
      { to: "/hospital/login", label: "Sign in", primary: true },
      { to: "/hospital/register", label: "Register", primary: false },
    ],
  },
  {
    icon: "chart", title: "For administrators",
    copy: "Approve hospitals, oversee patients, and monitor the whole platform.",
    actions: [{ to: "/admin/login", label: "Sign in", primary: true }],
  },
];

export default function Home() {
  const [modal, setModal] = useState(null);
  const close = () => setModal(null);
  const location = useLocation();

  // When arriving from the navbar "Sign in" on another page, scroll to the role chooser.
  useEffect(() => {
    if (location.state?.scrollTo === "roles") {
      setTimeout(() => document.getElementById("roles")?.scrollIntoView({ behavior: "smooth" }), 60);
    }
  }, [location]);

  return (
    <div className="home">
      {/* HERO */}
      <section className="hero2">
        <div className="hero2-copy fade-up">
          <p className="eyebrow">Unified healthcare system</p>
          <h1 className="hero2-title">
            Care, <span className="accent-word">coordinated</span> in one place.
          </h1>
          <p className="lead">
            Heal-Bit brings patients, doctors, and hospitals onto a single platform —
            browse hospitals, book real appointment slots, and manage care without the back-and-forth.
          </p>
          <div className="hero2-cta">
            <Link to="/patient/register" className="btn btn-primary btn-lg">Get started</Link>
          </div>
          <div className="hero2-links">
            <button className="link-btn" onClick={() => setModal("about")}>About Heal-Bit</button>
            <span className="sep">·</span>
            <button className="link-btn" onClick={() => setModal("contact")}>Contact us</button>
          </div>
        </div>

        <div className="hero2-visual fade-up delay-1" aria-hidden="true">
          <div className="visual-frame">
            <svg className="visual-ecg" viewBox="0 0 320 90" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M0 46 H96 L112 46 L122 20 L138 74 L150 46 L168 46 L178 30 L188 46 H320" />
            </svg>
            <div className="float-card fc-appt">
              <span className="badge badge-confirmed">Confirmed</span>
              <div className="fc-title">Cardiology · Dr. Asha Rao</div>
              <div className="fc-sub">Tomorrow · 11:00</div>
            </div>
            <div className="float-card fc-hosp">
              <span className="tile-icon sm"><Icon name="hospital" size={18} /></span>
              <div>
                <div className="fc-title">City Care Hospital</div>
                <div className="fc-sub">Pune · Active</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROLES — the single sign-in surface, one entry per role */}
      <section className="section" id="roles">
        <div className="section-head">
          <h2>Choose your space</h2>
          <p className="muted">Four tailored experiences, one platform. Pick how you’re signing in.</p>
        </div>
        <div className="role-grid four">
          {ROLES.map((r) => (
            <div className="role-card" key={r.title}>
              <span className="role-icon"><Icon name={r.icon} size={24} /></span>
              <h3>{r.title}</h3>
              <p>{r.copy}</p>
              {r.note && <p className="role-note">{r.note}</p>}
              <div className="links">
                {r.actions.map((a) => (
                  <Link key={a.to} to={a.to} className={`btn btn-sm ${a.primary ? "btn-primary" : "btn-outline"}`}>
                    {a.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section">
        <div className="section-head">
          <h2>How it works</h2>
          <p className="muted">From sign-up to seen, in three steps.</p>
        </div>
        <div className="steps">
          <div className="step">
            <span className="step-no">01</span>
            <h3>Create your account</h3>
            <p className="muted">Register as a patient in under a minute — no paperwork.</p>
          </div>
          <div className="step">
            <span className="step-no">02</span>
            <h3>Find a doctor &amp; slot</h3>
            <p className="muted">Search by city or pincode, then pick an open 30-minute slot.</p>
          </div>
          <div className="step">
            <span className="step-no">03</span>
            <h3>Book and track</h3>
            <p className="muted">Your doctor confirms the request and you track it end to end.</p>
          </div>
        </div>
      </section>

      <Footer onAbout={() => setModal("about")} onContact={() => setModal("contact")} />

      <Modal open={modal === "about"} onClose={close} title="About Heal-Bit">
        <p>
          Heal-Bit is a unified healthcare platform built to remove the friction between people and care.
          Patients discover hospitals and book appointments in one place, doctors manage their own schedules
          and requests, hospitals oversee their teams, and administrators keep the network trustworthy.
        </p>
        <ul className="about-list">
          <li><Icon name="user" size={18} /> Patient-first booking and appointment history</li>
          <li><Icon name="stethoscope" size={18} /> Doctors with their own schedules and logins</li>
          <li><Icon name="hospital" size={18} /> Verified hospitals, approved by administrators</li>
        </ul>
      </Modal>

      <Modal open={modal === "contact"} onClose={close} title="Contact us">
        <p className="muted">We usually respond within one business day.</p>
        <div className="contact-list">
          <a className="contact-row" href={`mailto:${CONTACT.email}`}>
            <span className="contact-icon"><Icon name="clipboard" size={20} /></span>
            <span>
              <span className="contact-label">Email</span>
              <span className="contact-value">{CONTACT.email}</span>
            </span>
          </a>
          <a className="contact-row" href={`tel:${CONTACT.phone.replace(/\s+/g, "")}`}>
            <span className="contact-icon"><Icon name="calendar" size={20} /></span>
            <span>
              <span className="contact-label">Phone</span>
              <span className="contact-value">{CONTACT.phone}</span>
            </span>
          </a>
          <div className="contact-row static">
            <span className="contact-icon"><Icon name="care" size={20} /></span>
            <span>
              <span className="contact-label">Hours</span>
              <span className="contact-value">{CONTACT.hours}</span>
            </span>
          </div>
        </div>
      </Modal>
    </div>
  );
}
