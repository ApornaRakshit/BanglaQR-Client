import { Link } from "react-router";
import { Clock, Search, CheckCircle, XCircle, FileText } from "lucide-react";

export default function DocumentQueueCard({ documentQueue = {} }) {
  const statusCounts = documentQueue?.status || {};
  const typeCounts = documentQueue?.byType || {};

  const statusRows = [
    {
      label: "Pending",
      count: statusCounts.pending || 0,
      icon: Clock,
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
    {
      label: "Under Review",
      count: statusCounts.under_review || 0,
      icon: Search,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      label: "Approved",
      count: statusCounts.approved || 0,
      icon: CheckCircle,
      color: "text-[#00875a]",
      bg: "bg-emerald-50",
    },
    {
      label: "Rejected",
      count: statusCounts.rejected || 0,
      icon: XCircle,
      color: "text-red-500",
      bg: "bg-red-50",
    },
  ];

  const docTypeRows = [
    { label: "NID Front", count: typeCounts.nid_front || 0, color: "text-blue-500" },
    { label: "NID Back", count: typeCounts.nid_back || 0, color: "text-blue-500" },
    { label: "TIN", count: typeCounts.tin_certificate || 0, color: "text-blue-500" },
    { label: "Cancelled Bank Cheque", count: typeCounts.cancelled_bank_cheque || 0, color: "text-blue-500" },
    { label: "BIN (Optional)", count: typeCounts.bin_certificate || 0, color: "text-purple-500" },
  ];

  return (
    <div className="h-[185px] rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 leading-tight">Document Review</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Document verification summary</p>
        </div>
        <Link to="/admin/documents" className="text-xs font-semibold text-[#00875a] hover:underline">
          View All &gt;
        </Link>
      </div>

      {/* 2-column layout */}
      <div className="grid grid-cols-2 gap-3 mt-1 text-[11px]">
        {/* Left: Status Summary */}
        <div className="space-y-1 pr-1 border-r border-slate-100">
          {statusRows.map((row) => {
            const Icon = row.icon;
            return (
              <div key={row.label} className="flex items-center justify-between py-0.5 px-0.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${row.bg} ${row.color}`}>
                    <Icon size={11} strokeWidth={2.5} />
                  </span>
                  <span className="truncate font-medium text-slate-600 text-[11px]">{row.label}</span>
                </div>
                <span className="font-bold text-slate-900 text-[11px]">
                  {typeof row.count === "number" ? row.count.toLocaleString() : row.count}
                </span>
              </div>
            );
          })}
        </div>

        {/* Right: Required Document Queue */}
        <div className="space-y-0.5 pl-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-1">
            Required Document Queue
          </p>
          {docTypeRows.map((doc) => (
            <div key={doc.label} className="flex items-center justify-between py-0.5 leading-none">
              <div className="flex items-center gap-1.5 min-w-0">
                <FileText size={11} className={`${doc.color} shrink-0`} />
                <span className="truncate text-slate-600 text-[10.5px] font-medium">{doc.label}</span>
              </div>
              <span className="font-bold text-slate-900 text-[11px] shrink-0">{doc.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
