import { Link } from "react-router";

export default function AdminActivity({ activity = [] }) {
  const rows = activity.slice(0, 4).map((act, idx) => ({
    id: act.id || idx + 1,
    admin_name: act.adminName || act.user_email?.split("@")[0] || "Admin Staff",
    action: act.action ? act.action.replace(/_/g, " ").toLowerCase() : "Updated record",
    merchant_code: act.merchantCode || "Platform",
    date_time: act.createdAt
      ? new Date(act.createdAt).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—",
    avatar_initial: (act.adminName || act.user_email || "A").charAt(0).toUpperCase(),
    avatar_bg: idx % 2 === 0 ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700",
  }));

  return (
    <div className="h-[185px] rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 leading-tight">Recent Admin Activity</h3>
        </div>
        <Link to="/admin/audit" className="text-xs font-semibold text-[#00875a] hover:underline">
          View All &gt;
        </Link>
      </div>

      {/* Table / Empty State */}
      <div className="overflow-x-auto mt-1 flex-1 flex flex-col justify-center">
        {rows.length === 0 ? (
          <div className="flex h-full items-center justify-center text-xs text-slate-400 font-medium">
            No recent admin activity
          </div>
        ) : (
          <table className="w-full text-left text-[11px]">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="pb-1 font-semibold">Admin</th>
                <th className="pb-1 font-semibold">Action</th>
                <th className="pb-1 font-semibold">Merchant</th>
                <th className="pb-1 font-semibold text-right">Date / Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-1.5 flex items-center gap-1.5">
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${row.avatar_bg}`}
                    >
                      {row.avatar_initial}
                    </span>
                    <span className="font-bold text-slate-800 truncate max-w-[85px] text-[11px]">
                      {row.admin_name}
                    </span>
                  </td>
                  <td className="py-1.5 text-slate-500 font-normal truncate max-w-[110px] text-[11px]">
                    {row.action}
                  </td>
                  <td className="py-1.5 font-mono text-[10.5px] font-semibold text-slate-600">
                    {row.merchant_code}
                  </td>
                  <td className="py-1.5 text-right text-slate-400 font-normal whitespace-nowrap text-[10px]">
                    {row.date_time}
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
