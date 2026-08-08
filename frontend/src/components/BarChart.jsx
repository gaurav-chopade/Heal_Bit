// Dependency-free horizontal bars. rows: [{ label, value, color }]
export default function BarChart({ rows }) {
  const max = Math.max(1, ...rows.map((r) => r.value || 0));
  return (
    <div className="bars">
      {rows.map((r, i) => (
        <div className="bar-row" key={i}>
          <div className="bar-head">
            <span>{r.label}</span>
            <span className="bar-value">{r.value || 0}</span>
          </div>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${((r.value || 0) / max) * 100}%`, background: r.color }} />
          </div>
        </div>
      ))}
    </div>
  );
}
