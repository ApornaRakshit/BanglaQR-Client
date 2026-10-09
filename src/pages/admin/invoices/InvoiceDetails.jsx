import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import {
  Receipt,
  ArrowLeft,
  CheckCircle,
  Clock,
  XCircle,
  Building2,
  Calendar,
  Printer,
  DollarSign,
  RefreshCw,
} from "lucide-react";
import { adminApi } from "../../../services/adminApi";

export default function InvoiceDetails() {
  const { invoiceId } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchInvoice = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminApi.getInvoice(invoiceId);
      setInvoice(res?.data?.invoice || null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load invoice details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [invoiceId]);

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      await adminApi.updateInvoiceStatus(invoiceId, { status: newStatus });
      fetchInvoice();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update invoice status.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Loading invoice document...</div>;
  }

  if (error || !invoice) {
    return (
      <div className="p-8 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-900 text-center space-y-3">
        <p className="text-red-600 dark:text-red-400 font-semibold">{error || "Invoice not found"}</p>
        <Link
          to="/admin/invoices"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200"
        >
          <ArrowLeft size={16} /> Back to Invoices
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Nav */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/invoices"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-600"
        >
          <ArrowLeft size={16} /> Back to Invoices
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 shadow-sm"
          >
            <Printer size={14} /> Print Invoice
          </button>
          {invoice.status !== "paid" && (
            <button
              onClick={() => handleStatusChange("paid")}
              disabled={updating}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-sm"
            >
              Mark as Paid
            </button>
          )}
        </div>
      </div>

      {/* Invoice Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 shadow-sm space-y-8">
        <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-700 pb-6">
          <div>
            <span className="text-sm font-bold uppercase tracking-widest text-emerald-600">BanglaQR Platform</span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              INVOICE {invoice.invoice_number || `#${invoice.id}`}
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Issue Date: {invoice.created_at ? new Date(invoice.created_at).toLocaleDateString() : "—"}
            </p>
          </div>
          <div className="text-right">
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold uppercase ${
                invoice.status === "paid"
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                  : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
              }`}
            >
              {invoice.status === "paid" ? <CheckCircle size={12} /> : <Clock size={12} />}
              {invoice.status}
            </span>
            <p className="text-sm text-slate-400 mt-2">
              Due Date: {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : "—"}
            </p>
          </div>
        </div>

        {/* Bill To */}
        <div className="grid grid-cols-2 gap-6 text-sm">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-1">Billed To:</p>
            <p className="font-bold text-slate-900 dark:text-white">{invoice.company_name || "Merchant Business"}</p>
            <p className="text-slate-500 text-sm mt-0.5">{invoice.email || "merchant@banglaqr.com"}</p>
            <p className="text-slate-500 text-sm">{invoice.phone || "+880 1700-000000"}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-1">Payment Method:</p>
            <p className="font-semibold text-slate-900 dark:text-white">BanglaQR MFS Rail Settlement</p>
            <p className="text-slate-500 text-sm mt-0.5">Account: Interbank Transfer / Auto-Debit</p>
          </div>
        </div>

        {/* Line Items */}
        <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 text-[11px] uppercase font-bold">
              <tr>
                <th className="p-3.5">Description</th>
                <th className="p-3.5 text-right">Quantity</th>
                <th className="p-3.5 text-right">Unit Price</th>
                <th className="p-3.5 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              <tr>
                <td className="p-3.5 font-medium text-slate-900 dark:text-white">
                  {invoice.description || "BanglaQR Platform Service Fee & Onboarding Charge"}
                </td>
                <td className="p-3.5 text-right text-slate-500">1</td>
                <td className="p-3.5 text-right text-slate-700 dark:text-slate-300">
                  ৳{Number(invoice.amount || 0).toLocaleString()}
                </td>
                <td className="p-3.5 text-right font-bold text-slate-900 dark:text-white">
                  ৳{Number(invoice.amount || 0).toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Total Summary */}
        <div className="flex justify-end pt-4">
          <div className="w-64 space-y-2 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal:</span>
              <span>৳{Number(invoice.amount || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>VAT (0%):</span>
              <span>৳0.00</span>
            </div>
            <div className="flex justify-between text-base font-black text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-700 pt-2">
              <span>Grand Total:</span>
              <span className="text-emerald-600">৳{Number(invoice.amount || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

