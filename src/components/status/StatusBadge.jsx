export default function StatusBadge({ status, className = "" }) {
  const normStatus = String(status || "").toLowerCase().replace(/_/g, " ");

  let style = "border-slate-200 bg-slate-50 text-slate-700";

  if (normStatus.includes("active") || normStatus.includes("approved") || normStatus.includes("completed") || normStatus.includes("verified")) {
    style = "border-emerald-200 bg-emerald-50 text-emerald-700";
  } else if (normStatus.includes("review") || normStatus.includes("submitted")) {
    style = "border-blue-200 bg-blue-50 text-blue-700";
  } else if (normStatus.includes("pending") || normStatus.includes("draft") || normStatus.includes("uploaded")) {
    style = "border-amber-200 bg-amber-50 text-amber-700";
  } else if (normStatus.includes("reject") || normStatus.includes("suspend") || normStatus.includes("disabled") || normStatus.includes("unverified")) {
    style = "border-red-200 bg-red-50 text-red-700";
  } else if (normStatus.includes("additional")) {
    style = "border-orange-200 bg-orange-50 text-orange-700";
  }

  // Format label: capitalize words
  const label = String(status || "Unknown")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold ${style} ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-75" />
      {label}
    </span>
  );
}

