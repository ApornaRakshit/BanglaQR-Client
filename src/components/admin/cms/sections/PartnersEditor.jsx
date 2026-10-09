import { useState } from "react";
import { Plus, Trash2, Edit2, GripVertical, ChevronUp, ChevronDown, Check } from "lucide-react";
import CmsImageUpload from "../CmsImageUpload";
import bkashLogo from "../../../../assets/paymentLogos/bkash.png";
import nagadLogo from "../../../../assets/paymentLogos/nagad.webp";
import rocketLogo from "../../../../assets/paymentLogos/roket.webp";
import upayLogo from "../../../../assets/paymentLogos/upay.webp";
import visaLogo from "../../../../assets/paymentLogos/visa.png";
import mastercardLogo from "../../../../assets/paymentLogos/mastercard.png";

const DEFAULT_LOGOS = {
  bKash: bkashLogo,
  bkash: bkashLogo,
  "নগদ": nagadLogo,
  nagad: nagadLogo,
  "রকেট": rocketLogo,
  rocket: rocketLogo,
  upay: upayLogo,
  VISA: visaLogo,
  visa: visaLogo,
  mastercard: mastercardLogo,
};

export default function PartnersEditor({ data = {}, onChange, config }) {
  const partners = data.partners || {};
  const partnersList = partners.partnersList || [];

  const updateField = (field, value) => {
    onChange({
      ...data,
      partners: {
        ...partners,
        [field]: value,
      },
    });
  };

  const updatePartner = (index, field, value) => {
    const updated = [...partnersList];
    updated[index] = { ...updated[index], [field]: value };
    updateField("partnersList", updated);
  };

  const togglePartnerActive = (index) => {
    const updated = [...partnersList];
    updated[index] = { ...updated[index], isActive: !updated[index].isActive };
    updateField("partnersList", updated);
  };

  const addPartner = () => {
    const newPartner = {
      id: `pt-${Date.now()}`,
      name: "New Partner",
      logo: "",
      url: "https://",
      isBank: false,
      isActive: true,
      order: partnersList.length + 1,
    };
    updateField("partnersList", [...partnersList, newPartner]);
  };

  const removePartner = (index) => {
    if (window.confirm("Are you sure you want to remove this partner?")) {
      const updated = partnersList.filter((_, i) => i !== index);
      updateField("partnersList", updated);
    }
  };

  const movePartner = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= partnersList.length) return;
    const updated = [...partnersList];
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;
    updateField("partnersList", updated);
  };

  return (
    <div className="space-y-6">
      {/* Section Header Settings */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          সেকশন শিরোনাম ও সাব-শিরোনাম
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700">পার্টনার সেকশন শিরোনাম</label>
            <input
              type="text"
              value={partners.heading || ""}
              onChange={(e) => updateField("heading", e.target.value)}
              placeholder="আমাদের পেমেন্ট পার্টনারসমূহ"
              className="mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Main Partners Table Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Manage partner logos</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Add, edit, remove or reorder payment partner logos. Only active partners will be shown on the website.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500">
              {partnersList.length} partners
            </span>
            <button
              type="button"
              onClick={addPartner}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#00875a] px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#00704a] transition"
            >
              <Plus size={14} />
              <span>Add partner</span>
            </button>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto rounded-xl border border-slate-200/80">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4 w-24">LOGO</th>
                <th className="py-3 px-4 min-w-[180px]">PARTNER NAME</th>
                <th className="py-3 px-4 min-w-[240px]">LINK (OPTIONAL)</th>
                <th className="py-3 px-4 w-28 text-center">STATUS</th>
                <th className="py-3 px-4 w-28 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {partnersList.map((pt, idx) => (
                <tr key={pt.id || idx} className="hover:bg-slate-50/50 transition">
                  <td className="py-3 px-4 text-center font-bold text-slate-600">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-4">
                    <CmsImageUpload
                      compact
                      value={pt.logo}
                      fallbackImage={DEFAULT_LOGOS[pt.name]}
                      onChange={(url) => updatePartner(idx, "logo", url)}
                    />
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="text"
                      value={pt.name || ""}
                      onChange={(e) => updatePartner(idx, "name", e.target.value)}
                      placeholder="e.g. bKash"
                      className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="text"
                      value={pt.url || ""}
                      onChange={(e) => updatePartner(idx, "url", e.target.value)}
                      placeholder="https://..."
                      className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => togglePartnerActive(idx)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
                        pt.isActive !== false
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-400 border border-slate-200"
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          pt.isActive !== false ? "bg-emerald-500" : "bg-slate-400"
                        }`}
                      />
                      <span>{pt.isActive !== false ? "Active" : "Inactive"}</span>
                    </button>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => movePartner(idx, -1)}
                        disabled={idx === 0}
                        className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                        title="Move Up"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => movePartner(idx, 1)}
                        disabled={idx === partnersList.length - 1}
                        className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                        title="Move Down"
                      >
                        <ChevronDown size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removePartner(idx)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {partnersList.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No partner logos configured yet. Click "Add partner" to add one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
