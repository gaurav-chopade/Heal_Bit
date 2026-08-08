// 0-based pagination control. Props: page, totalPages, onChange(nextPage).
export default function Pagination({ page, totalPages, onChange }) {
  if (!totalPages || totalPages <= 1) return null;

  // Windowed page numbers around the current page.
  const window = 2;
  const start = Math.max(0, page - window);
  const end = Math.min(totalPages - 1, page + window);
  const nums = [];
  for (let i = start; i <= end; i++) nums.push(i);

  return (
    <nav className="pagination" aria-label="Pagination">
      <button className="page-btn" disabled={page === 0} onClick={() => onChange(page - 1)}>‹ Prev</button>

      {start > 0 && (
        <>
          <button className="page-btn" onClick={() => onChange(0)}>1</button>
          {start > 1 && <span className="page-gap">…</span>}
        </>
      )}

      {nums.map((n) => (
        <button key={n} className={`page-btn${n === page ? " active" : ""}`} onClick={() => onChange(n)}>
          {n + 1}
        </button>
      ))}

      {end < totalPages - 1 && (
        <>
          {end < totalPages - 2 && <span className="page-gap">…</span>}
          <button className="page-btn" onClick={() => onChange(totalPages - 1)}>{totalPages}</button>
        </>
      )}

      <button className="page-btn" disabled={page === totalPages - 1} onClick={() => onChange(page + 1)}>Next ›</button>
    </nav>
  );
}
