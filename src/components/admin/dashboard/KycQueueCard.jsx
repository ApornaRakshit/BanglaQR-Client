import { Link } from "react-router";
import { Clock, Search, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

export default function KycQueueCard({ kycQueue = {} }) {
  const rows = [
    {
      label: "Pending",
      count: kycQueue.pending || 0,
      icon: Clock,
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
    {
      label: "Under Review",
      count: kycQueue.under_review || kycQueue.underReview || 0,
      icon: Search,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      label: "Approved",
      count: kycQueue.approved || 0,
      icon: CheckCircle,
      color: "text-[#00875a]",
      bg: "bg-emerald-50",
    },
    {
      label: "Rejected",
      count: kycQueue.rejected || 0,
      icon: XCircle,
      color: "text-red-500",
      bg: "bg-red-50",
    },
    {
      label: "Additional Information Required",
      count: kycQueue.additional_information_required || kycQueue.additionalInformationRequired || 0,
      icon: AlertTriangle,
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="h-[185px] rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 leading-tight">KYC Review Queue</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Current KYC verification status</p>
        </div>
        <Link to="/admin/kyc" className="text-xs font-semibold text-[#00875a] hover:underline">
          View All &gt;
        </Link>
      </div>

      {/* Queue rows */}
      <div className="space-y-1 mt-1">
        {rows.map((row) => {
          const Icon = row.icon;
          return (
            <div
              key={row.label}
              className="flex items-center justify-between text-[11px] py-0.5 hover:bg-slate-50/80 rounded px-1 transition"
            >
              <div className="flex items-center gap-2 min-w-0">
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
    </div>
  );
}
