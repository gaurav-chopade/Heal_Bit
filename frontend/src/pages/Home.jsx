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

const STATS = [
  { value: "30 min", label: "Every appointment slot, fixed and protected" },
  { value: "18+", label: "Specialities, from Cardiology to Paediatrics" },
  { value: "24×7", label: "Book whenever it suits you — no phone calls" },
  { value: "100%", label: "Hospitals verified before they go live" },
];

const FEATURES = [
  {
    icon: "calendar",
    title: "Real slots, not requests",
    copy: "Every doctor publishes their working days, hours and breaks. You see the exact 30-minute slots that are actually free — and once you take one, it's yours.",
  },
  {
    icon: "file",
    title: "Your health locker",
    copy: "Keep prescriptions, scans and reports in one place. Upload once, and share them with the doctor you're seeing instead of carrying a folder of paper.",
  },
  {
    icon: "care",
    title: "Pay your way",
    copy: "Settle online in seconds with UPI, card or netbanking — or simply choose to pay in cash at the clinic. Your doctor sees the payment status either way.",
  },
  {
    icon: "stethoscope",
    title: "Doctors in control",
    copy: "Doctors manage their own calendar, confirm or decline requests, and mark visits complete. No front-desk bottleneck in the middle.",
  },
  {
    icon: "chart",
    title: "Insight for hospitals",
    copy: "Live dashboards show appointment volume, busiest doctors and month-on-month trends — so hospitals can staff for what's actually coming.",
  },
  {
    icon: "users",
    title: "Ratings you can trust",
    copy: "Only patients who actually completed a visit can rate the doctor and the hospital. No noise, no anonymous drive-by reviews.",
  },
];

const SPECIALITIES = [
  "Cardiology", "Dermatology", "Neurology", "Orthopedics", "Paediatrics",
  "Gynaecology", "General Medicine", "ENT", "Ophthalmology", "Psychiatry",
  "Dentistry", "Urology", "Oncology", "Gastroenterology",
];

const VOICES = [
  {
    quote: "I booked a cardiology slot at 11 pm for the next morning. No calls, no waiting to hear back — the confirmation was there when I woke up.",
    name: "Ananya I.",
    role: "Patient · Pune",
  },
  {
    quote: "My schedule is finally mine. I set my days, my hours, my lunch break — and the platform simply stops offering slots I can't take.",
    name: "Dr. Suresh R.",
    role: "Neurologist · Bengaluru",
  },
  {
    quote: "We used to reconstruct the week from three registers. Now the dashboard tells us which doctors are loaded and where we're losing appointments.",
    name: "Fortis Wellness",
    role: "Hospital · Mumbai",
  },
];

const FAQS = [
  {
    q: "How much does Heal-Bit cost patients?",
    a: "Creating an account and booking appointments is free. You only ever pay the doctor's consultation fee — shown upfront before you confirm the slot, with no booking charge added on top.",
  },
  {
    q: "Can I pay at the clinic instead of online?",
    a: "Yes. When you book, choose 'Pay in cash' and the appointment is reserved as payment pending. Settle it at the desk on the day, and your doctor marks it paid when the visit is done.",
  },
  {
    q: "What happens if I need to cancel?",
    a: "You can cancel from My Appointments. Each hospital sets its own policy — some allow cancellation right up to the visit, others need a few hours' notice. If you paid online, an eligible cancellation is refunded automatically.",
  },
  {
    q: "Who can see the documents I upload?",
    a: "Only you, and the doctors you actually have an appointment with. Nobody else on the platform — not other hospitals, not other doctors — can open your files.",
  },
  {
    q: "How does a hospital join Heal-Bit?",
    a: "Register your hospital with your details and we'll issue a registration number automatically. An administrator reviews and approves the listing before it becomes visible to patients, so every hospital on Heal-Bit is verified.",
  },
  {
    q: "Do doctors need to create their own accounts?",
    a: "No. Their hospital adds them and issues their login. From then on the doctor controls their own schedule, appointments and consultation fee.",
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
      {/* ---------------- HERO ---------------- */}
      <section className="hero2">
        <div className="hero2-copy fade-up">
          <p className="eyebrow">Unified healthcare system</p>
          <h1 className="hero2-title">
            Care, <span className="accent-word">coordinated</span> in one place.
          </h1>
          <p className="lead">
            Heal-Bit connects patients, doctors and hospitals on one platform. Find a hospital near you,
            see which doctor is genuinely free, and book a real appointment slot — in the time it takes
            to make a phone call nobody answers.
          </p>
          <div className="hero2-cta">
            <Link to="/patient/register" className="btn btn-primary btn-lg">Book your first appointment</Link>
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

      {/* ---------------- STAT STRIP ---------------- */}
      <section className="stat-strip">
        {STATS.map((s) => (
          <div className="stat-item" key={s.value}>
            <div className="stat-num">{s.value}</div>
            <p>{s.label}</p>
          </div>
        ))}
      </section>

      {/* ---------------- FEATURES ---------------- */}
      <section className="section">
        <div className="section-head center">
          <p className="eyebrow">What you get</p>
          <h2>Built around the appointment, not the paperwork</h2>
          <p className="muted">
            Everything on Heal-Bit exists to answer one question quickly — when can I see the right doctor?
          </p>
        </div>
        <div className="feature-grid">
          {FEATURES.map((f) => (
            <div className="feature-card" key={f.title}>
              <span className="feature-icon"><Icon name={f.icon} size={22} /></span>
              <h3>{f.title}</h3>
              <p>{f.copy}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- FOR PATIENTS ---------------- */}
      <section className="section">
        <div className="split">
          <div className="split-body">
            <p className="eyebrow">For patients</p>
            <h2>Stop chasing appointments</h2>
            <p className="muted lead-sm">
              Search hospitals by city or pincode, compare doctors by speciality, experience and rating,
              and pick a slot that fits your day. Everything you've booked lives in one list.
            </p>
            <ul className="checklist">
              <li><Icon name="care" size={17} /> See only the slots that are truly open</li>
              <li><Icon name="care" size={17} /> Know the consultation fee before you commit</li>
              <li><Icon name="care" size={17} /> Keep reports and prescriptions in your locker</li>
              <li><Icon name="care" size={17} /> Cancel or reschedule without a phone call</li>
            </ul>
            <div className="actions mt-3">
              <Link to="/patient/register" className="btn btn-primary">Create a free account</Link>
              <Link to="/patient/login" className="btn btn-outline">I already have one</Link>
            </div>
          </div>

          <div className="split-media" aria-hidden="true">
            <div className="mock-panel">
              <div className="mock-head">
                <span className="mock-dot" /><span className="mock-dot" /><span className="mock-dot" />
                <span className="mock-title">Available slots · Tue</span>
              </div>
              <div className="mock-slots">
                {["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30"].map((t, i) => (
                  <span key={t} className={`mock-slot${i === 4 ? " picked" : ""}${i === 1 || i === 6 ? " taken" : ""}`}>{t}</span>
                ))}
              </div>
              <div className="mock-row">
                <span className="badge badge-confirmed">Confirmed</span>
                <span className="mock-row-text">Dr. Anil Mehta · Orthopedics</span>
                <span className="mock-fee">₹900</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- FOR HOSPITALS & DOCTORS ---------------- */}
      <section className="section">
        <div className="split reverse">
          <div className="split-body">
            <p className="eyebrow">For hospitals &amp; doctors</p>
            <h2>Run the day, not the register</h2>
            <p className="muted lead-sm">
              Hospitals onboard their doctors and issue logins in a minute. Doctors take it from there —
              their calendar, their fee, their decisions on every request.
            </p>
            <ul className="checklist">
              <li><Icon name="care" size={17} /> Add or remove doctors and set up their access</li>
              <li><Icon name="care" size={17} /> Publish working days, hours and break times</li>
              <li><Icon name="care" size={17} /> Confirm, decline or complete appointments in one click</li>
              <li><Icon name="care" size={17} /> Watch volume and performance on a live dashboard</li>
            </ul>
            <div className="actions mt-3">
              <Link to="/hospital/register" className="btn btn-primary">List your hospital</Link>
              <Link to="/doctor/login" className="btn btn-outline">Doctor sign in</Link>
            </div>
          </div>

          <div className="split-media" aria-hidden="true">
            <div className="mock-panel">
              <div className="mock-head">
                <span className="mock-dot" /><span className="mock-dot" /><span className="mock-dot" />
                <span className="mock-title">This month</span>
              </div>
              <div className="mock-bars">
                {[38, 62, 45, 80, 56, 71, 90].map((h, i) => (
                  <span key={i} className="mock-bar" style={{ height: `${h}%` }} />
                ))}
              </div>
              <div className="mock-kpis">
                <div><strong>128</strong><span>appointments</span></div>
                <div><strong>9</strong><span>doctors</span></div>
                <div><strong>4.6</strong><span>avg rating</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- SPECIALITIES ---------------- */}
      <section className="section">
        <div className="section-head center">
          <p className="eyebrow">Find the right care</p>
          <h2>Specialities on Heal-Bit</h2>
          <p className="muted">From a routine check-up to a second opinion — search by what you actually need.</p>
        </div>
        <div className="spec-chips">
          {SPECIALITIES.map((s) => (
            <span className="spec-chip" key={s}>{s}</span>
          ))}
          <span className="spec-chip more">and more</span>
        </div>
      </section>

      {/* ---------------- ROLES (sign-in hub) ---------------- */}
      <section className="section" id="roles">
        <div className="section-head center">
          <p className="eyebrow">Sign in</p>
          <h2>Choose your space</h2>
          <p className="muted">Four tailored experiences, one platform. Pick how you’re signing in.</p>
        </div>
        <div className="role-grid four">
          <div className="role-card">
            <span className="role-icon"><Icon name="user" size={24} /></span>
            <h3>For patients</h3>
            <p>Find hospitals, compare doctors, and book 30-minute appointment slots.</p>
            <div className="links">
              <Link to="/patient/login" className="btn btn-sm btn-primary">Sign in</Link>
              <Link to="/patient/register" className="btn btn-sm btn-outline">Create account</Link>
            </div>
          </div>
          <div className="role-card">
            <span className="role-icon"><Icon name="stethoscope" size={24} /></span>
            <h3>For doctors</h3>
            <p>Set your weekly schedule and manage every appointment request.</p>
            <div className="links">
              <Link to="/doctor/login" className="btn btn-sm btn-primary">Sign in</Link>
            </div>
          </div>
          <div className="role-card">
            <span className="role-icon"><Icon name="hospital" size={24} /></span>
            <h3>For hospitals</h3>
            <p>Onboard doctors, manage your listing, and track activity live.</p>
            <div className="links">
              <Link to="/hospital/login" className="btn btn-sm btn-primary">Sign in</Link>
              <Link to="/hospital/register" className="btn btn-sm btn-outline">Register</Link>
            </div>
          </div>
          <div className="role-card">
            <span className="role-icon"><Icon name="chart" size={24} /></span>
            <h3>For administrators</h3>
            <p>Approve hospitals, oversee patients, and monitor the platform.</p>
            <div className="links">
              <Link to="/admin/login" className="btn btn-sm btn-primary">Sign in</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- HOW IT WORKS ---------------- */}
      <section className="section">
        <div className="section-head center">
          <p className="eyebrow">How it works</p>
          <h2>From sign-up to seen, in three steps</h2>
        </div>
        <div className="steps">
          <div className="step">
            <span className="step-no">01</span>
            <h3>Create your account</h3>
            <p className="muted">Register as a patient in under a minute — a name, a number, and you're in. No paperwork, no waiting for approval.</p>
          </div>
          <div className="step">
            <span className="step-no">02</span>
            <h3>Find a doctor &amp; slot</h3>
            <p className="muted">Search by city or pincode, compare specialities and ratings, then pick from the 30-minute slots that are genuinely free.</p>
          </div>
          <div className="step">
            <span className="step-no">03</span>
            <h3>Book, pay and track</h3>
            <p className="muted">Pay online or choose cash at the clinic. Your doctor confirms, and you follow the appointment right through to completion.</p>
          </div>
        </div>
      </section>

      {/* ---------------- TRUST ---------------- */}
      <section className="section">
        <div className="trust-band">
          <div className="trust-head">
            <p className="eyebrow">Trust &amp; safety</p>
            <h2>Health data deserves better than an afterthought</h2>
            <p className="muted">
              Heal-Bit is built so that the sensitive parts stay private and the people on it are who they say they are.
            </p>
          </div>
          <div className="trust-grid">
            <div className="trust-item">
              <span className="trust-icon"><Icon name="hospital" size={20} /></span>
              <div>
                <h3>Verified hospitals</h3>
                <p>Every hospital is reviewed and approved by an administrator before a single patient can find it.</p>
              </div>
            </div>
            <div className="trust-item">
              <span className="trust-icon"><Icon name="file" size={20} /></span>
              <div>
                <h3>Private by default</h3>
                <p>Your documents are visible only to you and the doctors you've actually booked with.</p>
              </div>
            </div>
            <div className="trust-item">
              <span className="trust-icon"><Icon name="care" size={20} /></span>
              <div>
                <h3>Secure payments</h3>
                <p>Online payments run through a trusted gateway. Card and UPI details never touch our servers.</p>
              </div>
            </div>
            <div className="trust-item">
              <span className="trust-icon"><Icon name="user" size={20} /></span>
              <div>
                <h3>Protected accounts</h3>
                <p>Encrypted passwords, secure sessions and bot protection on every sign-in and sign-up.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- VOICES ---------------- */}
      <section className="section">
        <div className="section-head center">
          <p className="eyebrow">In their words</p>
          <h2>What Heal-Bit changes, day to day</h2>
        </div>
        <div className="quote-grid">
          {VOICES.map((v) => (
            <figure className="quote-card" key={v.name}>
              <blockquote>“{v.quote}”</blockquote>
              <figcaption>
                <strong>{v.name}</strong>
                <span>{v.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ---------------- FAQ ---------------- */}
      <section className="section">
        <div className="section-head center">
          <p className="eyebrow">Questions</p>
          <h2>Everything else you might be wondering</h2>
        </div>
        <div className="faq-list">
          {FAQS.map((f) => (
            <details className="faq-item" key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ---------------- CLOSING CTA ---------------- */}
      <section className="cta-band">
        <h2>Your next appointment is a minute away</h2>
        <p>Join Heal-Bit and book care that actually fits your day.</p>
        <div className="cta-actions">
          <Link to="/patient/register" className="btn btn-lg cta-primary">Get started free</Link>
          <Link to="/hospital/register" className="btn btn-lg cta-ghost">List your hospital</Link>
        </div>
      </section>

      <Footer onAbout={() => setModal("about")} onContact={() => setModal("contact")} />

      {/* ---------------- MODALS ---------------- */}
      <Modal open={modal === "about"} onClose={close} title="About Heal-Bit">
        <p>
          Heal-Bit began with a simple frustration: finding care in India often means phone calls that go
          unanswered, waiting rooms that overflow, and a folder of reports you have to carry everywhere.
        </p>
        <p className="mt-2">
          So we built one place where it all connects. Patients discover verified hospitals and book real
          slots. Doctors own their calendar instead of working around a register. Hospitals see their day
          before it happens. And administrators keep the network trustworthy.
        </p>
        <ul className="about-list">
          <li><Icon name="user" size={18} /> Patient-first booking, history and health documents</li>
          <li><Icon name="stethoscope" size={18} /> Doctors with their own schedules and logins</li>
          <li><Icon name="hospital" size={18} /> Verified hospitals, approved before they go live</li>
          <li><Icon name="chart" size={18} /> Live insight instead of end-of-month guesswork</li>
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
