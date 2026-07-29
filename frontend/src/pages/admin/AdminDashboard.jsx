import { useEffect, useState } from "react";
import { getDashboard } from "../../api/adminApi";
import { getErrorMessage } from "../../utils/error";
import Icon from "../../components/icons";
import { TrendArea, DualLine, CategoryBar, StatusDonut } from "../../components/Charts";
import { CHART, STATUS_COLORS } from "../../constants";

const Kpi = ({ icon, value, label, tone }) => (
  <div className={`kpi${tone ? " kpi-" + tone : ""}`}>
    <span className="kpi-icon"><Icon name={icon} size={20} /></span>
    <div>
      <div className="kpi-value">{value ?? 0}</div>
      <div className="kpi-label">{label}</div>
    </div>
  </div>
);

export default function AdminDashboard() {
  const [s, setS] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getDashboard().then(({ data }) => setS(data)).catch((e) => setError(getErrorMessage(e)));
  }, []);

  if (error) return <div className="alert alert-error">{error}</div>;
  if (!s) return <p className="muted">Loading statistics…</p>;

  const trend = (s.appointmentsTrend || []).map((m, i) => ({
    month: m.month,
    appointments: m.count,
    hospitals: s.hospitalTrend?.[i]?.count ?? 0,
  }));

  const statusData = [
    { name: "Pending", value: s.pendingAppointments, color: STATUS_COLORS.PENDING },
    { name: "Confirmed", value: s.confirmedAppointments, color: STATUS_COLORS.CONFIRMED },
    { name: "Completed", value: s.completedAppointments, color: STATUS_COLORS.COMPLETED },
    { name: "Rejected", value: s.rejectedAppointments, color: STATUS_COLORS.REJECTED },
    { name: "Cancelled", value: s.cancelledAppointments, color: STATUS_COLORS.CANCELLED },
  ];

  const hospitalStatus = [
    { name: "Active", value: s.activeHospitals, color: CHART.green },
    { name: "Pending", value: s.pendingHospitals, color: CHART.amber },
    { name: "Rejected", value: s.rejectedHospitals, color: CHART.red },
  ];

  const topAppts = (s.topHospitalsByAppointments || [])
    .filter((h) => h.totalAppointments > 0)
    .map((h) => ({ name: h.hospitalName, value: h.totalAppointments }));

  return (
    <div>
      <div className="page-head">
        <div>
          <p className="eyebrow">Administrator</p>
          <h1>Platform overview</h1>
          <p className="sub">Live activity across hospitals, doctors, and appointments.</p>
        </div>
      </div>

      <div className="kpi-grid">
        <Kpi icon="users" value={s.totalPatients} label="Patients" tone="teal" />
        <Kpi icon="hospital" value={s.totalHospitals} label="Hospitals" tone="primary" />
        <Kpi icon="stethoscope" value={s.totalDoctors} label="Doctors" tone="blue" />
        <Kpi icon="calendar" value={s.totalAppointments} label="Appointments" tone="accent" />
        <Kpi icon="clock" value={s.pendingHospitals} label="Pending approvals" tone="amber" />
      </div>

      <div className="chart-grid mt-3">
        <div className="card chart-card span-2">
          <h3>Activity over the last 6 months</h3>
          <DualLine
            data={trend}
            series={[
              { key: "appointments", name: "Appointments", color: CHART.primary },
              { key: "hospitals", name: "New hospitals", color: CHART.accent },
            ]}
          />
        </div>
        <div className="card chart-card">
          <h3>Hospitals by status</h3>
          <StatusDonut data={hospitalStatus} />
        </div>
      </div>

      <div className="chart-grid mt-3">
        <div className="card chart-card">
          <h3>Appointments by status</h3>
          <StatusDonut data={statusData} />
        </div>
        <div className="card chart-card span-2">
          <h3>Busiest hospitals</h3>
          {topAppts.length === 0 ? (
            <p className="muted">No appointments booked yet.</p>
          ) : (
            <CategoryBar data={topAppts} xKey="name" yKey="value" color={CHART.primary} />
          )}
        </div>
      </div>

      <div className="grid grid-2 mt-3">
        <div className="card">
          <h3>Highest appointment volume</h3>
          <TopTable rows={s.topHospitalsByAppointments} metric="totalAppointments" metricLabel="Appointments" />
        </div>
        <div className="card">
          <h3>Best performing (completed)</h3>
          <TopTable rows={s.topHospitalsByCompleted} metric="completedAppointments" metricLabel="Completed" />
        </div>
      </div>
    </div>
  );
}

function TopTable({ rows, metric, metricLabel }) {
  const data = (rows || []).filter((r) => r[metric] > 0);
  if (data.length === 0) return <p className="muted mt-2">No data yet.</p>;
  return (
    <div className="table-wrap mt-2" style={{ border: "none", boxShadow: "none" }}>
      <table>
        <thead>
          <tr><th>Hospital</th><th>City</th><th>Doctors</th><th>{metricLabel}</th></tr>
        </thead>
        <tbody>
          {data.map((r) => (
            <tr key={r.hospitalId}>
              <td>{r.hospitalName}</td>
              <td>{r.city || "—"}</td>
              <td>{r.doctorCount}</td>
              <td><strong>{r[metric]}</strong></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
