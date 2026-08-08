// Dependency-free SVG donut. segments: [{ label, value, color }]
export default function DonutChart({ segments, size = 172, thickness = 22 }) {
  const total = segments.reduce((sum, s) => sum + (s.value || 0), 0);
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="donut-wrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="donut">
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={thickness} />
          {total > 0 &&
            segments.map((seg, i) => {
              const len = ((seg.value || 0) / total) * c;
              const el = (
                <circle
                  key={i}
                  cx={size / 2}
                  cy={size / 2}
                  r={r}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={thickness}
                  strokeDasharray={`${len} ${c - len}`}
                  strokeDashoffset={-offset}
                />
              );
              offset += len;
              return el;
            })}
        </g>
        <text x="50%" y="49%" textAnchor="middle" dominantBaseline="middle" className="donut-total">{total}</text>
        <text x="50%" y="63%" textAnchor="middle" className="donut-caption">total</text>
      </svg>

      <ul className="legend">
        {segments.map((s, i) => (
          <li key={i} className="legend-item">
            <span className="legend-dot" style={{ background: s.color }} />
            <span>{s.label}</span>
            <span className="legend-val">{s.value || 0}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
