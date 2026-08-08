const LABELS = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
  EXPIRED: "Expired",
};

export default function StatusBadge({ status }) {
  if (!status) return null;
  const key = String(status).toUpperCase();
  return <span className={`badge badge-${key.toLowerCase()}`}>{LABELS[key] || status}</span>;
}
