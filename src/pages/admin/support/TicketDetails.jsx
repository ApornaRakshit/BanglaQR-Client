import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import {
  LifeBuoy,
  ArrowLeft,
  CheckCircle,
  Clock,
  Send,
  Building2,
  User,
  Shield,
  RefreshCw,
} from "lucide-react";
import { adminApi } from "../../../services/adminApi";

export default function TicketDetails() {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const fetchTicket = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminApi.getTicket(ticketId);
      setTicket(res?.data?.ticket || null);
      setMessages(res?.data?.messages || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load support ticket.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [ticketId]);

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSending(true);
    try {
      await adminApi.replyTicket(ticketId, { message: replyText });
      setReplyText("");
      fetchTicket();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to post reply.");
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await adminApi.updateTicketStatus(ticketId, { status: newStatus });
      fetchTicket();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update ticket status.");
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Loading conversation thread...</div>;
  }

  if (error || !ticket) {
    return (
      <div className="p-8 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-900 text-center space-y-3">
        <p className="text-red-600 dark:text-red-400 font-semibold">{error || "Ticket not found"}</p>
        <Link
          to="/admin/support"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200"
        >
          <ArrowLeft size={16} /> Back to Tickets
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Nav */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/support"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-600"
        >
          <ArrowLeft size={16} /> Back to Tickets
        </Link>
        <div className="flex items-center gap-3">
          <select
            value={ticket.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-sm focus:outline-none"
          >
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Ticket Header Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700/60 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-slate-400 font-bold">{ticket.ticket_number || `#${ticket.id}`}</span>
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                  ticket.priority === "high" || ticket.priority === "urgent"
                    ? "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400"
                    : "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
                }`}
              >
                {ticket.priority || "Normal"} Priority
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-1">{ticket.subject}</h1>
          </div>
          <div className="text-sm">
            <Link
              to={`/admin/merchants/${ticket.merchant_id}`}
              className="font-semibold text-emerald-600 hover:underline flex items-center gap-1.5"
            >
              <Building2 size={15} />
              {ticket.company_name || `Merchant #${ticket.merchant_id}`}
            </Link>
          </div>
        </div>

        {ticket.description && (
          <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
            {ticket.description}
          </p>
        )}
      </div>

      {/* Conversation Thread */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
          Conversation History ({messages.length})
        </h2>

        {messages.length === 0 ? (
          <div className="p-8 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-center text-slate-400 text-sm">
            No responses logged yet. Be the first to reply below.
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((m) => {
              const isAdmin = m.sender_type === "admin" || m.is_admin;
              return (
                <div
                  key={m.id}
                  className={`p-4 rounded-2xl border ${
                    isAdmin
                      ? "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 ml-6"
                      : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 mr-6"
                  }`}
                >
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-bold flex items-center gap-1.5 text-slate-900 dark:text-white">
                      {isAdmin ? <Shield size={13} className="text-emerald-600" /> : <User size={13} className="text-slate-400" />}
                      {m.sender_name || (isAdmin ? "BanglaQR Support Staff" : "Merchant Representative")}
                    </span>
                    <span className="text-slate-400">
                      {m.created_at ? new Date(m.created_at).toLocaleString() : "—"}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-line">
                    {m.message}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reply Form */}
      <form
        onSubmit={handleSendReply}
        className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm space-y-3"
      >
        <label className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Post Staff Reply to Merchant
        </label>
        <textarea
          rows={3}
          required
          placeholder="Type your response to the merchant..."
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={sending}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-sm flex items-center gap-2"
          >
            {sending ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
            Send Response
          </button>
        </div>
      </form>
    </div>
  );
}

