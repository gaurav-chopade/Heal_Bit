import { useEffect, useState } from "react";
import { getHospitalDashboard } from "../../api/hospitalApi";
import { getErrorMessage } from "../../utils/error";
import Icon from "../../components/icons";
import { TrendArea, CategoryBar, StatusDonut } from "../../components/Charts";
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

export default function HospitalDashboard() {
  const [d, setD] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getHospitalDashboard().then(({ data }) => setD(data)).catch((e) => setError(getErrorMessage(e)));
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

  const loads = (d.doctorLoads || [])
    .filter((x) => x.total > 0)
    .slice(0, 8)
    .map((x) => ({ name: x.doctorName, value: x.total }));

  return (
    <div>
      <div className="dash-hero">
        <div>
          <p className="eyebrow">Hospital</p>
          <h1>{d.hospitalName}</h1>
          <p className="sub">Reg. No. <strong>{d.registrationNumber}</strong></p>
        </div>
        <div className="chips">
          <div className="chip">
            <span className="chip-icon"><Icon name="stethoscope" /></span>
            <span className="chip-meta"><b>{d.totalDoctors}</b><span>doctors</span></span>
          </div>
          <div className="chip">
            <span className="chip-icon"><Icon name="care" /></span>
            <span className="chip-meta"><b>{d.availableDoctors}</b><span>available now</span></span>
          </div>
        </div>
      </div>

      <div className="kpi-grid">
        <Kpi icon="calendar" value={d.totalAppointments} label="Appointments" tone="primary" />
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

      <div className="card chart-card mt-3">
        <h3>Appointments per doctor</h3>
        {loads.length === 0 ? (
          <p className="muted">No appointments booked yet.</p>
        ) : (
          <CategoryBar data={loads} xKey="name" yKey="value" color={CHART.teal} />
        )}
      </div>
    </div>
  );
}
