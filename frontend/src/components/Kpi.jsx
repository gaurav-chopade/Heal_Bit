import Icon from "./icons";

/**
 * Dashboard stat tile. `tone` colours the icon chip; `sub` adds a small caption line.
 */
export default function Kpi({ icon, value, label, sub, tone = "primary" }) {
  return (
    <div className={`kpi kpi-${tone}`}>
      <span className="kpi-icon"><Icon name={icon} size={20} /></span>
      <div className="kpi-body">
        <div className="kpi-value">{value ?? 0}</div>
        <div className="kpi-label">{label}</div>
        {sub && <div className="kpi-sub">{sub}</div>}
      </div>
    </div>
  );
}
