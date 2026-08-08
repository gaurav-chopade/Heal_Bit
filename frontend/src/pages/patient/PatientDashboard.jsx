import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { listAppointments } from "../../api/appointmentApi";
import Icon from "../../components/icons";
import Kpi from "../../components/Kpi";
import StatusBadge from "../../components/StatusBadge";
import PaymentBadge from "../../components/PaymentBadge";
import { friendlyDate, formatDate, money, initials } from "../../utils/format";

const todayIso = new Date().toISOString().split("T")[0];
const LIVE = ["PENDING", "CONFIRMED"];

export default function PatientDashboard() {
  const { auth } = useAuth();
  const [appts, setAppts] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    listAppointments()
      .then(({ data }) => setAppts(data))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const { upcoming, past, next, completedCount, unpaidCount, spent } = useMemo(() => {
    const byWhen = (a, b) =>
      (a.appointmentDate + a.appointmentTime).localeCompare(b.appointmentDate + b.appointmentTime);

    const upcoming = appts
      .filter((a) => LIVE.includes(a.status) && a.appointmentDate >= todayIso)
      .sort(byWhen);
    const past = appts
      .filter((a) => !LIVE.includes(a.status) || a.appointmentDate < todayIso)
      .sort((a, b) => byWhen(b, a));

    return {
      upcoming,
      past,
      next: upcoming[0],
      completedCount: appts.filter((a) => a.status === "COMPLETED").length,
      unpaidCount: appts.filter(
        (a) => a.paymentStatus !== "PAID" && a.paymentStatus !== "REFUNDED" && LIVE.includes(a.status)
      ).length,
      spent: appts
        .filter((a) => a.paymentStatus === "PAID")
        .reduce((sum, a) => sum + (a.paymentAmount || 0), 0),
    };
  }, [appts]);

  return (
    <div>
      <header className="dash-top">
        <span className="dash-avatar">{initials(auth.user.name)}</span>
        <div className="dash-top-main">
          <p className="eyebrow">Patient</p>
          <h1>Hi, {auth.user.name.split(" ")[0]}</h1>
          <p className="sub">
            {loaded && upcoming.length > 0
              ? `You have ${upcoming.length} upcoming appointment${upcoming.length === 1 ? "" : "s"}.`
              : "Your care, all in one place."}
          </p>
        </div>
        <div className="dash-top-side">
          <div className="dash-pill"><b>{loaded ? upcoming.length : "—"}</b><span>upcoming</span></div>
          <div className="dash-pill"><b>{loaded ? completedCount : "—"}</b><span>visits done</span></div>
        </div>
      </header>

      {next ? (
        <div className="next-card">
          <div className="next-when">
            <b>{friendlyDate(next.appointmentDate)}</b>
            <span>{next.appointmentTime}</span>
          </div>
          <div className="next-main">
            <p className="eyebrow">Next appointment</p>
            <h3>{next.doctorName}</h3>
            <p>{next.doctorSpecialization ? `${next.doctorSpecialization} · ` : ""}{next.hospitalName}</p>
          </div>
          <div className="next-side">
            <StatusBadge status={next.status} />
            <PaymentBadge status={next.paymentStatus} method={next.paymentMethod} />
            <Link to="/patient/appointments" className="btn btn-outline btn-sm">Manage</Link>
          </div>
        </div>
      ) : (
        loaded && (
          <div className="card panel-empty">
            <span className="panel-empty-icon"><Icon name="calendar" size={22} /></span>
            <p>No upcoming appointments yet.</p>
            <Link to="/patient/hospitals" className="btn btn-primary btn-sm">Find a hospital</Link>
          </div>
        )
      )}

      <div className="kpi-grid mt-3">
        <Kpi icon="calendar" value={upcoming.length} label="Upcoming" tone="primary" />
        <Kpi icon="clipboard" value={completedCount} label="Completed visits" tone="blue" />
        <Kpi icon="clock" value={unpaidCount} label="Payment pending" tone="amber"
             sub={unpaidCount > 0 ? "Settle online or at the clinic" : "All settled"} />
        <Kpi icon="care" value={money(spent)} label="Total paid" tone="teal" />
      </div>

      <div className="dash-split mt-3">
        <section className="panel">
          <div className="panel-head">
            <h3>Upcoming</h3>
            <Link to="/patient/appointments" className="btn btn-outline btn-sm">View all</Link>
          </div>
          <div className="panel-body">
            {upcoming.length === 0 ? (
              <div className="panel-empty">
                <p>Nothing booked. Browse hospitals to find a doctor.</p>
                <Link to="/patient/hospitals" className="btn btn-primary btn-sm">Find hospitals</Link>
              </div>
            ) : (
              <div className="mini-list">
                {upcoming.slice(0, 5).map((a) => (
                  <div className="mini-row" key={a.appointmentId}>
                    <div className="mini-when">
                      <b>{friendlyDate(a.appointmentDate)}</b>
                      <span>{a.appointmentTime}</span>
                    </div>
                    <div className="mini-main">
                      <strong>{a.doctorName}</strong>
                      <span>{a.hospitalName}</span>
                    </div>
                    <div className="mini-side"><StatusBadge status={a.status} /></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <h3>Recent history</h3>
            <span className="muted">{past.length} record{past.length === 1 ? "" : "s"}</span>
          </div>
          <div className="panel-body">
            {past.length === 0 ? (
              <div className="panel-empty"><p>Your past visits will appear here.</p></div>
            ) : (
              <div className="mini-list">
                {past.slice(0, 5).map((a) => (
                  <div className="mini-row" key={a.appointmentId}>
                    <div className="mini-when">
                      <b>{formatDate(a.appointmentDate)}</b>
                      <span>{a.appointmentTime}</span>
                    </div>
                    <div className="mini-main">
                      <strong>{a.doctorName}</strong>
                      <span>{a.hospitalName}</span>
                    </div>
                    <div className="mini-side"><StatusBadge status={a.status} /></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
