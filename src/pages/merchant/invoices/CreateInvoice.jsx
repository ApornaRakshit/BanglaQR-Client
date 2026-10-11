import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  FileText,
  Plus,
  Trash2,
  Copy,
  Save,
  Send,
  Eye,
  CheckCircle2,
  AlertCircle,
  Users,
  CreditCard,
  Building2,
  Calendar,
  X,
} from "lucide-react";
import { merchantApi } from "../../../services/merchantApi";

export default function CreateInvoice({ isEdit = false }) {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Customer List
  const [customers, setCustomers] = useState([]);
  const [isNewCustomer, setIsNewCustomer] = useState(false);

  // Invoice Form State
  const [formData, setFormData] = useState({
    invoiceNumber: "",
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
    currency: "BDT",
    poNumber: "",
    referenceNumber: "",

    // Customer
    customerId: "",
    customerName: "",
    customerBusinessName: "",
    customerEmail: "",
    customerPhone: "",
    customerAddress: "",
    saveCustomer: false,

    // Items
    items: [
      {
        description: "BanglaQR Digital Payment Integration Service",
        quantity: 1,
        unitPrice: 2500,
        discountPercent: 0,
        taxPercent: 0,
      },
    ],

    // Notes
    notes: "Thank you for partnering with us.",
    paymentInstructions: "Pay via BanglaQR interoperable QR code or bank transfer.",
    termsConditions: "Payment is due within 7 days of invoice issue date.",
    footerMessage: "Generated digitally via BanglaQR Merchant Services.",
  });

  // Preview Modal
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  // 1. Fetch Next Invoice Number & Customers
  useEffect(() => {
    async function init() {
      try {
        const [custRes, numRes] = await Promise.all([
          merchantApi.getInvoiceCustomers(),
          !isEdit ? merchantApi.getNextInvoiceNumber() : Promise.resolve({ data: {} }),
        ]);

        setCustomers(custRes.data || []);

        if (!isEdit && numRes.data?.invoiceNumber) {
          setFormData((prev) => ({
            ...prev,
            invoiceNumber: numRes.data.invoiceNumber,
          }));
        }

        // If Edit mode, load existing invoice
        if (isEdit && id) {
          setLoading(true);
          const invRes = await merchantApi.getInvoiceById(id);
          const inv = invRes.data;
          setFormData({
            invoiceNumber: inv.invoiceNumber,
            issueDate: inv.issueDate ? inv.issueDate.split("T")[0] : "",
            dueDate: inv.dueDate ? inv.dueDate.split("T")[0] : "",
            currency: inv.currency || "BDT",
            poNumber: inv.poNumber || "",
            referenceNumber: inv.referenceNumber || "",
            customerId: inv.customerId || "",
            customerName: inv.customerName || "",
            customerBusinessName: inv.customerBusinessName || "",
            customerEmail: inv.customerEmail || "",
            customerPhone: inv.customerPhone || "",
            customerAddress: inv.customerAddress || "",
            saveCustomer: false,
            items: inv.items?.length
              ? inv.items
              : [{ description: "", quantity: 1, unitPrice: 0, discountPercent: 0, taxPercent: 0 }],
            notes: inv.notes || "",
            paymentInstructions: inv.paymentInstructions || "",
            termsConditions: inv.termsConditions || "",
            footerMessage: inv.footerMessage || "",
          });
          setLoading(false);
        }
      } catch (err) {
        console.error("Initialization error:", err);
      }
    }
    init();
  }, [id, isEdit]);

  // Handle Customer Selection
  const handleSelectCustomer = (e) => {
    const val = e.target.value;
    if (val === "new") {
      setIsNewCustomer(true);
      setFormData((prev) => ({
        ...prev,
        customerId: "",
        customerName: "",
        customerBusinessName: "",
        customerEmail: "",
        customerPhone: "",
        customerAddress: "",
      }));
    } else {
      setIsNewCustomer(false);
      const found = customers.find((c) => String(c.id) === String(val));
      if (found) {
        setFormData((prev) => ({
          ...prev,
          customerId: found.id,
          customerName: found.name,
          customerBusinessName: found.businessName || "",
          customerEmail: found.email || "",
          customerPhone: found.phone || "",
          customerAddress: found.billingAddress || "",
        }));
      } else {
        setFormData((prev) => ({ ...prev, customerId: "" }));
      }
    }
  };

  // Line Item Handlers
  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { description: "", quantity: 1, unitPrice: 0, discountPercent: 0, taxPercent: 0 },
      ],
    }));
  };

  const handleDuplicateItem = (index) => {
    const target = formData.items[index];
    const newItems = [...formData.items];
    newItems.splice(index + 1, 0, { ...target });
    setFormData((prev) => ({ ...prev, items: newItems }));
  };

  const handleRemoveItem = (index) => {
    if (formData.items.length === 1) return;
    const newItems = [...formData.items];
    newItems.splice(index, 1);
    setFormData((prev) => ({ ...prev, items: newItems }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData((prev) => ({ ...prev, items: newItems }));
  };

  // Calculations
  const calculatedItems = formData.items.map((item) => {
    const qty = Math.max(1, Number(item.quantity || 1));
    const price = Math.max(0, Number(item.unitPrice || 0));
    const sub = qty * price;
    const disc = (sub * Math.max(0, Number(item.discountPercent || 0))) / 100;
    const tax = ((sub - disc) * Math.max(0, Number(item.taxPercent || 0))) / 100;
    const total = Math.max(0, sub - disc + tax);
    return { ...item, lineSubtotal: sub, lineDiscount: disc, lineTax: tax, lineTotal: total };
  });

  const subtotal = calculatedItems.reduce((acc, it) => acc + it.lineSubtotal, 0);
  const totalDiscount = calculatedItems.reduce((acc, it) => acc + it.lineDiscount, 0);
  const totalTax = calculatedItems.reduce((acc, it) => acc + it.lineTax, 0);
  const grandTotal = Math.max(0, subtotal - totalDiscount + totalTax);

  // Submit Handler
  const handleSubmit = async (e, sendNow = false) => {
    if (e) e.preventDefault();

    if (!formData.customerName) {
      setError("Please specify a customer name");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccessMsg(null);

      const payload = {
        ...formData,
        sendNow,
        items: calculatedItems.map((it) => ({
          description: it.description || "Service Item",
          quantity: Number(it.quantity || 1),
          unitPrice: Number(it.unitPrice || 0),
          discountPercent: Number(it.discountPercent || 0),
          taxPercent: Number(it.taxPercent || 0),
        })),
        subtotal,
        discountAmount: totalDiscount,
        taxAmount: totalTax,
        amount: grandTotal,
        totalAmount: grandTotal,
      };

      if (isEdit) {
        await merchantApi.updateInvoice(id, payload);
      } else {
        await merchantApi.createInvoice(payload);
      }

      navigate("/merchant/invoices");
    } catch (err) {
      console.error("Save invoice failed:", err);
      setError(err.response?.data?.message || "Failed to save invoice. Please check all required fields.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
        <p className="text-xs font-semibold text-slate-600">Loading invoice data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Back Link */}
      <div>
        <Link
          to="/merchant/invoices"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Invoices
        </Link>
      </div>

      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {isEdit ? `Edit Draft Invoice #${formData.invoiceNumber}` : "Create New Customer Invoice"}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter customer details, line items, and terms to generate an authenticated invoice
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPreviewModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
          >
            <Eye className="h-4 w-4" />
            Preview
          </button>
        </div>
      </div>

      {/* Error / Success Alerts */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2.5">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
        {/* SECTION A: INVOICE INFORMATION */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-emerald-600" />
              Section A: Invoice Information
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Invoice Number *</label>
              <input
                type="text"
                required
                value={formData.invoiceNumber}
                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Issue Date *</label>
              <input
                type="date"
                required
                value={formData.issueDate}
                onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Due Date *</label>
              <input
                type="date"
                required
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Currency</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                <option value="BDT">BDT (৳ Bangladeshi Taka)</option>
                <option value="USD">USD ($ US Dollar)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">P.O. Number (Optional)</label>
              <input
                type="text"
                placeholder="e.g. PO-84920"
                value={formData.poNumber}
                onChange={(e) => setFormData({ ...formData, poNumber: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Reference / Order ID (Optional)</label>
              <input
                type="text"
                placeholder="e.g. ORD-2026-99"
                value={formData.referenceNumber}
                onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* SECTION B: CUSTOMER INFORMATION */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="h-4 w-4 text-emerald-600" />
              Section B: Customer Selection
            </h2>
            <Link
              to="/merchant/invoice-customers"
              className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700"
            >
              Customer Directory →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Select from Customer Book</label>
              <select
                value={isNewCustomer ? "new" : formData.customerId || ""}
                onChange={handleSelectCustomer}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                <option value="">— Choose Existing Customer —</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.businessName ? `(${c.businessName})` : ""}
                  </option>
                ))}
                <option value="new">+ Add / Input New Customer</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Customer Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Mahbubul Alam"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Customer Email Address</label>
              <input
                type="email"
                placeholder="e.g. mahbub@example.com"
                value={formData.customerEmail}
                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Customer Phone Number</label>
              <input
                type="tel"
                placeholder="e.g. 01700000000"
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Customer Business / Org Name (Optional)</label>
              <input
                type="text"
                placeholder="e.g. TechCorp Bangladesh Ltd."
                value={formData.customerBusinessName}
                onChange={(e) => setFormData({ ...formData, customerBusinessName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Billing Address</label>
              <textarea
                rows={2}
                placeholder="Street address, City, Postal Code"
                value={formData.customerAddress}
                onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          {!formData.customerId && (
            <div className="pt-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="saveCust"
                checked={formData.saveCustomer}
                onChange={(e) => setFormData({ ...formData, saveCustomer: e.target.checked })}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="saveCust" className="text-xs text-slate-600 select-none">
                Save customer details to customer book for future invoices
              </label>
            </div>
          )}
        </div>

        {/* SECTION C: INVOICE ITEMS */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-emerald-600" />
              Section C: Line Items
            </h2>
            <button
              type="button"
              onClick={handleAddItem}
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Another Item
            </button>
          </div>

          <div className="space-y-3">
            {formData.items.map((item, index) => {
              const qty = Math.max(1, Number(item.quantity || 1));
              const price = Math.max(0, Number(item.unitPrice || 0));
              const lineSub = qty * price;
              const disc = (lineSub * Math.max(0, Number(item.discountPercent || 0))) / 100;
              const tax = ((lineSub - disc) * Math.max(0, Number(item.taxPercent || 0))) / 100;
              const lineTot = Math.max(0, lineSub - disc + tax);

              return (
                <div
                  key={index}
                  className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl grid grid-cols-12 gap-3 items-center"
                >
                  <div className="col-span-12 md:col-span-5">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Item Description *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Product or service name..."
                      value={item.description}
                      onChange={(e) => handleItemChange(index, "description", e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  <div className="col-span-4 md:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Qty
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 text-right focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  <div className="col-span-4 md:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Unit Price (৳)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, "unitPrice", e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 text-right focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  <div className="col-span-4 md:col-span-1">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Disc %
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={item.discountPercent}
                      onChange={(e) => handleItemChange(index, "discountPercent", e.target.value)}
                      className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 text-right focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  <div className="col-span-9 md:col-span-1 text-right">
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Total
                    </label>
                    <span className="font-bold text-slate-900 text-xs block py-2">
                      ৳{lineTot.toFixed(2)}
                    </span>
                  </div>

                  <div className="col-span-3 md:col-span-1 flex items-center justify-end gap-1 pt-4 md:pt-0">
                    <button
                      type="button"
                      onClick={() => handleDuplicateItem(index)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md"
                      title="Duplicate"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      disabled={formData.items.length === 1}
                      className="p-1.5 text-slate-400 hover:text-rose-600 disabled:opacity-30 rounded-md"
                      title="Remove"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* SECTION D: TOTALS SUMMARY */}
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <div className="w-full sm:w-80 space-y-2 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-800">৳{subtotal.toFixed(2)}</span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Total Discount:</span>
                  <span className="font-semibold">-৳{totalDiscount.toFixed(2)}</span>
                </div>
              )}
              {totalTax > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Tax / VAT:</span>
                  <span className="font-semibold text-slate-800">+৳{totalTax.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-slate-900 text-sm border-t border-slate-200 pt-2">
                <span>Grand Total:</span>
                <span className="text-emerald-700">৳{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION E: NOTES & TERMS */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="h-4 w-4 text-emerald-600" />
              Section E: Notes & Payment Terms
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Customer-Facing Notes</label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Payment Instructions</label>
              <textarea
                rows={2}
                value={formData.paymentInstructions}
                onChange={(e) => setFormData({ ...formData, paymentInstructions: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Terms & Conditions</label>
              <textarea
                rows={2}
                value={formData.termsConditions}
                onChange={(e) => setFormData({ ...formData, termsConditions: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Footer Message</label>
              <textarea
                rows={2}
                value={formData.footerMessage}
                onChange={(e) => setFormData({ ...formData, footerMessage: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* SECTION F: ACTIONS */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link
            to="/merchant/invoices"
            className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Cancel
          </Link>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => setPreviewModalOpen(true)}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors"
            >
              Preview Invoice
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving Draft..." : "Save Draft"}
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={(e) => handleSubmit(e, true)}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm shadow-emerald-600/20 transition-all"
            >
              <Send className="h-4 w-4" />
              {saving ? "Processing..." : "Save & Send to Customer"}
            </button>
          </div>
        </div>
      </form>

      {/* PREVIEW MODAL */}
      {previewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Invoice Preview
              </span>
              <button
                onClick={() => setPreviewModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="my-6 space-y-6 text-xs">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{formData.invoiceNumber || "INV-PREVIEW"}</h2>
                  <p className="text-slate-500 mt-0.5">Issue: {formData.issueDate} | Due: {formData.dueDate}</p>
                </div>
                <span className="px-3 py-1 bg-slate-100 font-bold rounded-full text-slate-700 text-[10px] uppercase">
                  Draft Preview
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-700 block mb-1">Bill To:</span>
                <p className="font-semibold text-slate-900">{formData.customerName || "Customer Name"}</p>
                {formData.customerBusinessName && <p className="text-slate-600">{formData.customerBusinessName}</p>}
                {formData.customerEmail && <p className="text-slate-500">{formData.customerEmail}</p>}
                {formData.customerAddress && <p className="text-slate-500">{formData.customerAddress}</p>}
              </div>

              <table className="w-full text-left">
                <thead className="bg-slate-100 font-bold text-slate-700">
                  <tr>
                    <th className="p-2.5">Item</th>
                    <th className="p-2.5 text-right">Qty</th>
                    <th className="p-2.5 text-right">Price</th>
                    <th className="p-2.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {calculatedItems.map((it, idx) => (
                    <tr key={idx}>
                      <td className="p-2.5 font-medium">{it.description || "Item"}</td>
                      <td className="p-2.5 text-right">{it.quantity}</td>
                      <td className="p-2.5 text-right">৳{Number(it.unitPrice).toFixed(2)}</td>
                      <td className="p-2.5 text-right font-bold">৳{it.lineTotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <div className="w-64 space-y-1 text-right">
                  <p className="text-slate-600">Subtotal: <strong>৳{subtotal.toFixed(2)}</strong></p>
                  {totalDiscount > 0 && <p className="text-rose-600">Discount: -৳{totalDiscount.toFixed(2)}</p>}
                  <p className="text-base font-bold text-slate-900 border-t border-slate-100 pt-1">
                    Grand Total: <span className="text-emerald-700">৳{grandTotal.toFixed(2)}</span>
                  </p>
                </div>
              </div>

              {(formData.notes || formData.paymentInstructions) && (
                <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                  {formData.notes && <p><strong>Notes:</strong> {formData.notes}</p>}
                  {formData.paymentInstructions && <p><strong>Payment Instructions:</strong> {formData.paymentInstructions}</p>}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setPreviewModalOpen(false)}
                className="px-5 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
