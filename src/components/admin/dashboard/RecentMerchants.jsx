import { Link } from "react-router";

export default function RecentMerchants({ merchants = [] }) {
  const rows = merchants.slice(0, 5).map((m, idx) => ({
    id: m.id || idx + 1,
    merchant_code: m.merchantCode || `BQR-M-${String(m.id || 100).padStart(6, "0")}`,
    company_name: m.businessName || m.companyName || "Merchant Company",
    created_at: m.createdAt
      ? new Date(m.createdAt).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—",
    status: m.accountStatus ? m.accountStatus.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) : "Draft",
  }));

  return (
    <div className="h-[250px] rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 leading-tight">Recent Merchant Registrations</h3>
        </div>
        <Link
          to="/admin/merchants"
          className="text-xs font-semibold text-[#00875a] hover:underline"
        >
          View All &gt;
        </Link>
      </div>

      {/* Table / Empty State */}
      <div className="overflow-x-auto mt-1 flex-1 flex flex-col justify-center">
        {rows.length === 0 ? (
          <div className="flex h-full items-center justify-center text-xs text-slate-400 font-medium">
            No recent merchant registrations
          </div>
        ) : (
          <table className="w-full text-left text-[11px]">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="pb-1.5 font-semibold">Merchant Code</th>
                <th className="pb-1.5 font-semibold">Company Name</th>
                <th className="pb-1.5 font-semibold">Created At</th>
                <th className="pb-1.5 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-2 font-mono text-[11px] font-semibold text-slate-600">
                    {row.merchant_code}
                  </td>
                  <td className="py-2 font-bold text-slate-800 truncate max-w-[150px]">
                    {row.company_name}
                  </td>
                  <td className="py-2 text-slate-500 font-normal whitespace-nowrap">
                    {row.created_at}
                  </td>
                  <td className="py-2 text-right">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        row.status.toLowerCase().includes("under")
                          ? "bg-amber-50 text-amber-600"
                          : row.status.toLowerCase() === "submitted"
                          ? "bg-blue-50 text-blue-600"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
