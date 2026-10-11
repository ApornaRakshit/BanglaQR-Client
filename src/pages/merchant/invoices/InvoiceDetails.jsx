import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import {
  ArrowLeft,
  FileText,
  Printer,
  Download,
  Send,
  BellRing,
  DollarSign,
  Ban,
  Edit,
  CheckCircle2,
  Clock,
  AlertCircle,
  CreditCard,
  Building2,
  Calendar,
  RefreshCw,
  QrCode,
  ExternalLink,
  Copy,
  Check,
  X,
  History,
} from "lucide-react";
import { merchantApi } from "../../../services/merchantApi";
import logoImg from "../../../assets/logo.jpg";

const statusConfig = {
  draft: { label: "Draft", bg: "bg-slate-100 text-slate-700 border-slate-200", icon: Edit },
  sent: { label: "Sent", bg: "bg-blue-50 text-blue-700 border-blue-200", icon: Send },
  partially_paid: { label: "Partially Paid", bg: "bg-purple-50 text-purple-700 border-purple-200", icon: Clock },
  paid: { label: "Paid", bg: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  overdue: { label: "Overdue", bg: "bg-rose-50 text-rose-700 border-rose-200", icon: AlertCircle },
  cancelled: { label: "Cancelled", bg: "bg-slate-100 text-slate-500 border-slate-200 line-through", icon: Ban },
};

export default function InvoiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState(null);
  const [paymentLink, setPaymentLink] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Modals
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: "",
    paymentDate: new Date().toISOString().split("T")[0],
    paymentMethod: "cash",
    referenceId: "",
    notes: "",
  });
  const [recordingPayment, setRecordingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const showToast = (msg, isError = false) => {
    setToastMsg({ msg, isError });
    setTimeout(() => setToastMsg(null), 4000);
  };

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      setError(null);
      const [invRes, linkRes] = await Promise.all([
        merchantApi.getInvoiceById(id),
        merchantApi.getInvoicePaymentLink(id).catch(() => ({ data: { available: false } })),
      ]);
      setInvoice(invRes.data);
      setPaymentLink(linkRes.data);
    } catch (err) {
      console.error("Failed to load invoice:", err);
      setError(err.response?.data?.message || "Invoice not found or unauthorized");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const handleDownloadPdf = async () => {
    try {
      showToast("Generating PDF...");
      const response = await merchantApi.getInvoicePdfBlob(id);
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Invoice-${invoice.invoiceNumber || invoice.invoice_number || id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showToast("PDF downloaded successfully!");
    } catch (err) {
      console.error("PDF download failed:", err);
      showToast("Failed to download PDF", true);
    }
  };

  const handleSendInvoice = async () => {
    try {
      showToast("Sending invoice...");
      const res = await merchantApi.sendInvoice(id);
      showToast(res.message || "Invoice sent!");
      fetchInvoice();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to send invoice", true);
    }
  };

  const handleSendReminder = async () => {
    try {
      showToast("Sending payment reminder...");
      const res = await merchantApi.sendInvoiceReminder(id);
      showToast(res.message || "Reminder sent!");
      fetchInvoice();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to send reminder", true);
    }
  };

  const handleRecordPaymentSubmit = async (e) => {
    e.preventDefault();
    try {
      setRecordingPayment(true);
      setPaymentError(null);
      await merchantApi.recordInvoicePayment(id, {
        amount: Number(paymentData.amount),
        paymentDate: paymentData.paymentDate,
        paymentMethod: paymentData.paymentMethod,
        referenceId: paymentData.referenceId,
        notes: paymentData.notes,
      });

      showToast("Payment recorded successfully!");
      setPaymentModalOpen(false);
      setPaymentData({
        amount: "",
        paymentDate: new Date().toISOString().split("T")[0],
        paymentMethod: "cash",
        referenceId: "",
        notes: "",
      });
      fetchInvoice();
    } catch (err) {
      setPaymentError(err.response?.data?.message || "Failed to record payment");
    } finally {
      setRecordingPayment(false);
    }
  };

  const handleCancelInvoiceSubmit = async (e) => {
    e.preventDefault();
    try {
      setCancelling(true);
      await merchantApi.cancelInvoice(id, { reason: cancelReason });
      showToast("Invoice cancelled successfully");
      setCancelModalOpen(false);
      setCancelReason("");
      fetchInvoice();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to cancel invoice", true);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
        <RefreshCw className="h-8 w-8 text-emerald-600 animate-spin mx-auto mb-3" />
        <p className="text-xs font-semibold text-slate-600">Loading invoice details...</p>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center text-rose-800 max-w-lg mx-auto">
        <AlertCircle className="h-8 w-8 text-rose-600 mx-auto mb-2" />
        <p className="font-semibold text-xs">{error || "Invoice not found"}</p>
        <Link
          to="/merchant/invoices"
          className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Invoices
        </Link>
      </div>
    );
  }

  const config = statusConfig[invoice.status] || statusConfig.draft;
  const StatusIcon = config.icon;
  const isDraft = invoice.status === "draft";
  const isPaid = invoice.status === "paid";
  const isCancelled = invoice.status === "cancelled";

  const merchantName =
    invoice.companyName ||
    invoice.company_name ||
    invoice.merchant?.companyName ||
    "BanglaQR Digital Merchant";
  const merchantCode = invoice.merchantCode || invoice.merchant_code || invoice.merchant?.merchantCode || "—";
  const merchantEmail = invoice.merchantEmail || invoice.merchant_email || invoice.merchant?.email || "—";
  const merchantPhone = invoice.merchantPhone || invoice.merchant_phone || invoice.merchant?.phone || "—";
  const merchantAddress = invoice.merchantAddress || invoice.merchant?.address || "";
  const merchantLogo = invoice.merchant?.logoUrl || invoice.logoUrl || logoImg;

  return (
    <div className="printable-invoice-container space-y-6 max-w-5xl mx-auto pb-12 print:space-y-0 print:pb-0">
      {/* Toast */}
      {toastMsg && (
        <div
          className={`no-print print:hidden fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold ${
            toastMsg.isError
              ? "bg-rose-50 border-rose-200 text-rose-800"
              : "bg-emerald-50 border-emerald-200 text-emerald-800"
          }`}
        >
          {toastMsg.isError ? <AlertCircle className="h-4 w-4 text-rose-600" /> : <Check className="h-4 w-4 text-emerald-600" />}
          {toastMsg.msg}
        </div>
      )}

      {/* Top Navigation */}
      <div className="flex items-center justify-between no-print print:hidden">
        <Link
          to="/merchant/invoices"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Invoices
        </Link>

        {/* Action Buttons Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-sm transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            Download PDF
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-sm transition-colors"
          >
            <Printer className="h-3.5 w-3.5" />
            Print
          </button>

          {isDraft && (
            <Link
              to={`/merchant/invoices/${invoice.id}/edit`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-sm transition-colors"
            >
              <Edit className="h-3.5 w-3.5" />
              Edit Draft
            </Link>
          )}

          {!isCancelled && (
            <button
              onClick={handleSendInvoice}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
            >
              <Send className="h-3.5 w-3.5" />
              {isDraft ? "Send Invoice" : "Resend Email"}
            </button>
          )}

          {!isDraft && !isPaid && !isCancelled && (
            <button
              onClick={() => {
                setPaymentData({ ...paymentData, amount: String(invoice.balanceDue) });
                setPaymentModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-emerald-600/20 transition-colors"
            >
              <DollarSign className="h-3.5 w-3.5" />
              Record Payment
            </button>
          )}

          {(invoice.status === "sent" || invoice.status === "overdue" || invoice.status === "partially_paid") && (
            <button
              onClick={handleSendReminder}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
            >
              <BellRing className="h-3.5 w-3.5" />
              Send Reminder
            </button>
          )}

          {!isPaid && !isCancelled && (
            <button
              onClick={() => setCancelModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200 transition-colors"
            >
              <Ban className="h-3.5 w-3.5" />
              Cancel Invoice
            </button>
          )}
        </div>
      </div>

      {/* Main Invoice Card (Printable Layout) */}
      <div className="printable-invoice-document bg-white rounded-2xl border border-slate-200/80 p-8 shadow-sm space-y-8 print:p-0 print:space-y-6 print:border-none print:shadow-none print:bg-white">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-100 print:pb-4">
          <div className="flex items-start gap-4">
            <img
              src={merchantLogo}
              alt={merchantName}
              className="h-12 w-auto max-w-[120px] object-contain rounded-lg border border-slate-100 p-1 bg-white print:border-none print:p-0"
            />
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block">
                {merchantName}
              </span>
              <h1 className="text-2xl font-bold text-slate-900 mt-1 font-mono">
                {invoice.invoiceNumber || invoice.invoice_number || `INV-${invoice.id}`}
              </h1>
              {merchantCode !== "—" && (
                <p className="text-xs text-slate-400 mt-0.5">Merchant Code: {merchantCode}</p>
              )}
            </div>
          </div>

          <div className="text-right self-start sm:self-auto space-y-1.5">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${config.bg}`}
            >
              <StatusIcon className="h-3.5 w-3.5" />
              {config.label}
            </span>
            <div className="text-xs text-slate-500 space-y-0.5 pt-1">
              <p>Issue Date: <strong className="text-slate-700">{new Date(invoice.issueDate).toLocaleDateString()}</strong></p>
              <p>Due Date: <strong className="text-slate-700">{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "Upon Receipt"}</strong></p>
              {invoice.poNumber && <p>P.O. #: <strong className="text-slate-700">{invoice.poNumber}</strong></p>}
            </div>
          </div>
        </div>

        {/* Addresses: Issuing Merchant & Billed Customer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs bg-slate-50/70 p-5 rounded-2xl border border-slate-100">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Issuing Merchant
            </span>
            <h3 className="font-bold text-slate-900 text-sm">{merchantName}</h3>
            {merchantCode !== "—" && <p className="text-slate-500 mt-0.5">Code: {merchantCode}</p>}
            {merchantEmail !== "—" && <p className="text-slate-500">Email: {merchantEmail}</p>}
            {merchantPhone !== "—" && <p className="text-slate-500">Phone: {merchantPhone}</p>}
            {merchantAddress && <p className="text-slate-500 mt-1">{merchantAddress}</p>}
          </div>

          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Billed Customer
            </span>
            <h3 className="font-bold text-slate-900 text-sm">{invoice.customerName || "—"}</h3>
            {invoice.customerBusinessName && (
              <p className="font-semibold text-slate-700 mt-0.5">{invoice.customerBusinessName}</p>
            )}
            <p className="text-slate-500 mt-0.5">Email: {invoice.customerEmail || "—"}</p>
            <p className="text-slate-500">Phone: {invoice.customerPhone || "—"}</p>
            {invoice.customerAddress && (
              <p className="text-slate-500 mt-1">{invoice.customerAddress}</p>
            )}
            {invoice.referenceNumber && (
              <p className="text-slate-500 mt-0.5">Ref #: {invoice.referenceNumber}</p>
            )}
          </div>
        </div>

        {/* Line Items Table */}
        <div className="border border-slate-200/80 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200/80">
              <tr>
                <th className="px-5 py-3.5">Description</th>
                <th className="px-5 py-3.5 text-right">Qty</th>
                <th className="px-5 py-3.5 text-right">Unit Price</th>
                <th className="px-5 py-3.5 text-right">Disc</th>
                <th className="px-5 py-3.5 text-right">Tax</th>
                <th className="px-5 py-3.5 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Array.isArray(invoice.items) && invoice.items.length > 0 ? (
                invoice.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="px-5 py-3.5 font-medium text-slate-900">
                      {item.description || item.name || "Digital Service"}
                    </td>
                    <td className="px-5 py-3.5 text-right text-slate-600">{item.quantity}</td>
                    <td className="px-5 py-3.5 text-right text-slate-600">৳{Number(item.unitPrice || item.unit_price || 0).toFixed(2)}</td>
                    <td className="px-5 py-3.5 text-right text-slate-500">
                      {Number(item.discountPercent || 0) > 0 ? `${item.discountPercent}%` : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-right text-slate-500">
                      {Number(item.taxPercent || 0) > 0 ? `${item.taxPercent}%` : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold text-slate-900">
                      ৳{Number(item.total ?? (item.quantity * item.unitPrice)).toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-5 py-3.5 font-medium text-slate-900">BanglaQR Digital Service</td>
                  <td className="px-5 py-3.5 text-right text-slate-600">1</td>
                  <td className="px-5 py-3.5 text-right text-slate-600">৳{Number(invoice.amount).toFixed(2)}</td>
                  <td className="px-5 py-3.5 text-right text-slate-500">—</td>
                  <td className="px-5 py-3.5 text-right text-slate-500">—</td>
                  <td className="px-5 py-3.5 text-right font-bold text-slate-900">৳{Number(invoice.amount).toFixed(2)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-2 print-avoid-break">
          {/* Notes */}
          <div className="w-full sm:max-w-md space-y-3 text-xs">
            {invoice.notes && (
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-700 block mb-0.5">Notes:</span>
                <p className="text-slate-600 leading-relaxed">{invoice.notes}</p>
              </div>
            )}
            {invoice.paymentInstructions && (
              <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-100 text-xs">
                <span className="font-bold text-emerald-900 block mb-0.5">Payment Instructions:</span>
                <p className="text-emerald-800 leading-relaxed">{invoice.paymentInstructions}</p>
              </div>
            )}
          </div>

          {/* Calculations Box */}
          <div className="w-full sm:w-80 space-y-2 text-xs bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 self-end">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-800">৳{Number(invoice.subtotal || invoice.amount).toFixed(2)}</span>
            </div>
            {Number(invoice.discountAmount) > 0 && (
              <div className="flex justify-between text-rose-600">
                <span>Discount:</span>
                <span className="font-semibold">-৳{Number(invoice.discountAmount).toFixed(2)}</span>
              </div>
            )}
            {Number(invoice.taxAmount) > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Tax / VAT:</span>
                <span className="font-semibold text-slate-800">+৳{Number(invoice.taxAmount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-slate-900 text-sm border-t border-slate-200 pt-2">
              <span>Grand Total:</span>
              <span className="text-emerald-700">৳{Number(invoice.amount).toFixed(2)}</span>
            </div>
            {Number(invoice.amountPaid) > 0 && (
              <div className="flex justify-between font-semibold text-emerald-700">
                <span>Amount Paid:</span>
                <span>৳{Number(invoice.amountPaid).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-slate-900 text-sm border-t border-slate-200 pt-2">
              <span>Balance Due:</span>
              <span className="text-slate-900">৳{Number(invoice.balanceDue).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment Link Card */}
        {paymentLink && (
          <div className="no-print print:hidden p-4 rounded-xl border bg-slate-50/80 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-bold text-slate-800 block">External Payment Link</span>
              <p className="text-slate-500 mt-0.5">
                {paymentLink.available
                  ? `Configured via active gateway: ${paymentLink.gatewayName}`
                  : paymentLink.message}
              </p>
            </div>
            {paymentLink.available && paymentLink.paymentUrl && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(paymentLink.paymentUrl);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
              >
                {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedLink ? "Link Copied" : "Copy Payment Link"}
              </button>
            )}
          </div>
        )}

        {/* Payment History */}
        {Array.isArray(invoice.payments) && invoice.payments.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-slate-100 print-avoid-break">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-600" />
              Recorded Payments
            </h3>
            <div className="border border-slate-200/80 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200/80">
                  <tr>
                    <th className="px-4 py-2.5">Date</th>
                    <th className="px-4 py-2.5">Method</th>
                    <th className="px-4 py-2.5">Reference ID</th>
                    <th className="px-4 py-2.5">Notes</th>
                    <th className="px-4 py-2.5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoice.payments.map((p) => (
                    <tr key={p.id}>
                      <td className="px-4 py-2.5 text-slate-700">{new Date(p.paymentDate).toLocaleDateString()}</td>
                      <td className="px-4 py-2.5 font-medium text-slate-800 capitalize">{p.paymentMethod.replace("_", " ")}</td>
                      <td className="px-4 py-2.5 font-mono text-slate-600">{p.referenceId || "—"}</td>
                      <td className="px-4 py-2.5 text-slate-500">{p.notes || "—"}</td>
                      <td className="px-4 py-2.5 text-right font-bold text-emerald-700">৳{p.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {paymentModalOpen && (
        <div className="no-print print:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Record Manual Payment</h3>
              <button onClick={() => setPaymentModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            {paymentError && (
              <div className="my-3 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                {paymentError}
              </div>
            )}

            <form onSubmit={handleRecordPaymentSubmit} className="space-y-4 my-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Amount Received (৳ BDT) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  max={invoice.balanceDue}
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={paymentData.paymentDate}
                    onChange={(e) => setPaymentData({ ...paymentData, paymentDate: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Method *</label>
                  <select
                    value={paymentData.paymentMethod}
                    onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  >
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer / BEFTN</option>
                    <option value="cheque">Cheque</option>
                    <option value="bkash_manual">bKash (Manual TrxID)</option>
                    <option value="nagad_manual">Nagad (Manual TrxID)</option>
                    <option value="pos_card">POS Terminal Card</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Transaction / Reference ID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. TRX-9823412 or Cheque #1234"
                  value={paymentData.referenceId}
                  onChange={(e) => setPaymentData({ ...paymentData, referenceId: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={recordingPayment}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  {recordingPayment ? "Saving..." : "Save Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {cancelModalOpen && (
        <div className="no-print print:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
              Cancel Invoice #{invoice.invoiceNumber}
            </h3>
            <p className="text-xs text-slate-600 my-3">
              Are you sure you want to cancel this invoice?
            </p>
            <form onSubmit={handleCancelInvoiceSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Reason for cancellation (optional)"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
              />
              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Keep Invoice
                </button>
                <button
                  type="submit"
                  disabled={cancelling}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl"
                >
                  {cancelling ? "Cancelling..." : "Confirm Cancel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
