import { passwordStrength } from "../utils/password";

const COLORS = ["#b91c1c", "#b91c1c", "#b45309", "#0891b2", "#15803d"];

// Shows a 4-segment strength bar. Hidden until the user starts typing.
export default function PasswordStrength({ value }) {
  if (!value) return null;
  const { level, label } = passwordStrength(value);
  return (
    <div className="pw-strength">
      <div className="pw-bars">
        {[1, 2, 3, 4].map((i) => (
          <span key={i} className="pw-seg" style={{ background: i <= level ? COLORS[level] : "var(--border)" }} />
        ))}
      </div>
      <span className="pw-label" style={{ color: COLORS[level] }}>{label}</span>
    </div>
  );
}
