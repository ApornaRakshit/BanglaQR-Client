import React from "react";
import { FileText, X } from "lucide-react";

export default function InvoicePreview({ isOpen, onClose, data }) {
  if (!isOpen || !data) return null;

  const {
    invoiceNumber = "INV-PREVIEW",
    issueDate = new Date().toISOString().split("T")[0],
    dueDate = "",
    customerName = "Customer",
    customerBusinessName = "",
    customerEmail = "",
    customerAddress = "",
    items = [],
    subtotal = 0,
    discountAmount = 0,
    taxAmount = 0,
    totalAmount = 0,
    notes = "",
    paymentInstructions = "",
  } = data;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-8">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-600" />
            <h3 className="font-bold text-slate-800 text-sm">Invoice Document Preview</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="my-6 space-y-6 text-xs">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-mono">{invoiceNumber}</h2>
              <p className="text-slate-500 mt-0.5">Issue: {issueDate} | Due: {dueDate || "Upon Receipt"}</p>
            </div>
            <span className="px-3 py-1 bg-slate-100 font-bold rounded-full text-slate-700 text-[10px] uppercase">
              Preview Mode
            </span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <span className="font-bold text-slate-700 block mb-1">Bill To:</span>
            <p className="font-semibold text-slate-900">{customerName}</p>
            {customerBusinessName && <p className="text-slate-600">{customerBusinessName}</p>}
            {customerEmail && <p className="text-slate-500">{customerEmail}</p>}
            {customerAddress && <p className="text-slate-500">{customerAddress}</p>}
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
              {items.map((it, idx) => (
                <tr key={idx}>
                  <td className="p-2.5 font-medium">{it.description || it.name || "Item"}</td>
                  <td className="p-2.5 text-right">{it.quantity || 1}</td>
                  <td className="p-2.5 text-right">৳{Number(it.unitPrice || 0).toFixed(2)}</td>
                  <td className="p-2.5 text-right font-bold">
                    ৳{Number(it.lineTotal || (it.quantity || 1) * (it.unitPrice || 0)).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <div className="w-64 space-y-1 text-right">
              <p className="text-slate-600">Subtotal: <strong>৳{Number(subtotal).toFixed(2)}</strong></p>
              {Number(discountAmount) > 0 && <p className="text-rose-600">Discount: -৳{Number(discountAmount).toFixed(2)}</p>}
              {Number(taxAmount) > 0 && <p className="text-slate-600">Tax: +৳{Number(taxAmount).toFixed(2)}</p>}
              <p className="text-base font-bold text-slate-900 border-t border-slate-100 pt-1">
                Grand Total: <span className="text-emerald-700">৳{Number(totalAmount).toFixed(2)}</span>
              </p>
            </div>
          </div>

          {(notes || paymentInstructions) && (
            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
              {notes && <p><strong>Notes:</strong> {notes}</p>}
              {paymentInstructions && <p><strong>Payment Instructions:</strong> {paymentInstructions}</p>}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}

