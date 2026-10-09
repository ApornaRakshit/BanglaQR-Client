import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  LifeBuoy,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  Building2,
  ExternalLink,
  MessageSquare,
  RefreshCw,
} from "lucide-react";
import { adminApi } from "../../../services/adminApi";

export default function SupportTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [search, setSearch] = useState("");

  const fetchTickets = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminApi.getTickets({
        status: statusFilter !== "all" ? statusFilter : undefined,
        priority: priorityFilter !== "all" ? priorityFilter : undefined,
        search: search.trim() || undefined,
      });
      setTickets(res?.data?.tickets || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load support tickets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, priorityFilter, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <LifeBuoy className="text-emerald-600" />
            Support Helpdesk
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage merchant inquiries, technical integration tickets, and dispute escalation.
          </p>
        </div>
        <button
          onClick={fetchTickets}
          className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 shadow-sm"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tickets by subject or merchant..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Tickets Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading helpdesk tickets...</div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center">
            <LifeBuoy size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-slate-600 dark:text-slate-300 font-semibold">No Tickets Found</p>
            <p className="text-sm text-slate-400 mt-1">There are no support inquiries matching your filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 uppercase text-[11px] font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-5 py-3">Subject & Ticket #</th>
                  <th className="px-5 py-3">Merchant</th>
                  <th className="px-5 py-3">Priority</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Created</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-750 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <MessageSquare size={16} className="text-emerald-600 shrink-0" />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{t.subject}</p>
                          <p className="text-sm font-mono text-slate-400">{t.ticket_number || `#TCK-${t.id}`}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        to={`/admin/merchants/${t.merchant_id}`}
                        className="font-medium text-slate-800 dark:text-slate-200 hover:text-emerald-600 flex items-center gap-1.5"
                      >
                        <Building2 size={14} className="text-slate-400" />
                        {t.company_name || `Merchant #${t.merchant_id}`}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-sm font-semibold ${
                          t.priority === "high" || t.priority === "urgent"
                            ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 font-bold"
                            : t.priority === "medium"
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                        }`}
                      >
                        {t.priority || "Normal"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-sm font-semibold ${
                          t.status === "resolved" || t.status === "closed"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : t.status === "in_progress"
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
                            : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                        }`}
                      >
                        {t.status === "resolved" ? (
                          <CheckCircle size={12} />
                        ) : (
                          <Clock size={12} />
                        )}
                        {t.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-500">
                      {t.created_at ? new Date(t.created_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        to={`/admin/support/${t.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 transition"
                      >
                        Reply & Resolve <ExternalLink size={12} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

