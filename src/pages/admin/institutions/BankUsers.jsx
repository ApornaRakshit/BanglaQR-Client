import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import {
  Users,
  Search,
  Plus,
  Landmark,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Mail,
  Phone,
  Lock,
  UserCheck,
  ShieldAlert,
  Loader2,
  Check,
  Send,
  Copy,
  Clock,
  XCircle,
  RotateCw,
  Ban,
  Link as LinkIcon,
  X,
} from "lucide-react";
import { adminApi } from "../../../services/adminApi";

export default function BankUsers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialInstitutionId = searchParams.get("institutionId") || "all";

  const [activeTab, setActiveTab] = useState("staff"); // "staff" or "invitations"
  const [users, setUsers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedInstitutionId, setSelectedInstitutionId] = useState(initialInstitutionId);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [provisionMode, setProvisionMode] = useState("direct"); // "direct" (Direct Bank Account) or "invite"
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");
  const [formData, setFormData] = useState({
    institutionId: "",
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "bank_admin",
  });

  // Generated Invitation Success Modal
  const [newInviteResult, setNewInviteResult] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const showToast = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [usersRes, invRes, instRes] = await Promise.all([
        adminApi.getInstitutionUsers({
          institutionId: selectedInstitutionId !== "all" ? selectedInstitutionId : undefined,
          search: search.trim() || undefined,
        }),
        adminApi.getInstitutionInvitations({
          institutionId: selectedInstitutionId !== "all" ? selectedInstitutionId : undefined,
        }).catch(() => ({ data: [] })),
        adminApi.getInstitutions(),
      ]);

      const userList = usersRes?.data || usersRes || [];
      const invList = invRes?.data || invRes || [];
      const bankList = instRes?.data || instRes || [];

      setUsers(Array.isArray(userList) ? userList : []);
      setInvitations(Array.isArray(invList) ? invList : []);
      setInstitutions(Array.isArray(bankList) ? bankList : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load bank staff data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedInstitutionId]);

  const handleFilterChange = (id) => {
    setSelectedInstitutionId(id);
    if (id === "all") {
      searchParams.delete("institutionId");
    } else {
      searchParams.set("institutionId", id);
    }
    setSearchParams(searchParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleSubmitModal = async (e) => {
    e.preventDefault();
    setModalError("");

    if (!formData.institutionId) {
      setModalError("Please select a banking institution.");
      return;
    }
    if (!formData.email.trim()) {
      setModalError("Staff email address is required.");
      return;
    }

    if (provisionMode === "direct") {
      if (!formData.password || formData.password.length < 6) {
        setModalError("Password must be at least 6 characters.");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setModalError("Password and Confirm Password do not match.");
        return;
      }
    }

    setSubmitting(true);
    try {
      if (provisionMode === "invite") {
        const res = await adminApi.inviteInstitutionStaff({
          institutionId: Number(formData.institutionId),
          name: formData.name.trim() || undefined,
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim() || undefined,
          roleName: formData.role,
        });

        setIsModalOpen(false);
        const data = res?.data || res;
        setNewInviteResult(data);
        showToast(`Invitation created successfully for ${formData.email}.`);
      } else {
        await adminApi.provisionInstitutionUser({
          institutionId: Number(formData.institutionId),
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim() || undefined,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          role: formData.role,
        });
        showToast(`Bank account for "${formData.name || formData.email}" created successfully.`);
        setIsModalOpen(false);
      }

      setFormData({
        institutionId: "",
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        role: "bank_admin",
      });
      fetchData();
    } catch (err) {
      setModalError(err?.response?.data?.message || "Failed to process bank account creation.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (membership) => {
    const membershipId = Number(membership?.membership_id ?? membership?.id);
    const currentStatus = membership?.membership_status ?? membership?.status;

    if (!Number.isSafeInteger(membershipId) || membershipId <= 0) {
      showToast("Cannot update this staff member: invalid membership ID.", "error");
      return;
    }

    const nextStatus = currentStatus === "active" ? "suspended" : "active";

    try {
      await adminApi.updateInstitutionUserStatus(membershipId, {
        membershipStatus: nextStatus,
      });
      showToast(`Staff membership status updated to ${nextStatus}.`);
      await fetchData();
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to update staff status.", "error");
    }
  };

  const handleResendInvite = async (invitationId) => {
    try {
      const res = await adminApi.resendInstitutionInvitation(invitationId);
      showToast("Invitation resent successfully.");
      const data = res?.data || res;
      if (data?.invitationUrl) {
        setNewInviteResult(data);
      }
      fetchData();
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to resend invitation.", "error");
    }
  };

  const handleRevokeInvite = async (invitationId) => {
    if (!window.confirm("Are you sure you want to revoke this invitation?")) return;
    try {
      await adminApi.revokeInstitutionInvitation(invitationId);
      showToast("Invitation revoked successfully.");
      fetchData();
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to revoke invitation.", "error");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case "bank_admin":
        return {
          label: "Bank Admin",
          class: "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300",
        };
      case "bank_reviewer":
        return {
          label: "KYC Reviewer",
          class: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300",
        };
      case "bank_operations":
        return {
          label: "Operations Staff",
          class: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
        };
      default:
        return {
          label: role || "Bank User",
          class: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
        };
    }
  };

  const getInviteStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return {
          label: "Pending",
          class: "bg-amber-50 text-amber-700 border-amber-200",
        };
      case "accepted":
        return {
          label: "Accepted",
          class: "bg-emerald-50 text-emerald-700 border-emerald-200",
        };
      case "expired":
        return {
          label: "Expired",
          class: "bg-slate-100 text-slate-600 border-slate-200",
        };
      case "revoked":
        return {
          label: "Revoked",
          class: "bg-rose-50 text-rose-700 border-rose-200",
        };
      default:
        return {
          label: status,
          class: "bg-slate-100 text-slate-600 border-slate-200",
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 ${
            notification.type === "error" ? "bg-rose-600" : "bg-emerald-600"
          } text-white rounded-xl shadow-lg text-xs font-semibold animate-in fade-in slide-in-from-top-2`}
        >
          {notification.type === "error" ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <Users size={24} />
            </div>
            Institution Staff & Users
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Provision and invite institution officers, KYC reviewers, and operation accounts across banks & MFS providers
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setFormData({
              institutionId: selectedInstitutionId !== "all" ? selectedInstitutionId : "",
              name: "",
              email: "",
              phone: "",
              password: "",
              confirmPassword: "",
              role: "bank_admin",
            });
            setProvisionMode("direct");
            setModalError("");
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus size={16} />
          <span>Create Bank Account</span>
        </button>
      </div>

      {/* Sub Tabs: Active Staff vs Invitations */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab("staff")}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === "staff"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Users size={14} />
          <span>Active Staff Members ({users.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("invitations")}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === "invitations"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Send size={14} />
          <span>Pending Invitations ({invitations.filter((i) => i.status === "pending").length})</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search staff or recipient by name or email address..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
          <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
        </form>

        <div className="flex items-center gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">Filter Institution:</span>
            <select
              value={selectedInstitutionId}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Institutions ({institutions.length})</option>
              {institutions.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.name} ({inst.institution_code || inst.code || "—"})
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={fetchData}
            title="Refresh"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-emerald-600" : ""} />
          </button>
        </div>
      </div>

      {/* TAB 1: Active Staff Table */}
      {activeTab === "staff" && (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3.5 px-4">Staff Member</th>
                  <th className="py-3.5 px-3">Banking Partner</th>
                  <th className="py-3.5 px-3">Institution Role</th>
                  <th className="py-3.5 px-3">Account Status</th>
                  <th className="py-3.5 px-3">Last Login</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <RefreshCw size={24} className="animate-spin mx-auto text-emerald-600 mb-2" />
                      <p className="text-xs">Loading bank staff...</p>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <Users size={32} className="mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                      <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                        No staff accounts found
                      </p>
                      <p className="text-xs mt-1">Provision or invite a new bank administrator or reviewer.</p>
                    </td>
                  </tr>
                ) : (
                  users.map((mem) => {
                    const roleBadge = getRoleBadge(mem.institution_role ?? mem.role_name);
                    const membershipStatus = mem.membership_status ?? mem.status ?? "inactive";
                    const isUserActive = membershipStatus === "active";
                    const displayName =
                      mem.name || mem.full_name || mem.email?.split("@")[0] || `User #${mem.user_id ?? "—"}`;

                    return (
                      <tr
                        key={mem.membership_id ?? mem.id ?? mem.user_id}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition group"
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs uppercase border border-slate-200 dark:border-slate-700">
                              {displayName.charAt(0) || "U"}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white block">
                                {displayName}
                              </span>
                              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                                <span className="flex items-center gap-1">
                                  <Mail size={11} />
                                  {mem.email}
                                </span>
                                {mem.phone && (
                                  <span className="flex items-center gap-1">
                                    <Phone size={11} />
                                    {mem.phone}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-2">
                            <div className="p-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                              <Landmark size={13} />
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white block">
                                {mem.institution_name}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400">
                                {mem.institution_code}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-3">
                          <span
                            className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full ${roleBadge.class}`}
                          >
                            {roleBadge.label}
                          </span>
                        </td>

                        <td className="py-3.5 px-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                              isUserActive
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                                : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                isUserActive ? "bg-emerald-500" : "bg-red-500"
                              }`}
                            />
                            <span className="capitalize">{membershipStatus.replaceAll("_", " ")}</span>
                          </span>
                        </td>

                        <td className="py-3.5 px-3 text-slate-400 text-[11px]">
                          {mem.last_login_at
                            ? new Date(mem.last_login_at).toLocaleDateString()
                            : "Never"}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(mem)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                              isUserActive
                                ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                                : "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                            }`}
                          >
                            {isUserActive ? (
                              <>
                                <ShieldAlert size={12} />
                                <span>Suspend</span>
                              </>
                            ) : (
                              <>
                                <UserCheck size={12} />
                                <span>Activate</span>
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Invitations Table */}
      {activeTab === "invitations" && (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3.5 px-4">Invited Recipient</th>
                  <th className="py-3.5 px-3">Banking Partner</th>
                  <th className="py-3.5 px-3">Role</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-3">Expires At</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <RefreshCw size={24} className="animate-spin mx-auto text-emerald-600 mb-2" />
                      <p className="text-xs">Loading invitations...</p>
                    </td>
                  </tr>
                ) : invitations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <Send size={32} className="mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                      <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                        No invitations sent yet
                      </p>
                      <p className="text-xs mt-1">
                        Use "Provision / Invite Staff" above to send a secure activation link.
                      </p>
                    </td>
                  </tr>
                ) : (
                  invitations.map((inv) => {
                    const badge = getInviteStatusBadge(inv.status);
                    const roleBadge = getRoleBadge(inv.role_name);

                    return (
                      <tr
                        key={inv.id}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition group"
                      >
                        <td className="py-3.5 px-4">
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {inv.name || inv.email}
                            </span>
                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Mail size={11} /> {inv.email}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-3">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {inv.institution_name}
                          </span>
                        </td>

                        <td className="py-3.5 px-3">
                          <span
                            className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full ${roleBadge.class}`}
                          >
                            {roleBadge.label}
                          </span>
                        </td>

                        <td className="py-3.5 px-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badge.class}`}
                          >
                            {badge.label}
                          </span>
                        </td>

                        <td className="py-3.5 px-3 text-slate-400 text-[11px]">
                          {new Date(inv.expires_at).toLocaleString()}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {inv.status === "pending" && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleResendInvite(inv.id)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition"
                                  title="Resend invitation"
                                >
                                  <RotateCw size={12} />
                                  <span>Resend</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRevokeInvite(inv.id)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                                  title="Revoke invitation"
                                >
                                  <Ban size={12} />
                                  <span>Revoke</span>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Provision / Invite Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                  <Users size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Create Bank Account
                  </h3>
                  <p className="text-xs text-slate-500">
                    Create and link bank administrator or staff credentials
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            {/* Mode Selector */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setProvisionMode("direct")}
                className={`py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 ${
                  provisionMode === "direct"
                    ? "bg-white dark:bg-slate-700 text-emerald-600 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Lock size={13} />
                <span>Direct Account Creation</span>
              </button>
              <button
                type="button"
                onClick={() => setProvisionMode("invite")}
                className={`py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 ${
                  provisionMode === "invite"
                    ? "bg-white dark:bg-slate-700 text-emerald-600 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Send size={13} />
                <span>Invite Link</span>
              </button>
            </div>

            {modalError && (
              <div className="p-3 text-xs flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40">
                <AlertCircle size={15} className="shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitModal} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Assigned Banking Institution <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.institutionId}
                  onChange={(e) => setFormData((p) => ({ ...p, institutionId: e.target.value }))}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Choose Banking Partner --</option>
                  {institutions.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name} ({inst.institution_code || inst.code || "—"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Tanvir Ahmed"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Official Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                    placeholder="tanvir@bracbank.com"
                    required
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                  <Mail size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Contact Phone (Optional)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="+880 1712 345678"
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                  <Phone size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
                </div>
              </div>

              {provisionMode === "direct" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                        placeholder="Minimum 6 characters"
                        required
                        minLength={6}
                        className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                      />
                      <Lock size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData((p) => ({ ...p, confirmPassword: e.target.value }))}
                        placeholder="Repeat your password"
                        required
                        minLength={6}
                        className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                      />
                      <Lock size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Institution Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData((p) => ({ ...p, role: e.target.value }))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="bank_admin">Bank Admin (Full institution control)</option>
                  <option value="bank_reviewer">Bank Reviewer (Review KYC & verify applications)</option>
                  <option value="bank_operations">Bank Operations (Read-only operational monitoring)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : provisionMode === "invite" ? (
                    <>
                      <Send size={13} />
                      <span>Create Invitation</span>
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      <span>Save Account</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generated Invitation Link Modal */}
      {newInviteResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Invitation Created Successfully!
                </h3>
                <p className="text-xs text-slate-500">
                  Secure activation link for {newInviteResult.email}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-600 dark:text-slate-300">
                  Institution: {newInviteResult.institutionName}
                </span>
                <span className="font-mono text-emerald-600 font-bold capitalize">
                  {newInviteResult.roleName}
                </span>
              </div>
              <p className="text-slate-500 text-[11px]">
                Valid for 7 days until {new Date(newInviteResult.expiresAt).toLocaleDateString()}.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                One-Time Activation URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={
                    newInviteResult.invitationUrl ||
                    `${window.location.origin}/bank/activate?token=${newInviteResult.invitationToken}`
                  }
                  className="flex-1 px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white select-all"
                />
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      newInviteResult.invitationUrl ||
                        `${window.location.origin}/bank/activate?token=${newInviteResult.invitationToken}`
                    )
                  }
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 transition"
                >
                  {copiedLink ? (
                    <>
                      <Check size={14} />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setNewInviteResult(null)}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
