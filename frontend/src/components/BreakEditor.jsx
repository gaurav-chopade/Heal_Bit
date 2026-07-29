// Lets a doctor/hospital add, edit, and remove multiple daily break windows
// (lunch break, recess, etc.). Each break is { label, startTime, endTime }.
export default function BreakEditor({ breaks, onChange }) {
  const list = breaks || [];

  const update = (i, patch) => {
    const next = list.map((b, idx) => (idx === i ? { ...b, ...patch } : b));
    onChange(next);
  };

  const addBreak = () => {
    onChange([...list, { label: "Lunch break", startTime: "", endTime: "" }]);
  };

  const removeBreak = (i) => {
    onChange(list.filter((_, idx) => idx !== i));
  };

  return (
    <div className="field">
      <label>Break times (lunch, recess, etc.)</label>
      {list.length === 0 && (
        <p className="break-empty">No breaks added. Patients can book any slot in your working hours.</p>
      )}
      {list.map((b, i) => (
        <div className="break-row" key={i}>
          <div className="field">
            <label>Label</label>
            <input
              className="input"
              value={b.label}
              placeholder="e.g. Lunch break"
              onChange={(e) => update(i, { label: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Start</label>
            <input
              className="input"
              type="time"
              step="1800"
              value={b.startTime}
              onChange={(e) => update(i, { startTime: e.target.value })}
            />
          </div>
          <div className="field">
            <label>End</label>
            <input
              className="input"
              type="time"
              step="1800"
              value={b.endTime}
              onChange={(e) => update(i, { endTime: e.target.value })}
            />
          </div>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => removeBreak(i)}>
            Remove
          </button>
        </div>
      ))}
      <button type="button" className="btn btn-outline btn-sm" onClick={addBreak}>
        + Add a break
      </button>
    </div>
  );
}
