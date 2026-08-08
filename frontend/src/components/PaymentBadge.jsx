// Badge for an appointment's payment state, aware of the method (online / cash).
export default function PaymentBadge({ status, method }) {
  if (status === "REFUNDED") return <span className="badge badge-cancelled">Refunded</span>;
  if (status === "PAID") {
    const via = method === "ONLINE" ? "Online" : "Cash";
    return <span className="badge badge-active">Paid via {via}</span>;
  }
  return <span className="badge badge-pending">Payment pending</span>;
}
