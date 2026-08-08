import { useState } from "react";

/**
 * Star rating widget.
 * - Display mode (default): renders a read-only star row for `value` (supports halves), plus
 *   an optional review count, e.g. "4.5 (12)".
 * - Interactive mode (pass `onChange`): renders 5 clickable stars for submitting a rating.
 */
export default function StarRating({ value = 0, count, onChange, size = 16 }) {
  const [hover, setHover] = useState(0);
  const interactive = typeof onChange === "function";
  const display = interactive ? (hover || value) : value;

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span style={{ display: "inline-flex", gap: 1 }}>
        {[1, 2, 3, 4, 5].map((n) => {
          const filled = display >= n;
          const half = !filled && display >= n - 0.5;
          return (
            <span
              key={n}
              onClick={interactive ? () => onChange(n) : undefined}
              onMouseEnter={interactive ? () => setHover(n) : undefined}
              onMouseLeave={interactive ? () => setHover(0) : undefined}
              style={{
                fontSize: size,
                lineHeight: 1,
                cursor: interactive ? "pointer" : "default",
                color: filled || half ? "var(--amber, #b45309)" : "var(--border, #d8ded9)",
                position: "relative",
              }}
              aria-label={interactive ? `Rate ${n} star${n > 1 ? "s" : ""}` : undefined}
            >
              {half ? "\u2606" : "\u2605"}
            </span>
          );
        })}
      </span>
      {!interactive && (
        <span style={{ fontSize: "0.82rem", color: "var(--muted, #5c6b66)", fontWeight: 600 }}>
          {value > 0 ? value.toFixed(1) : "No ratings"}
          {typeof count === "number" && count > 0 ? ` (${count})` : ""}
        </span>
      )}
    </span>
  );
}
