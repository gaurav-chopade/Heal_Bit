export default function StatusBadge({ status }) {
  if (!status) return null;
  const cls = `badge badge-${String(status).toLowerCase()}`;
  return <span className={cls}>{status}</span>;
}
