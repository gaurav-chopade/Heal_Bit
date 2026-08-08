import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getHospitalDashboard } from "../../api/hospitalApi";
import { listDoctors } from "../../api/doctorApi";
import { getErrorMessage } from "../../utils/error";
import Icon from "../../components/icons";
import Kpi from "../../components/Kpi";
import { TrendArea, CategoryBar, StatusDonut } from "../../components/Charts";
import { STATUS_COLORS, CHART } from "../../constants";
import { doctorStatusTag } from "../../utils/doctorStatus";
import { money, initials } from "../../utils/format";

export default function HospitalDashboard() {
  const [d, setD] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getHospitalDashboard(), listDoctors({ mine: true })])
      .then(([dash, docs]) => { setD(dash.data); setDoctors(docs.data || []); })
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

  const loads = (d.doctorLoads || [])
    .filter((x) => x.total > 0)
    .slice(0, 8)
    .map((x) => ({ name: x.doctorName, value: x.total }));

  // Completion rate is the clearest single measure of how the hospital is running.
  const closed = d.completedAppointments + d.rejectedAppointments + d.cancelledAppointments + d.expiredAppointments;
  const completionRate = closed > 0 ? Math.round((d.completedAppointments / closed) * 100) : 0;

  return (
    <div>
      <header className="dash-top">
        <span className="dash-avatar"><Icon name="hospital" size={26} /></span>
        <div className="dash-top-main">
          <p className="eyebrow">Hospital</p>
          <h1>{d.hospitalName}</h1>
          <p className="sub">Reg. No. {d.registrationNumber}</p>
        </div>
        <div className="dash-top-side">
          <div className="dash-pill"><b>{d.totalDoctors}</b><span>doctors</span></div>
          <div className="dash-pill"><b>{d.availableDoctors}</b><span>bookable now</span></div>
        </div>
      </header>

      <div className="kpi-grid">
        <Kpi icon="calendar" value={d.totalAppointments} label="Appointments" tone="primary" sub="All time" />
        <Kpi icon="clock" value={d.pendingAppointments} label="Awaiting doctors" tone="amber"
             sub={d.pendingAppointments > 0 ? "Needs a decision" : "Nothing waiting"} />
        <Kpi icon="care" value={d.confirmedAppointments} label="Confirmed" tone="teal" />
        <Kpi icon="chart" value={`${completionRate}%`} label="Completion rate" tone="blue"
             sub={`${d.completedAppointments} completed`} />
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

      <div className="dash-split mt-3">
        <div className="card chart-card">
          <h3>Appointments per doctor</h3>
          {loads.length === 0 ? (
            <div className="panel-empty">
              <span className="panel-empty-icon"><Icon name="chart" size={22} /></span>
              <p>No appointments booked yet.</p>
            </div>
          ) : (
            <CategoryBar data={loads} xKey="name" yKey="value" color={CHART.teal} />
          )}
        </div>

        <section className="panel">
          <div className="panel-head">
            <h3>Your doctors</h3>
            <Link to="/hospital/doctors" className="btn btn-outline btn-sm">Manage</Link>
          </div>
          <div className="panel-body">
            {doctors.length === 0 ? (
              <div className="panel-empty">
                <span className="panel-empty-icon"><Icon name="stethoscope" size={22} /></span>
                <p>No doctors added yet.</p>
                <Link to="/hospital/doctors" className="btn btn-primary btn-sm">Add a doctor</Link>
              </div>
            ) : (
              <div className="mini-list">
                {doctors.slice(0, 6).map((doc) => {
                  const tag = doctorStatusTag(doc);
                  return (
                    <div className="mini-row" key={doc.doctorId}>
                      <span className="dash-avatar" style={{ width: 36, height: 36, fontSize: "0.8rem", background: "var(--primary-050)", color: "var(--primary-700)", border: "none" }}>
                        {initials(doc.doctorName)}
                      </span>
                      <div className="mini-main">
                        <strong>{doc.doctorName}</strong>
                        <span>{doc.specialization} · {money(doc.consultationFee)}</span>
                      </div>
                      <div className="mini-side">
                        <span className={`avail-tag ${tag.cls}`}><span className="dot-ind" /> {tag.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
