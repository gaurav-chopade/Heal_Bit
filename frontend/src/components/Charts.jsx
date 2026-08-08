import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { CHART } from "../constants";

const axisProps = { stroke: CHART.axis, fontSize: 12, tickLine: false };
const tooltipStyle = {
  contentStyle: { borderRadius: 12, border: "1px solid #e6ede9", boxShadow: "0 8px 24px -12px rgba(16,40,34,.3)", fontSize: 13 },
};

// Monthly trend as a smooth area.
export function TrendArea({ data, xKey = "month", yKey = "count", color = CHART.primary, height = 240 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id={`grad-${yKey}-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
        <XAxis dataKey={xKey} {...axisProps} />
        <YAxis allowDecimals={false} {...axisProps} />
        <Tooltip {...tooltipStyle} />
        <Area type="monotone" dataKey={yKey} stroke={color} strokeWidth={2.5} fill={`url(#grad-${yKey}-${color})`} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// Two-series monthly line (e.g. appointments vs registrations).
export function DualLine({ data, xKey = "month", series, height = 240 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
        <XAxis dataKey={xKey} {...axisProps} />
        <YAxis allowDecimals={false} {...axisProps} />
        <Tooltip {...tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {series.map((s) => (
          <Line key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color} strokeWidth={2.5} dot={false} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

// Vertical category bars. data rows keyed by xKey/yKey.
export function CategoryBar({ data, xKey, yKey = "value", color = CHART.primary, height = 260 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
        <XAxis dataKey={xKey} {...axisProps} interval={0} angle={0} />
        <YAxis allowDecimals={false} {...axisProps} />
        <Tooltip {...tooltipStyle} cursor={{ fill: "rgba(15,118,110,0.06)" }} />
        <Bar dataKey={yKey} radius={[6, 6, 0, 0]} fill={color} maxBarSize={46} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Donut for status/category splits. data = [{ name, value, color }]
export function StatusDonut({ data, height = 240 }) {
  const total = data.reduce((s, d) => s + (d.value || 0), 0);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="82%" paddingAngle={2} stroke="none">
          {data.map((d, i) => <Cell key={i} fill={d.color} />)}
        </Pie>
        <Tooltip {...tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <text x="50%" y="44%" textAnchor="middle" dominantBaseline="middle" style={{ fontFamily: "Fraunces, serif", fontSize: 26, fill: "#14302b" }}>{total}</text>
      </PieChart>
    </ResponsiveContainer>
  );
}
