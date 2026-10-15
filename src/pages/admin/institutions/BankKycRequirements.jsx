import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router";
import {
  FileCheck,
  Plus,
  Landmark,
  CheckCircle2,
  RefreshCw,
  Edit2,
  Trash2,
  CheckSquare,
  Square,
} from "lucide-react";
import { adminApi } from "../../../services/adminApi";

export default function BankKycRequirements() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialInstitutionId = searchParams.get("institutionId") || "all";

  const [requirements, setRequirements] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [error, setError] = useState("");

  const [selectedInstitutionId, setSelectedInstitutionId] = useState(initialInstitutionId);

  const showToast = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [reqRes, instRes] = await Promise.all([
        adminApi.getInstitutionKycRequirements({
          institutionId: selectedInstitutionId !== "all" ? selectedInstitutionId : undefined,
        }),
        adminApi.getInstitutions({ limit: 100 }),
      ]);

      const reqList = reqRes?.data || reqRes?.requirements || reqRes || [];
      const bankList = instRes?.institutions || instRes?.data || instRes || [];

      setRequirements(Array.isArray(reqList) ? reqList : []);
      setInstitutions(Array.isArray(bankList) ? bankList : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load KYC requirements.");
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



  const handleDelete = async (item) => {
    if (!window.confirm(`Delete KYC requirement "${item.name}"?`)) return;

    try {
      await adminApi.deleteInstitutionKycRequirement(item.id);
      showToast("KYC requirement removed.");
      fetchData();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete requirement.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-emerald-600 text-white rounded-xl shadow-lg text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 size={16} />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <FileCheck size={24} />
            </div>
            Bank KYC & Document Requirements
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Specify mandatory compliance documents, trade licenses, and identity verification requirements per bank
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            const query = selectedInstitutionId && selectedInstitutionId !== "all" 
              ? `?institutionId=${selectedInstitutionId}` 
              : "";
            navigate(`/admin/institutions/kyc-requirements/new${query}`);
          }}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus size={16} />
          <span>Add KYC Requirement</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">Filter Bank:</span>
          <select
            value={selectedInstitutionId}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Banking Partners (Global & Bank-Specific)</option>
            {institutions.map((inst) => (
              <option key={inst.id} value={inst.id}>
                {inst.name} ({inst.code})
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

      {/* Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3.5 px-4">Requirement / Document</th>
                <th className="py-3.5 px-3">Banking Partner</th>
                <th className="py-3.5 px-3">Doc Type</th>
                <th className="py-3.5 px-3">Mandatory</th>
                <th className="py-3.5 px-3">Order</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw size={24} className="animate-spin mx-auto text-emerald-600 mb-2" />
                    <p className="text-xs">Loading KYC requirements...</p>
                  </td>
                </tr>
              ) : requirements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <FileCheck size={32} className="mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                      No KYC requirements defined
                    </p>
                    <p className="text-xs mt-1">Configure compliance documents for this banking partner.</p>
                  </td>
                </tr>
              ) : (
                requirements.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition group"
                  >
                    {/* Name & Code */}
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {item.name}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">
                          {item.requirement_code}
                        </span>
                        {item.instructions && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                            {item.instructions}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Bank */}
                    <td className="py-3.5 px-3">
                      {item.institution_name ? (
                        <div className="flex items-center gap-1.5">
                          <Landmark size={13} className="text-emerald-600" />
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {item.institution_name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                          Global Standard
                        </span>
                      )}
                    </td>

                    {/* Doc Type */}
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 capitalize">
                        {item.document_type?.replace(/_/g, " ")}
                      </span>
                    </td>

                    {/* Mandatory */}
                    <td className="py-3.5 px-3">
                      {item.is_mandatory ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 dark:text-red-400">
                          <CheckSquare size={13} />
                          Mandatory
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                          <Square size={13} />
                          Optional
                        </span>
                      )}
                    </td>

                    {/* Order */}
                    <td className="py-3.5 px-3 font-mono text-slate-500 text-[11px]">
                      #{item.display_order || 1}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          item.status === "active"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        {item.status || "active"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/institutions/kyc-requirements/${item.id}/edit`)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
