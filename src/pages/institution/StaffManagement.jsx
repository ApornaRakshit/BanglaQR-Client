import { useState, useEffect } from "react";
import {
  Users2,
  RefreshCw,
  GitBranch,
  Shield,
  Plus,
  Check,
  X,
  Search,
  CheckCircle2,
  Building2,
} from "lucide-react";
import { institutionApi } from "../../services/institutionApi";

export default function InstitutionStaffManagement() {
  const [staff, setStaff] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Branch Assignment Modal
  const [assigningMember, setAssigningMember] = useState(null);
  const [selectedBranchIds, setSelectedBranchIds] = useState([]);
  const [submittingAssign, setSubmittingAssign] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [staffRes, branchRes] = await Promise.all([
        institutionApi.getStaff(),
        institutionApi.getBranches({ limit: 100 }),
      ]);

      setStaff(staffRes.staff || []);
      setBranches(branchRes.branches || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load staff list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAssignModal = (member) => {
    setAssigningMember(member);
    const currentBranchIds = (member.assignedBranches || []).map((b) => b.id);
    setSelectedBranchIds(currentBranchIds);
  };

  const toggleBranchSelection = (branchId) => {
    if (selectedBranchIds.includes(branchId)) {
      setSelectedBranchIds(selectedBranchIds.filter((id) => id !== branchId));
    } else {
      setSelectedBranchIds([...selectedBranchIds, branchId]);
    }
  };

  const handleSaveAssignments = async () => {
    if (!assigningMember) return;
    setSubmittingAssign(true);
    try {
      await institutionApi.assignStaffBranches(assigningMember.membership_id, {
        branchIds: selectedBranchIds,
      });

      setSuccessMsg(`Assigned ${selectedBranchIds.length} branch(es) to ${assigningMember.email}`);
      setAssigningMember(null);
      fetchData();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to save branch assignments.");
    } finally {
      setSubmittingAssign(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
              <Users2 size={24} />
            </div>
            Institution Staff & Branch Scopes
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage reviewer roles, authorized operators, and regional branch assignments
          </p>
        </div>

        <button
          type="button"
          onClick={fetchData}
          className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 transition self-start sm:self-auto"
        >
          <RefreshCw size={15} className={loading ? "animate-spin text-purple-600" : ""} />
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

      {/* Staff Table */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Staff User</th>
                <th className="py-3.5 px-3">Role</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-3">Authorized Branches</th>
                <th className="py-3.5 px-3">Joined Date</th>
                <th className="py-3.5 px-4 text-right">Scope Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <RefreshCw size={24} className="animate-spin mx-auto text-purple-600 mb-2" />
                    <span>Loading staff members...</span>
                  </td>
                </tr>
              ) : staff.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Users2 size={32} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-sm font-semibold text-slate-600">No staff members assigned</p>
                  </td>
                </tr>
              ) : (
                staff.map((member) => (
                  <tr key={member.membership_id} className="hover:bg-slate-50/75 transition">
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-bold text-slate-900 block">{member.email}</span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {member.phone || "No phone listed"}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 capitalize">
                        <Shield size={11} />
                        {(member.role_name || "Staff").replace(/_/g, " ")}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          member.membership_status === "active"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {member.membership_status}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      {member.assignedBranches && member.assignedBranches.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {member.assignedBranches.map((b) => (
                            <span
                              key={b.id}
                              className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200"
                            >
                              {b.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">
                          All Branches / Universal Scope
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 font-mono text-[11px] text-slate-500">
                      {member.joined_at ? new Date(member.joined_at).toLocaleDateString() : "—"}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenAssignModal(member)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition"
                      >
                        <GitBranch size={13} />
                        <span>Assign Branches</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Branch Assignment Modal */}
      {assigningMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Assign Branches to {assigningMember.email}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select authorized branches for this staff reviewer
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAssigningMember(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 py-2">
              {branches.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No branches available</p>
              ) : (
                branches.map((b) => {
                  const isSelected = selectedBranchIds.includes(b.id);
                  return (
                    <div
                      key={b.id}
                      onClick={() => toggleBranchSelection(b.id)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition ${
                        isSelected
                          ? "bg-purple-50 border-purple-300 text-purple-900"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Building2 size={15} className={isSelected ? "text-purple-600" : "text-slate-400"} />
                        <div>
                          <span className="font-bold block">{b.branch_name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Code: {b.branch_code} | Routing: {b.routing_number || "—"}
                          </span>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                          isSelected ? "bg-purple-600 border-purple-600 text-white" : "border-slate-300"
                        }`}
                      >
                        {isSelected && <Check size={12} />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 shrink-0">
              <span className="text-xs text-slate-500 font-medium">
                {selectedBranchIds.length} branch(es) selected
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAssigningMember(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveAssignments}
                  disabled={submittingAssign}
                  className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition disabled:opacity-50"
                >
                  {submittingAssign ? "Saving..." : "Save Assignments"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

