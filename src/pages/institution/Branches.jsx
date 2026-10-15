import { useState, useEffect } from "react";
import {
  GitBranch,
  Search,
  Filter,
  RefreshCw,
  Building2,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  AlertCircle,
  FileEdit,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { institutionApi } from "../../services/institutionApi";

export default function InstitutionBranches() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });

  // Change request modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [changeForm, setChangeForm] = useState({
    branchName: "",
    routingNumber: "",
    address: "",
    phone: "",
    email: "",
    sourceUrl: "",
    reason: "",
  });
  const [submittingChange, setSubmittingChange] = useState(false);

  const fetchBranches = async (page = 1) => {
    setLoading(true);
    setError("");
    try {
      const res = await institutionApi.getBranches({
        page,
        limit: pagination.limit,
        search: search.trim() || undefined,
      });

      setBranches(res.branches || []);
      setPagination({
        page: res.page || page,
        limit: res.limit || pagination.limit,
        total: res.total || 0,
        totalPages: res.totalPages || 1,
      });
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load branch registry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches(1);
  }, []);

  const handleOpenCorrection = (branch) => {
    setSelectedBranch(branch);
    setChangeForm({
      branchName: branch.branch_name,
      routingNumber: branch.routing_number || "",
      address: branch.address || "",
      phone: branch.phone || "",
      email: branch.email || "",
      sourceUrl: branch.source_url || "",
      reason: "",
    });
    setIsModalOpen(true);
  };

  const handleSubmitChangeRequest = async (e) => {
    e.preventDefault();
    if (!selectedBranch) return;

    setSubmittingChange(true);
    try {
      await institutionApi.createBranchChangeRequest({
        branchId: selectedBranch.id,
        ...changeForm,
      });

      setSuccessMsg("Branch update request logged. It will be reviewed by platform administrators before publishing.");
      setIsModalOpen(false);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to submit change request.");
    } finally {
      setSubmittingChange(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <GitBranch size={24} />
            </div>
            Institution Branches & Service Outlets
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Official Bangladesh Bank branch registry, routing numbers, and verified geographic locations
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchBranches(pagination.page)}
          className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 transition self-start sm:self-auto"
        >
          <RefreshCw size={15} className={loading ? "animate-spin text-emerald-600" : ""} />
        </button>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center justify-between border border-emerald-200">
          <span>{successMsg}</span>
          <button type="button" onClick={() => setSuccessMsg("")}>
            <X size={14} />
          </button>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
          {error}
        </div>
      )}

      {/* Search Bar */}
      <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchBranches(1);
          }}
          className="relative w-full max-w-md"
        >
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by branch name, code, routing number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </form>

        <span className="text-xs text-slate-400 font-medium hidden sm:inline">
          {pagination.total} total registered branches
        </span>
      </div>

      {/* Branches Table */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Branch Details</th>
                <th className="py-3.5 px-3">Routing #</th>
                <th className="py-3.5 px-3">Location</th>
                <th className="py-3.5 px-3">Unit Type</th>
                <th className="py-3.5 px-3">Contact</th>
                <th className="py-3.5 px-3">Source Verified</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw size={24} className="animate-spin mx-auto text-emerald-600 mb-2" />
                    <span>Loading branches...</span>
                  </td>
                </tr>
              ) : branches.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <GitBranch size={32} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-sm font-semibold text-slate-600">No branches found</p>
                  </td>
                </tr>
              ) : (
                branches.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/75 transition">
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-bold text-slate-900 block">{b.branch_name}</span>
                        <div className="flex items-center gap-1.5 mt-0.5 font-mono text-[10px] text-slate-400">
                          <span>Code: {b.branch_code}</span>
                          {b.parent_branch_name && (
                            <>
                              <span>•</span>
                              <span className="text-slate-500">Parent: {b.parent_branch_name}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                        {b.routing_number || "—"}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="text-slate-600">
                        <span className="font-medium text-slate-800 block">
                          {b.district_name || b.district}, {b.division_name || b.division}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate max-w-[180px] block" title={b.address}>
                          {b.address || b.upazila_name || b.upazila}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          b.unit_type === "sub_branch"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {b.unit_type || "branch"}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="text-[11px] text-slate-600 space-y-0.5">
                        {b.phone && <p>{b.phone}</p>}
                        {b.email && <p className="text-slate-400 truncate max-w-[120px]">{b.email}</p>}
                        {!b.phone && !b.email && <span className="text-slate-400">—</span>}
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      {b.source_verified_at ? (
                        <div className="flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                          <ShieldCheck size={14} />
                          <span>Verified</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Pending Review</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenCorrection(b)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                      >
                        <FileEdit size={12} />
                        <span>Request Edit</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="p-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => fetchBranches(pagination.page - 1)}
                disabled={pagination.page <= 1 || loading}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => fetchBranches(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages || loading}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Correction Request Modal */}
      {isModalOpen && selectedBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Request Branch Registry Correction
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              BanglaQR strictly enforces verified regulatory data. Any changes to branch names, addresses, or 9-digit routing numbers must include an official circular / source URL and will be audited by platform administrators.
            </p>

            <form onSubmit={handleSubmitChangeRequest} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Branch Name</label>
                <input
                  type="text"
                  value={changeForm.branchName}
                  onChange={(e) => setChangeForm({ ...changeForm, branchName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    9-Digit Routing Number
                  </label>
                  <input
                    type="text"
                    maxLength={9}
                    pattern="\d{9}"
                    value={changeForm.routingNumber}
                    onChange={(e) => setChangeForm({ ...changeForm, routingNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                    placeholder="e.g. 060260123"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Official Source URL</label>
                  <input
                    type="url"
                    placeholder="https://bank.com.bd/branches/..."
                    value={changeForm.sourceUrl}
                    onChange={(e) => setChangeForm({ ...changeForm, sourceUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Branch Address</label>
                <input
                  type="text"
                  value={changeForm.address}
                  onChange={(e) => setChangeForm({ ...changeForm, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Reason for Update & Regulatory Reference
                </label>
                <textarea
                  rows={3}
                  placeholder="Explain why this change is needed (e.g. Relocated branch per Bangladesh Bank circular #...)"
                  value={changeForm.reason}
                  onChange={(e) => setChangeForm({ ...changeForm, reason: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingChange}
                  className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition disabled:opacity-50"
                >
                  {submittingChange ? "Submitting..." : "Submit Change Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

