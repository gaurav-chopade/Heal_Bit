import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDoctorDashboard } from "../../api/doctorApi";
import { getErrorMessage } from "../../utils/error";
import Icon from "../../components/icons";
import StatusBadge from "../../components/StatusBadge";
import { TrendArea, StatusDonut } from "../../components/Charts";
import { STATUS_COLORS, CHART } from "../../constants";

const Kpi = ({ icon, value, label, tone }) => (
  <div className={`kpi${tone ? " kpi-" + tone : ""}`}>
    <span className="kpi-icon"><Icon name={icon} size={20} /></span>
    <div>
      <div className="kpi-value">{value ?? 0}</div>
      <div className="kpi-label">{label}</div>
    </div>
  </div>
);

export default function DoctorDashboard() {
  const [d, setD] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getDoctorDashboard().then(({ data }) => setD(data)).catch((e) => setError(getErrorMessage(e)));
  }, []);

  if (error) return <div className="alert alert-error">{error}</div>;
  if (!d) return <p className="muted">Loading…</p>;

  const statusData = [
    { name: "Pending", value: d.pendingAppointments, color: STATUS_COLORS.PENDING },
    { name: "Confirmed", value: d.confirmedAppointments, color: STATUS_COLORS.CONFIRMED },
    { name: "Completed", value: d.completedAppointments, color: STATUS_COLORS.COMPLETED },
    { name: "Rejected", value: d.rejectedAppointments, color: STATUS_COLORS.REJECTED },
    { name: "Cancelled", value: d.cancelledAppointments, color: STATUS_COLORS.CANCELLED },
  ];

  return (
    <div>
      <div className="dash-hero">
        <div>
          <p className="eyebrow">Doctor</p>
          <h1>Dr. {d.doctorName}</h1>
          <p className="sub">{d.specialization} · {d.hospitalName}</p>
        </div>
        <div className="chips">
          <div className="chip">
            <span className="chip-icon"><Icon name="calendar" /></span>
            <span className="chip-meta"><b>{d.todayAppointments}</b><span>today</span></span>
          </div>
          <div className="chip">
            <span className="chip-icon"><Icon name="clock" /></span>
            <span className="chip-meta"><b>{d.pendingAppointments}</b><span>to review</span></span>
          </div>
        </div>
      </div>

      {!d.scheduleConfigured && (
        <div className="alert alert-error">
          You haven’t published a schedule yet, so patients can’t book you.{" "}
          <Link to="/doctor/schedule">Set your working days &amp; hours →</Link>
        </div>
      )}

      <div className="kpi-grid">
        <Kpi icon="calendar" value={d.totalAppointments} label="Total" tone="primary" />
        <Kpi icon="clock" value={d.pendingAppointments} label="Pending" tone="amber" />
        <Kpi icon="care" value={d.confirmedAppointments} label="Confirmed" tone="teal" />
        <Kpi icon="clipboard" value={d.completedAppointments} label="Completed" tone="blue" />
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

      <div className="card mt-3">
        <div className="flex-between">
          <h3>Upcoming appointments</h3>
          <Link to="/doctor/appointments" className="btn btn-outline btn-sm">View all</Link>
        </div>
        {(!d.upcoming || d.upcoming.length === 0) ? (
          <p className="muted mt-2">No upcoming appointments.</p>
        ) : (
          <div className="table-wrap mt-2" style={{ border: "none", boxShadow: "none" }}>
            <table>
              <thead><tr><th>Patient</th><th>Date</th><th>Time</th><th>Reason</th><th>Status</th></tr></thead>
              <tbody>
                {d.upcoming.map((a) => (
                  <tr key={a.appointmentId}>
                    <td>{a.patientName}</td>
                    <td>{a.appointmentDate}</td>
                    <td>{a.appointmentTime}</td>
                    <td>{a.reason}</td>
                    <td><StatusBadge status={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
