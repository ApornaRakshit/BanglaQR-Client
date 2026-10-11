import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import {
  Phone,
  Mail,
  Calendar,
  Search,
  Filter,
  RefreshCw,
  Eye,
  CheckCircle2,
  Clock,
  MessageSquare,
  AlertCircle,
  ChevronRight,
  ExternalLink,
  Send,
  User,
  Shield,
  Loader2,
  X,
  Building2,
} from "lucide-react";
import { adminApi } from "../../../services/adminApi";

const STATUS_CONFIG = {
  new: {
    label: "New",
    labelBn: "নতুন",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
  },
  in_progress: {
    label: "In Progress",
    labelBn: "প্রক্রিয়াধীন",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  replied: {
    label: "Replied",
    labelBn: "উত্তর দেওয়া হয়েছে",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  closed: {
    label: "Closed",
    labelBn: "সম্পন্ন",
    color: "bg-slate-100 text-slate-700 border-slate-200",
    dot: "bg-slate-400",
  },
};

export default function ContactInquiries() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("status") || "all";
  const initialInquiryId = searchParams.get("id");

  const [inquiries, setInquiries] = useState([]);
  const [summary, setSummary] = useState({ all: 0, new: 0, in_progress: 0, replied: 0, closed: 0 });
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApi.getContactInquiries({
        status: activeTab,
        search: searchQuery,
        page: pagination.page,
        limit: pagination.limit,
      });

      if (res.success && res.data) {
        setInquiries(res.data.inquiries || []);
        setPagination(res.data.pagination || pagination);
        setSummary(res.data.summary || summary);

        // If URL has specific ?id= parameter, automatically open that inquiry
        if (initialInquiryId && !selectedInquiry) {
          const matched = res.data.inquiries.find((i) => String(i.id) === String(initialInquiryId));
          if (matched) {
            setSelectedInquiry(matched);
          }
        }
      } else {
        throw new Error(res.message || "Failed to load inquiries");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "ডাটা লোড করতে সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [activeTab, pagination.page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchInquiries();
  };

  const handleTabChange = (status) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (status === "all") {
        next.delete("status");
      } else {
        next.set("status", status);
      }
      return next;
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleStatusUpdate = async (id, newStatus, adminNotes) => {
    try {
      setUpdatingStatus(true);
      const payload = { status: newStatus };
      if (adminNotes !== undefined) {
        payload.adminNotes = adminNotes;
      }
      const res = await adminApi.updateContactInquiryStatus(id, payload);
      if (res.success && res.data) {
        setInquiries((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: newStatus, adminNotes: adminNotes ?? item.adminNotes } : item))
        );
        if (selectedInquiry && selectedInquiry.id === id) {
          setSelectedInquiry((prev) => ({ ...prev, status: newStatus, adminNotes: adminNotes ?? prev.adminNotes }));
        }
        showToast("ইনকোয়ারি তথ্য ও স্ট্যাটাস আপডেট করা হয়েছে", "success");
        // Refetch summary counts
        fetchInquiries();
      }
    } catch (err) {
      showToast(err.response?.data?.message || "স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে", "error");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return d.toLocaleString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl px-4 py-3 text-xs font-bold shadow-2xl animate-in slide-in-from-bottom-4 ${
            toast.type === "error" ? "bg-red-600 text-white" : "bg-emerald-600 text-white"
          }`}
        >
          <CheckCircle2 size={16} />
          <span>{toast.message}</span>
        </div>
      )}

      {/* 1. Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <span>Admin</span>
            <span>/</span>
            <span>Communication</span>
            <span>/</span>
            <span className="text-slate-700 font-semibold">Contact Inquiries</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2.5">
            <MessageSquare className="text-emerald-600" />
            <span>যোগাযোগ ও ডেমো অনুরোধ (Contact Inquiries)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            পাবলিক ওয়েবসাইট থেকে ভিজিটরদের পাঠানো সমস্ত বার্তা ও সেবা আগ্রহের রিয়েল-টাইম তালিকা
          </p>
        </div>

        <button
          type="button"
          onClick={fetchInquiries}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw size={13} className={loading ? "animate-spin text-emerald-600" : "text-slate-500"} />
          <span>রিফ্রেশ করুন</span>
        </button>
      </div>

      {/* 2. Status Summary Tabs & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "all", label: "All Inquiries", count: summary.all },
            { id: "new", label: "New (নতুন)", count: summary.new, color: "text-blue-700 bg-blue-50 border-blue-200" },
            { id: "in_progress", label: "In Progress (চলমান)", count: summary.in_progress, color: "text-amber-700 bg-amber-50 border-amber-200" },
            { id: "replied", label: "Replied (উত্তর দেওয়া)", count: summary.replied, color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
            { id: "closed", label: "Closed (সম্পন্ন)", count: summary.closed, color: "text-slate-700 bg-slate-100 border-slate-200" },
          ].map((tab) => {
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition border ${
                  isTabActive
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-black ${
                    isTabActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative w-full md:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="নাম, ফোন, ইমেইল বা সার্ভিস দিয়ে খুঁজুন..."
            className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </form>
      </div>

      {/* 3. Inquiries Table */}
      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3">
            <Loader2 size={32} className="animate-spin text-emerald-600" />
            <p className="text-xs font-semibold text-slate-500">অনুরোধগুলো লোড হচ্ছে...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center space-y-3">
            <AlertCircle size={32} className="mx-auto text-red-500" />
            <p className="text-xs text-red-600 font-semibold">{error}</p>
            <button
              type="button"
              onClick={fetchInquiries}
              className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
            >
              পুনরায় চেষ্টা করুন
            </button>
          </div>
        ) : inquiries.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <MessageSquare size={22} />
            </div>
            <h3 className="text-sm font-bold text-slate-900">কোনো ইনকোয়ারি পাওয়া যায়নি</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery
                ? `"${searchQuery}" এর সাথে মিলে এমন কোনো অনুরোধ পাওয়া যায়নি।`
                : "ওয়েবসাইটের কন্টাক্ট ফর্ম থেকে কোনো নতুন অনুরোধ জমা পড়লে তা এখানে দেখতে পাবেন।"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">তারিখ ও সময়</th>
                  <th className="py-3.5 px-4">গ্রাহকের নাম ও যোগাযোগ</th>
                  <th className="py-3.5 px-4">আগ্রহী সার্ভিস</th>
                  <th className="py-3.5 px-4">বার্তা / বিবরণ</th>
                  <th className="py-3.5 px-4">স্ট্যাটাস</th>
                  <th className="py-3.5 px-4 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inquiries.map((inq) => {
                  const statusConf = STATUS_CONFIG[inq.status] || STATUS_CONFIG.new;
                  return (
                    <tr
                      key={inq.id}
                      className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                      onClick={() => setSelectedInquiry(inq)}
                    >
                      {/* Date & Time */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Calendar size={13} className="text-slate-400" />
                          <span className="font-semibold">{formatDate(inq.createdAt)}</span>
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5 min-w-[200px]">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-xs">{inq.fullName}</span>
                            <span className="rounded bg-slate-100 text-slate-600 px-1.5 py-0.5 text-[10px] font-mono font-bold">
                              {inq.inquiryReference || inq.inquiry_reference || `#${inq.id}`}
                            </span>
                          </div>
                          {(inq.companyName || inq.company_name) && (
                            <p className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                              <Building2 size={11} className="shrink-0" />
                              <span>{inq.companyName || inq.company_name}</span>
                            </p>
                          )}
                          <div className="flex items-center gap-3 text-[11px] text-slate-500">
                            <span className="flex items-center gap-1">
                              <Phone size={11} className="text-emerald-600" />
                              {inq.phone}
                            </span>
                            <span className="flex items-center gap-1 truncate max-w-[140px]">
                              <Mail size={11} className="text-blue-500" />
                              {inq.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Interested Service */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-800 border border-emerald-200">
                          {inq.serviceName}
                        </span>
                      </td>

                      {/* Message Preview */}
                      <td className="py-3.5 px-4">
                        <p className="max-w-xs truncate text-slate-600 text-xs" title={inq.message || "কোনো বার্তা নেই"}>
                          {inq.message || <span className="text-slate-400 italic">কোনো বার্তা নেই</span>}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${statusConf.color}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${statusConf.dot}`} />
                          <span>{statusConf.labelBn}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedInquiry(inq)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition"
                          >
                            <Eye size={12} />
                            <span>বিস্তারিত</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Inquiry Details Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-100 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold tracking-wider text-emerald-800 border border-emerald-200">
                    <MessageSquare size={12} />
                    রেফারেন্স: {selectedInquiry.inquiryReference || selectedInquiry.inquiry_reference || `#${selectedInquiry.id}`}
                  </span>
                  {(selectedInquiry.companyName || selectedInquiry.company_name) && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-800 border border-blue-200">
                      <Building2 size={11} />
                      {selectedInquiry.companyName || selectedInquiry.company_name}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-black text-slate-900">{selectedInquiry.fullName}</h3>
                <p className="text-xs text-slate-400 mt-0.5">জমা পড়েছে: {formatDate(selectedInquiry.createdAt)}</p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedInquiry(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Contact & Service Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">যোগাযোগের তথ্য</p>
                <div className="space-y-1 text-xs">
                  <p className="flex items-center gap-2 font-bold text-slate-800">
                    <Phone size={13} className="text-emerald-600" />
                    <a href={`tel:${selectedInquiry.phone}`} className="hover:underline">
                      {selectedInquiry.phone}
                    </a>
                  </p>
                  <p className="flex items-center gap-2 text-slate-600 truncate">
                    <Mail size={13} className="text-blue-500" />
                    <a href={`mailto:${selectedInquiry.email}`} className="hover:underline">
                      {selectedInquiry.email}
                    </a>
                  </p>
                  {(selectedInquiry.companyName || selectedInquiry.company_name) && (
                    <p className="flex items-center gap-2 text-slate-600">
                      <Building2 size={13} className="text-slate-400" />
                      <span>{selectedInquiry.companyName || selectedInquiry.company_name}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">আগ্রহী সেবা</p>
                <p className="text-xs font-black text-emerald-800">{selectedInquiry.serviceName}</p>
                <p className="text-[10px] text-slate-500">IP: {selectedInquiry.ipAddress || "127.0.0.1"}</p>
              </div>
            </div>

            {/* Message Body */}
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-700">গ্রাহকের বার্তা / প্রজেক্টের বিবরণ:</p>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-800 min-h-[90px] whitespace-pre-wrap">
                {selectedInquiry.message || "কোনো অতিরিক্ত বিবরণ প্রদান করা হয়নি।"}
              </div>
            </div>

            {/* Internal Admin Note */}
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-700">অভ্যন্তরীণ নোট (Internal Admin Note):</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="নোট বা ফলো-আপ রিমার্ক লিখুন..."
                  defaultValue={selectedInquiry.adminNotes || selectedInquiry.admin_notes || ""}
                  id="adminNotesInput"
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    const val = document.getElementById("adminNotesInput")?.value || "";
                    handleStatusUpdate(selectedInquiry.id, selectedInquiry.status, val);
                  }}
                  className="rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition"
                >
                  সংরক্ষণ
                </button>
              </div>
            </div>

            {/* Status Selector & Quick Actions */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-700">ইনকোয়ারি স্ট্যাটাস পরিবর্তন করুন:</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "new", label: "New (নতুন)" },
                  { id: "in_progress", label: "In Progress (চলমান)" },
                  { id: "replied", label: "Replied (উত্তর সম্পন্ন)" },
                  { id: "closed", label: "Closed (বন্ধ)" },
                ].map((st) => {
                  const isCur = selectedInquiry.status === st.id;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      disabled={updatingStatus}
                      onClick={() => handleStatusUpdate(selectedInquiry.id, st.id)}
                      className={`rounded-xl px-2.5 py-2 text-xs font-bold border transition ${
                        isCur
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {st.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${selectedInquiry.phone}`}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 font-bold text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                >
                  <Phone size={13} />
                  কল করুন
                </a>
                <a
                  href={`mailto:${selectedInquiry.email}?subject=Regarding your BanglaQR Inquiry`}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 px-3 py-2 font-bold text-blue-800 border border-blue-200 hover:bg-blue-100"
                >
                  <Mail size={13} />
                  ইমেইল পাঠান
                </a>
              </div>

              <button
                type="button"
                onClick={() => setSelectedInquiry(null)}
                className="rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

