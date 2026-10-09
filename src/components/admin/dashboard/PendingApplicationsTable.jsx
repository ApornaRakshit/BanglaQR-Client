import { Link } from "react-router";

export default function PendingApplicationsTable({ applications = [] }) {
  const rows = applications.slice(0, 5).map((app, idx) => ({
    id: app.id || app.merchantId || idx + 1,
    merchant_code: app.merchantCode || `BQR-M-${String(app.id || 100).padStart(6, "0")}`,
    business_name: app.businessName || app.companyName || "Merchant Business",
    email: app.email || "merchant@banglaqr.com",
    kyc_status: (app.kycStatus || "pending").toLowerCase(),
    account_status: (app.accountStatus || "submitted").toLowerCase(),
    submitted_at: app.submittedAt
      ? new Date(app.submittedAt).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—",
  }));

  return (
    <div className="h-[250px] rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 leading-tight">Pending Merchant Applications</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Latest applications waiting for review</p>
        </div>
        <Link
          to="/admin/merchants/pending"
          className="text-xs font-semibold text-[#00875a] hover:underline"
        >
          View All &gt;
        </Link>
      </div>

      {/* Table / Empty State */}
      <div className="overflow-x-auto mt-1 flex-1 flex flex-col justify-center">
        {rows.length === 0 ? (
          <div className="flex h-full items-center justify-center text-xs text-slate-400 font-medium">
            No pending applications waiting for review
          </div>
        ) : (
          <table className="w-full text-left text-[11px]">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="pb-1.5 font-semibold">Merchant Code</th>
                <th className="pb-1.5 font-semibold">Business Name</th>
                <th className="pb-1.5 font-semibold">Email</th>
                <th className="pb-1.5 font-semibold">KYC Status</th>
                <th className="pb-1.5 font-semibold">Account Status</th>
                <th className="pb-1.5 font-semibold">Submitted At</th>
                <th className="pb-1.5 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-2 font-mono text-[11px] font-semibold text-slate-600">
                    {row.merchant_code}
                  </td>
                  <td className="py-2 font-bold text-slate-800 truncate max-w-[130px]">
                    {row.business_name}
                  </td>
                  <td className="py-2 text-slate-500 font-normal truncate max-w-[140px]">
                    {row.email}
                  </td>
                  <td className="py-2">
                    <span
                      className={`inline-block text-[10px] font-bold ${
                        row.kyc_status === "under_review"
                          ? "text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded"
                          : "text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded"
                      }`}
                    >
                      {row.kyc_status === "under_review" ? "Under Review" : "Pending"}
                    </span>
                  </td>
                  <td className="py-2">
                    <span className="inline-block rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600 capitalize">
                      {row.account_status}
                    </span>
                  </td>
                  <td className="py-2 text-slate-500 font-normal whitespace-nowrap">
                    {row.submitted_at}
                  </td>
                  <td className="py-2 text-right">
                    <Link
                      to={`/admin/merchants/${row.id}`}
                      className="inline-flex items-center justify-center rounded border border-emerald-300 px-2.5 py-0.5 text-[10px] font-bold text-[#00875a] hover:bg-emerald-50 transition"
                    >
                      View
                    </Link>
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
