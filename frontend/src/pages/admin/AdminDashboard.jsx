import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboard } from "../../api/adminApi";
import { getErrorMessage } from "../../utils/error";
import Icon from "../../components/icons";
import Kpi from "../../components/Kpi";
import { DualLine, CategoryBar, StatusDonut } from "../../components/Charts";
import { CHART, STATUS_COLORS } from "../../constants";

/** Ranked list with a proportional bar — easier to scan than a plain table. */
function Leaderboard({ rows, metric, unit }) {
  const data = (rows || []).filter((r) => r[metric] > 0);
  if (data.length === 0) {
    return (
      <div className="panel-empty">
        <span className="panel-empty-icon"><Icon name="chart" size={22} /></span>
        <p>No data yet.</p>
      </div>
    );
  }
  const max = Math.max(...data.map((r) => r[metric]));
  return (
    <div className="rank-list">
      {data.map((r, i) => (
        <div className="rank-row" key={r.hospitalId}>
          <span className="rank-no">{i + 1}</span>
          <div className="rank-main">
            <strong>{r.hospitalName}</strong>
            <div className="rank-bar">
              <div className="rank-bar-fill" style={{ width: `${(r[metric] / max) * 100}%` }} />
            </div>
            <span className="rank-sub">{r.city || "—"} · {r.doctorCount} doctor{r.doctorCount === 1 ? "" : "s"}</span>
          </div>
          <span className="rank-val">{r[metric]}<span className="rank-sub"> {unit}</span></span>
        </div>
      ))}
    </div>
  );
}

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
    { name: "Expired", value: s.expiredAppointments, color: STATUS_COLORS.EXPIRED },
  ];

  const hospitalStatus = [
    { name: "Active", value: s.activeHospitals, color: CHART.green },
    { name: "Pending", value: s.pendingHospitals, color: CHART.amber },
    { name: "Rejected", value: s.rejectedHospitals, color: CHART.red },
  ];

  const topAppts = (s.topHospitalsByAppointments || [])
    .filter((h) => h.totalAppointments > 0)
    .map((h) => ({ name: h.hospitalName, value: h.totalAppointments }));

  const closed = s.completedAppointments + s.rejectedAppointments + s.cancelledAppointments + s.expiredAppointments;
  const completionRate = closed > 0 ? Math.round((s.completedAppointments / closed) * 100) : 0;

  return (
    <div>
      <header className="dash-top">
        <span className="dash-avatar"><Icon name="chart" size={26} /></span>
        <div className="dash-top-main">
          <p className="eyebrow">Administrator</p>
          <h1>Platform overview</h1>
          <p className="sub">Live activity across hospitals, doctors and appointments.</p>
        </div>
        <div className="dash-top-side">
          <div className="dash-pill"><b>{s.activeHospitals}</b><span>active hospitals</span></div>
          <div className="dash-pill"><b>{completionRate}%</b><span>completion rate</span></div>
        </div>
      </header>

      {s.pendingHospitals > 0 && (
        <div className="next-card" style={{ borderLeftColor: "var(--amber)" }}>
          <div className="next-when">
            <b>{s.pendingHospitals}</b>
            <span>waiting</span>
          </div>
          <div className="next-main">
            <p className="eyebrow">Needs your attention</p>
            <h3>Hospital{s.pendingHospitals === 1 ? "" : "s"} awaiting approval</h3>
            <p>They stay invisible to patients until you review them.</p>
          </div>
          <div className="next-side">
            <Link to="/admin/hospitals" className="btn btn-primary btn-sm">Review now</Link>
          </div>
        </div>
      )}

      <div className="kpi-grid mt-3">
        <Kpi icon="users" value={s.totalPatients} label="Patients" tone="teal" />
        <Kpi icon="hospital" value={s.totalHospitals} label="Hospitals" tone="primary"
             sub={`${s.activeHospitals} active · ${s.pendingHospitals} pending`} />
        <Kpi icon="stethoscope" value={s.totalDoctors} label="Doctors" tone="blue" />
        <Kpi icon="calendar" value={s.totalAppointments} label="Appointments" tone="accent"
             sub={`${s.completedAppointments} completed`} />
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
            <div className="panel-empty">
              <span className="panel-empty-icon"><Icon name="hospital" size={22} /></span>
              <p>No appointments booked yet.</p>
            </div>
          ) : (
            <CategoryBar data={topAppts} xKey="name" yKey="value" color={CHART.primary} />
          )}
        </div>
      </div>

      <div className="dash-split mt-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <section className="panel">
          <div className="panel-head">
            <h3>Highest volume</h3>
            <span className="muted">by appointments booked</span>
          </div>
          <div className="panel-body">
            <Leaderboard rows={s.topHospitalsByAppointments} metric="totalAppointments" unit="booked" />
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <h3>Best performing</h3>
            <span className="muted">by visits completed</span>
          </div>
          <div className="panel-body">
            <Leaderboard rows={s.topHospitalsByCompleted} metric="completedAppointments" unit="done" />
          </div>
        </section>
      </div>
    </div>
  );
}
