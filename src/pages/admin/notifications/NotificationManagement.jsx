import { useState, useEffect } from "react";
import {
  Bell,
  Send,
  CheckCircle,
  Clock,
  Trash2,
  Users,
  Building2,
  RefreshCw,
} from "lucide-react";
import { adminApi } from "../../../services/adminApi";

export default function NotificationManagement() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [broadcastData, setBroadcastData] = useState({
    title: "",
    message: "",
    target_role: "merchant", // 'merchant' | 'admin' | 'all'
    type: "info",
  });
  const [sending, setSending] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminApi.getNotifications();
      setNotifications(res?.data?.notifications || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleBroadcast = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await adminApi.broadcastNotification(broadcastData);
      setIsBroadcastOpen(false);
      setBroadcastData({
        title: "",
        message: "",
        target_role: "merchant",
        type: "info",
      });
      fetchNotifications();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to send broadcast.");
    } finally {
      setSending(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await adminApi.markNotificationRead(id);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await adminApi.markAllNotificationsRead();
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminApi.deleteNotification(id);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Bell className="text-emerald-600" />
            Platform Notifications & Announcements
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Broadcast operational alerts, compliance notices, and system maintenance bulletins.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleMarkAllRead}
            className="px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 shadow-sm"
          >
            Mark All as Read
          </button>
          <button
            onClick={() => setIsBroadcastOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-sm transition"
          >
            <Send size={14} />
            Broadcast Message
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Notifications List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm divide-y divide-slate-100 dark:divide-slate-700/60 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading system notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center">
            <Bell size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-slate-600 dark:text-slate-300 font-semibold">Inbox Zero</p>
            <p className="text-sm text-slate-400 mt-1">No alerts or notifications recorded in this channel.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-5 flex items-start justify-between gap-4 transition hover:bg-slate-50/50 dark:hover:bg-slate-750 ${
                !n.is_read ? "bg-emerald-50/30 dark:bg-emerald-950/10" : ""
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`mt-0.5 p-2 rounded-xl shrink-0 ${
                    n.type === "alert" || n.type === "warning"
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-950/50"
                      : n.type === "success"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50"
                      : "bg-blue-100 text-blue-700 dark:bg-blue-950/50"
                  }`}
                >
                  <Bell size={16} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">{n.title}</h3>
                    {!n.is_read && (
                      <span className="h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200 dark:ring-emerald-900" />
                    )}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {n.message}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {n.created_at ? new Date(n.created_at).toLocaleString() : "—"}
                    </span>
                    {n.target_role && (
                      <span className="uppercase font-mono font-semibold text-slate-500">
                        Target: {n.target_role}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {!n.is_read && (
                  <button
                    onClick={() => handleMarkRead(n.id)}
                    className="p-1.5 text-slate-500 hover:text-emerald-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                    title="Mark Read"
                  >
                    <CheckCircle size={15} />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(n.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                  title="Delete"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Broadcast Modal */}
      {isBroadcastOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleBroadcast}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg p-6 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                Broadcast System Announcement
              </h3>
              <button
                type="button"
                onClick={() => setIsBroadcastOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase">
                Announcement Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Scheduled Network Maintenance on BanglaQR Gateway"
                value={broadcastData.title}
                onChange={(e) => setBroadcastData({ ...broadcastData, title: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase">
                  Target Audience
                </label>
                <select
                  value={broadcastData.target_role}
                  onChange={(e) => setBroadcastData({ ...broadcastData, target_role: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="merchant">All Merchants</option>
                  <option value="admin">Operations Staff / Admins</option>
                  <option value="all">Everyone</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase">
                  Severity Type
                </label>
                <select
                  value={broadcastData.type}
                  onChange={(e) => setBroadcastData({ ...broadcastData, type: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="info">Information (Blue)</option>
                  <option value="warning">Warning / Alert (Amber)</option>
                  <option value="success">Success / Resolved (Green)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase">
                Message Content *
              </label>
              <textarea
                rows={4}
                required
                placeholder="Compose the full notice message..."
                value={broadcastData.message}
                onChange={(e) => setBroadcastData({ ...broadcastData, message: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsBroadcastOpen(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sending}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-sm flex items-center gap-2"
              >
                {sending && <RefreshCw size={12} className="animate-spin" />}
                Send Broadcast
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

