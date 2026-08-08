import { useId } from "react";

/**
 * Heal-Bit brand mark: a teal app tile carrying a heartbeat pulse that ends in a
 * coral dot — the "bit". Pass `wordmark={false}` for the mark on its own.
 */
export default function Logo({ size = 30, wordmark = true, className = "" }) {
  // Unique gradient ids so multiple logos on one page don't collide.
  const id = useId().replace(/:/g, "");

  return (
    <span className={`brand-logo ${className}`.trim()}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        role="img"
        aria-label="Heal-Bit"
        className="brand-mark"
      >
        <defs>
          <linearGradient id={`tile-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#14a094" />
            <stop offset="55%" stopColor="#0f766e" />
            <stop offset="100%" stopColor="#0a4f49" />
          </linearGradient>
          <radialGradient id={`gloss-${id}`} cx="0.78" cy="0.06" r="0.85">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.30" />
            <stop offset="60%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="64" height="64" rx="16" fill={`url(#tile-${id})`} />
        <rect width="64" height="64" rx="16" fill={`url(#gloss-${id})`} />

        <path
          d="M11 34 H20 L24.5 22.5 L31.5 45 L36 34 H43"
          fill="none"
          stroke="#ffffff"
          strokeWidth="4.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="50.5" cy="34" r="3.6" fill="#f8b09a" />
      </svg>

      {wordmark && (
        <span className="brand-word">
          Heal<span className="dot">·</span>Bit
        </span>
      )}
    </span>
  );
}
