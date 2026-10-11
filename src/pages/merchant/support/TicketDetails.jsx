import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import {
  ArrowLeft,
  LifeBuoy,
  Send,
  User,
  Shield,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { merchantApi } from "../../../services/merchantApi";

const statusConfig = {
  open: { label: "Open", bg: "bg-blue-50 text-blue-700 border-blue-200" },
  in_progress: { label: "In Progress", bg: "bg-amber-50 text-amber-700 border-amber-200" },
  resolved: { label: "Resolved", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  closed: { label: "Closed", bg: "bg-slate-100 text-slate-600 border-slate-200" },
};

export default function TicketDetails() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [error, setError] = useState(null);

  const fetchTicket = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await merchantApi.getTicketById(id);
      setTicket(res.data);
    } catch (err) {
      console.error("Failed to load ticket:", err);
      setError(err.response?.data?.message || "Failed to load ticket details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      setReplying(true);
      await merchantApi.replyTicket(id, { message: replyText });
      setReplyText("");
      fetchTicket();
    } catch (err) {
      console.error("Failed to send reply:", err);
    } finally {
      setReplying(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
        <RefreshCw className="h-8 w-8 text-emerald-600 animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-600">Loading support conversation...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center text-rose-800">
        <AlertCircle className="h-8 w-8 text-rose-600 mx-auto mb-2" />
        <p className="font-semibold">{error || "Ticket not found"}</p>
        <Link
          to="/merchant/support"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Support
        </Link>
      </div>
    );
  }

  const config = statusConfig[ticket.status] || statusConfig.open;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <Link
          to="/merchant/support"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Support
        </Link>
      </div>

      {/* Ticket Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                {ticket.ticketNumber || ticket.ticket_number || `#TCK-${ticket.id}`}
              </span>
              <h1 className="text-lg font-bold text-slate-900">{ticket.subject}</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Opened on {(ticket.createdAt || ticket.created_at) ? new Date(ticket.createdAt || ticket.created_at).toLocaleString() : "—"} • Category:{" "}
              <span className="font-semibold capitalize">{ticket.category?.replace("_", " ")}</span>
            </p>
          </div>

          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border self-start md:self-auto ${config.bg}`}
          >
            {config.label}
          </span>
        </div>

        {/* Initial message */}
        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
          {ticket.message || ticket.description || "No description provided."}
        </div>
      </div>

      {/* Discussion Thread */}
      {(ticket.replies || ticket.messages) && (ticket.replies || ticket.messages).length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Conversation History
          </h2>
          {(ticket.replies || ticket.messages).map((r, i) => {
            const isAdmin = r.senderType === "admin" || r.sender_type === "admin";
            const dateVal = r.createdAt || r.created_at;
            return (
              <div
                key={i}
                className={`p-4 rounded-2xl border text-xs ${
                  isAdmin
                    ? "bg-emerald-50/50 border-emerald-200/80 ml-4"
                    : "bg-white border-slate-200/80 mr-4"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isAdmin ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {isAdmin ? "A" : "M"}
                    </div>
                    <span className="font-bold text-slate-900">
                      {isAdmin ? "BanglaQR Support Agent" : "You"}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {dateVal ? new Date(dateVal).toLocaleString() : "—"}
                  </span>
                </div>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{r.message}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Reply Box */}
      {ticket.status !== "closed" && (
        <form onSubmit={handleSendReply} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-900">Add a Response</h3>
          <textarea
            rows={3}
            required
            placeholder="Type your message or response here..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={replying || !replyText.trim()}
              className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              <Send className="h-3.5 w-3.5" />
              {replying ? "Sending..." : "Send Reply"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

