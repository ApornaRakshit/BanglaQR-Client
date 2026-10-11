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
  Download,
  FileText,
  CreditCard,
  History,
  AlertCircle,
  Users,
} from "lucide-react";
import { adminApi } from "../../../services/adminApi";
import logoImg from "../../../assets/logo.jpg";

export default function InvoiceDetails() {
  const params = useParams();
  const invoiceId = params.invoiceId || params.id;

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const fetchInvoice = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminApi.getInvoice(invoiceId);
      const inv = res?.data?.invoice || res?.data?.data || res?.data || res?.invoice;
      setInvoice(inv || null);
    } catch (err) {
      console.error("Failed to load admin invoice:", err);
      setError(err?.response?.data?.message || "Invoice not found or unauthorized.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (invoiceId) fetchInvoice();
  }, [invoiceId]);

  const handleDownloadPdf = async () => {
    try {
      setDownloadingPdf(true);
      const res = await adminApi.getInvoicePdfBlob(invoiceId);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      const invNum = invoice?.invoiceNumber || invoice?.invoice_number || invoiceId;
      link.href = url;
      link.setAttribute("download", `Invoice-${invNum}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF download failed:", err);
      alert("Failed to download PDF document.");
    } finally {
      setDownloadingPdf(false);
    }
  };

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
    return (
      <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="h-8 w-8 text-emerald-600 animate-spin" />
        <p className="font-semibold text-sm">Loading invoice document from MySQL...</p>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="p-8 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-900 text-center space-y-3 max-w-xl mx-auto my-12">
        <AlertCircle size={36} className="text-red-500 mx-auto" />
        <p className="text-red-600 dark:text-red-400 font-semibold">{error || "Invoice not found"}</p>
        <p className="text-xs text-slate-500">Record ID #{invoiceId} could not be resolved in the database.</p>
        <Link
          to="/admin/invoices"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold"
        >
          <ArrowLeft size={16} /> Back to Invoices
        </Link>
      </div>
    );
  }

  const invNumber = invoice.invoiceNumber || invoice.invoice_number || `INV-${invoice.id}`;
  const merchantName =
    invoice.companyName ||
    invoice.company_name ||
    invoice.merchant?.companyName ||
    (invoice.merchantId ? `Merchant #${invoice.merchantId}` : "Merchant information unavailable");
  const merchantCode = invoice.merchantCode || invoice.merchant_code || "—";
  const merchantEmail = invoice.merchantEmail || invoice.merchant_email || invoice.merchant?.email || "—";
  const merchantPhone = invoice.merchantPhone || invoice.merchant_phone || invoice.merchant?.phone || "—";
  const merchantAddress = invoice.merchant?.address || "—";

  const customerName = invoice.customerName || invoice.customer_name || "—";
  const customerBusiness = invoice.customerBusinessName || invoice.customer_business_name;
  const customerEmail = invoice.customerEmail || invoice.customer_email || "—";
  const customerPhone = invoice.customerPhone || invoice.customer_phone || "—";
  const customerAddress = invoice.customerAddress || invoice.customer_address;

  const issueDateVal = invoice.issueDate || invoice.issue_date || invoice.createdAt || invoice.created_at;
  const dueDateVal = invoice.dueDate || invoice.due_date;

  const rawItems = Array.isArray(invoice.items) ? invoice.items : [];
  const subtotalVal = Number(invoice.subtotal ?? invoice.amount ?? 0);
  const discountVal = Number(invoice.discountAmount ?? invoice.discount_amount ?? 0);
  const taxVal = Number(invoice.taxAmount ?? invoice.tax_amount ?? 0);
  const totalVal = Number(invoice.grandTotal ?? invoice.totalAmount ?? invoice.amount ?? 0);
  const amountPaidVal = Number(invoice.amountPaid ?? invoice.amount_paid ?? 0);
  const balanceDueVal = Number(invoice.balanceDue ?? invoice.balance_due ?? totalVal);

  return (
    <div className="printable-invoice-container max-w-4xl mx-auto space-y-6 pb-12 print:space-y-0 print:pb-0">
      {/* Top Nav */}
      <div className="flex items-center justify-between no-print print:hidden">
        <Link
          to="/admin/invoices"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition"
        >
          <ArrowLeft size={16} /> Back to Invoices
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-sm transition disabled:opacity-50"
          >
            <Download size={14} className={downloadingPdf ? "animate-spin" : ""} />
            {downloadingPdf ? "Generating..." : "Download PDF"}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 shadow-sm"
          >
            <Printer size={14} /> Print
          </button>
          {invoice.status !== "paid" && (
            <button
              onClick={() => handleStatusChange("paid")}
              disabled={updating}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold shadow-sm"
            >
              Mark Paid
            </button>
          )}
        </div>
      </div>

      {/* Invoice Card */}
      <div className="printable-invoice-document bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 shadow-sm space-y-8 print:p-0 print:space-y-6 print:border-none print:shadow-none print:bg-white print:dark:bg-white">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-200 dark:border-slate-700 pb-6 gap-4 print:pb-4">
          <div className="flex items-start gap-4">
            <img
              src={invoice.merchant?.logoUrl || invoice.logoUrl || logoImg}
              alt={merchantName}
              className="h-12 w-auto max-w-[120px] object-contain rounded-lg border border-slate-100 dark:border-slate-700 p-1 bg-white print:border-none print:p-0"
            />
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 block">
                {merchantName}
              </span>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono">
                {invNumber}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Internal ID: #{invoice.id} • Merchant Code: {merchantCode}
              </p>
            </div>
          </div>
          <div className="text-right sm:self-auto self-start space-y-1.5">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase ${
                invoice.status === "paid"
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                  : invoice.status === "overdue"
                  ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                  : invoice.status === "sent"
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
                  : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
              }`}
            >
              {invoice.status === "paid" ? <CheckCircle size={12} /> : <Clock size={12} />}
              {String(invoice.status || "draft").replace("_", " ")}
            </span>
            <div className="text-xs text-slate-500 space-y-0.5 pt-1">
              <p>Issue Date: <strong>{issueDateVal ? new Date(issueDateVal).toLocaleDateString() : "—"}</strong></p>
              <p>Due Date: <strong>{dueDateVal ? new Date(dueDateVal).toLocaleDateString() : "Not set"}</strong></p>
            </div>
          </div>
        </div>

        {/* Addresses: Merchant & Customer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs bg-slate-50 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-700">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Issuing Merchant
            </span>
            <p className="font-bold text-slate-900 dark:text-white text-sm">{merchantName}</p>
            <p className="text-slate-500 mt-0.5">Code: {merchantCode}</p>
            <p className="text-slate-500">Email: {merchantEmail}</p>
            <p className="text-slate-500">Phone: {merchantPhone}</p>
            {merchantAddress && merchantAddress !== "—" && (
              <p className="text-slate-500 mt-1">{merchantAddress}</p>
            )}
          </div>

          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Billed Customer
            </span>
            <p className="font-bold text-slate-900 dark:text-white text-sm">{customerName}</p>
            {customerBusiness && (
              <p className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5">{customerBusiness}</p>
            )}
            <p className="text-slate-500 mt-0.5">Email: {customerEmail}</p>
            <p className="text-slate-500">Phone: {customerPhone}</p>
            {customerAddress && (
              <p className="text-slate-500 mt-1">{customerAddress}</p>
            )}
          </div>
        </div>

        {/* Line Items */}
        <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 text-[11px] uppercase font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3.5">Item Description</th>
                <th className="p-3.5 text-right">Quantity</th>
                <th className="p-3.5 text-right">Unit Price</th>
                <th className="p-3.5 text-right">Disc. %</th>
                <th className="p-3.5 text-right">Tax %</th>
                <th className="p-3.5 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {rawItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-slate-400">
                    No item lines recorded. Base invoice total applies.
                  </td>
                </tr>
              ) : (
                rawItems.map((it, idx) => {
                  const qty = Number(it.quantity || 1);
                  const unitPrice = Number(it.unitPrice ?? it.unit_price ?? 0);
                  const disc = Number(it.discountPercent ?? it.discount_percent ?? 0);
                  const tax = Number(it.taxPercent ?? it.tax_percent ?? 0);
                  const base = qty * unitPrice;
                  const discAmt = base * (disc / 100);
                  const taxAmt = (base - discAmt) * (tax / 100);
                  const lineTotal = Number(it.lineTotal ?? it.line_total ?? (base - discAmt + taxAmt));

                  return (
                    <tr key={idx}>
                      <td className="p-3.5 font-medium text-slate-900 dark:text-white">
                        {it.description || it.name || "Item Line"}
                      </td>
                      <td className="p-3.5 text-right text-slate-500">{qty}</td>
                      <td className="p-3.5 text-right text-slate-700 dark:text-slate-300">
                        ৳{unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3.5 text-right text-slate-500">{disc}%</td>
                      <td className="p-3.5 text-right text-slate-500">{tax}%</td>
                      <td className="p-3.5 text-right font-bold text-slate-900 dark:text-white">
                        ৳{lineTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Total Summary */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-2 print-avoid-break">
          {/* Notes & Payment Instructions */}
          <div className="w-full sm:max-w-md space-y-3 text-xs">
            {invoice.notes && (
              <div className="p-3.5 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-700">
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">Notes:</span>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{invoice.notes}</p>
              </div>
            )}
            {(invoice.paymentInstructions || invoice.payment_instructions) && (
              <div className="p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
                <span className="font-bold text-emerald-900 dark:text-emerald-300 block mb-0.5">Payment Instructions:</span>
                <p className="text-emerald-800 dark:text-emerald-400 leading-relaxed">
                  {invoice.paymentInstructions || invoice.payment_instructions}
                </p>
              </div>
            )}
          </div>

          <div className="w-full sm:w-72 space-y-2 text-xs bg-slate-50 dark:bg-slate-900/30 p-4 rounded-xl border border-slate-100 dark:border-slate-700 sm:self-end">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                ৳{subtotalVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            {discountVal > 0 && (
              <div className="flex justify-between text-rose-600">
                <span>Discount:</span>
                <span className="font-semibold">-৳{discountVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            {taxVal > 0 && (
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Tax / VAT:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  +৳{taxVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-700 pt-2">
              <span>Grand Total:</span>
              <span className="text-emerald-600">
                ৳{totalVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            {amountPaidVal > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Amount Paid:</span>
                <span className="font-semibold">৳{amountPaidVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-700 pt-2">
              <span>Balance Due:</span>
              <span className={balanceDueVal > 0 ? "text-amber-600" : "text-emerald-600"}>
                ৳{balanceDueVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Payments Section */}
        {invoice.payments && invoice.payments.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700 print-avoid-break">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <CreditCard size={14} className="text-emerald-600" />
              Recorded Payments & References
            </h3>
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-bold">
                  <tr>
                    <th className="p-3">Payment Date</th>
                    <th className="p-3">Method</th>
                    <th className="p-3">Reference ID</th>
                    <th className="p-3">Verification</th>
                    <th className="p-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {invoice.payments.map((p) => (
                    <tr key={p.id}>
                      <td className="p-3 text-slate-600 dark:text-slate-300">
                        {p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : "—"}
                      </td>
                      <td className="p-3 font-semibold capitalize text-slate-800 dark:text-slate-200">
                        {p.paymentMethod || "manual"}
                      </td>
                      <td className="p-3 font-mono text-slate-500">{p.referenceId || "—"}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.isGatewayVerified ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"}`}>
                          {p.isGatewayVerified ? "Gateway Verified" : "Manual Record"}
                        </span>
                      </td>
                      <td className="p-3 text-right font-bold text-slate-900 dark:text-white">
                        ৳{Number(p.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
