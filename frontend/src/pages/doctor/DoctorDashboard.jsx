import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDoctorDashboard, getMyDoctorProfile } from "../../api/doctorApi";
import { getErrorMessage } from "../../utils/error";
import Icon from "../../components/icons";
import Kpi from "../../components/Kpi";
import StatusBadge from "../../components/StatusBadge";
import PaymentBadge from "../../components/PaymentBadge";
import StarRating from "../../components/StarRating";
import { TrendArea, StatusDonut } from "../../components/Charts";
import { STATUS_COLORS, CHART, WEEK_DAYS } from "../../constants";
import { friendlyDate, money, initials } from "../../utils/format";

const todayIso = new Date().toISOString().split("T")[0];

export default function DoctorDashboard() {
  const [d, setD] = useState(null);
  const [me, setMe] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getDoctorDashboard(), getMyDoctorProfile()])
      .then(([dash, prof]) => { setD(dash.data); setMe(prof.data); })
      .catch((e) => setError(getErrorMessage(e)));
  }, []);

  if (error) return <div className="alert alert-error">{error}</div>;
  if (!d) return <p className="muted">Loading…</p>;

  const statusData = [
    { name: "Pending", value: d.pendingAppointments, color: STATUS_COLORS.PENDING },
    { name: "Confirmed", value: d.confirmedAppointments, color: STATUS_COLORS.CONFIRMED },
    { name: "Completed", value: d.completedAppointments, color: STATUS_COLORS.COMPLETED },
    { name: "Rejected", value: d.rejectedAppointments, color: STATUS_COLORS.REJECTED },
    { name: "Cancelled", value: d.cancelledAppointments, color: STATUS_COLORS.CANCELLED },
    { name: "Expired", value: d.expiredAppointments, color: STATUS_COLORS.EXPIRED },
  ];

  const upcoming = d.upcoming || [];
  const todayList = upcoming.filter((a) => a.appointmentDate === todayIso);
  const workingDays = me?.workingDays || [];

  return (
    <div>
      <header className="dash-top">
        <span className="dash-avatar">{initials(d.doctorName)}</span>
        <div className="dash-top-main">
          <p className="eyebrow">Doctor</p>
          <h1>Dr. {d.doctorName}</h1>
          <p className="sub">{d.specialization} · {d.hospitalName}</p>
        </div>
        <div className="dash-top-side">
          <div className="dash-pill"><b>{d.todayAppointments}</b><span>today</span></div>
          <div className="dash-pill"><b>{d.pendingAppointments}</b><span>to review</span></div>
        </div>
      </header>

      {!d.scheduleConfigured && (
        <div className="alert alert-error">
          You haven’t published a schedule yet, so patients can’t book you.{" "}
          <Link to="/doctor/schedule">Set your working days &amp; hours →</Link>
        </div>
      )}

      <div className="kpi-grid">
        <Kpi icon="calendar" value={d.todayAppointments} label="Today" tone="primary"
             sub={todayList.length > 0 ? `Next at ${todayList[0].appointmentTime}` : "Nothing scheduled"} />
        <Kpi icon="clock" value={d.pendingAppointments} label="Awaiting your decision" tone="amber" />
        <Kpi icon="care" value={d.confirmedAppointments} label="Confirmed" tone="teal" />
        <Kpi icon="clipboard" value={d.completedAppointments} label="Completed" tone="blue"
             sub={`${d.totalAppointments} all time`} />
      </div>

      <div className="dash-split mt-3">
        <section className="panel">
          <div className="panel-head">
            <h3>Upcoming appointments</h3>
            <Link to="/doctor/appointments" className="btn btn-outline btn-sm">View all</Link>
          </div>
          <div className="panel-body">
            {upcoming.length === 0 ? (
              <div className="panel-empty">
                <span className="panel-empty-icon"><Icon name="calendar" size={22} /></span>
                <p>No upcoming appointments.</p>
              </div>
            ) : (
              <div className="mini-list">
                {upcoming.map((a) => (
                  <div className="mini-row" key={a.appointmentId}>
                    <div className="mini-when">
                      <b>{friendlyDate(a.appointmentDate)}</b>
                      <span>{a.appointmentTime}</span>
                    </div>
                    <div className="mini-main">
                      <strong>{a.patientName}</strong>
                      <span>{a.reason}</span>
                    </div>
                    <div className="mini-side">
                      <PaymentBadge status={a.paymentStatus} method={a.paymentMethod} />
                      <StatusBadge status={a.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <h3>Your practice</h3>
            <Link to="/doctor/schedule" className="btn btn-outline btn-sm">Edit</Link>
          </div>
          <div className="panel-body">
            <div className="mini-row" style={{ borderBottom: "1px solid var(--border-soft)" }}>
              <div className="mini-main">
                <strong>Rating</strong>
                <span>{me?.ratingCount ? `${me.ratingCount} patient review${me.ratingCount === 1 ? "" : "s"}` : "No reviews yet"}</span>
              </div>
              <div className="mini-side"><StarRating value={me?.averageRating || 0} size={15} /></div>
            </div>

            <div className="mini-row" style={{ borderBottom: "1px solid var(--border-soft)" }}>
              <div className="mini-main">
                <strong>Consultation fee</strong>
                <span>Charged per 30-minute slot</span>
              </div>
              <div className="mini-side">
                <span className="rank-val">{money(me?.consultationFee)}</span>
              </div>
            </div>

            <div style={{ paddingTop: 14 }}>
              <p className="muted" style={{ margin: "0 0 8px", fontSize: "0.82rem" }}>Working days</p>
              <div className="day-pills">
                {WEEK_DAYS.map((day) => (
                  <span key={day.value} className={`day-pill${workingDays.includes(day.value) ? " on" : ""}`}>
                    {day.label}
                  </span>
                ))}
              </div>
              <p className="muted mt-2" style={{ fontSize: "0.85rem" }}>
                <Icon name="clock" size={14} />{" "}
                {me?.startTime && me?.endTime ? `${me.startTime} – ${me.endTime}` : "Hours not set"}
                {me?.breaks?.length > 0 && (
                  <> · Break {me.breaks.map((b) => `${b.startTime}–${b.endTime}`).join(", ")}</>
                )}
              </p>
            </div>
          </div>
        </section>
      </div>

      <div className="chart-grid mt-3">
        <div className="card chart-card span-2">
          <h3>Appointments over time</h3>
          <TrendArea data={d.appointmentsTrend} color={CHART.primary} />
        </div>
        <div className="card chart-card">
          <h3>By status</h3>
          <StatusDonut data={statusData} />
        </div>
      </div>
    </div>
  );
}
