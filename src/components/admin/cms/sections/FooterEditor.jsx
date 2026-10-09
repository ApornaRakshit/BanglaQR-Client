import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import CmsImageUpload from "../CmsImageUpload";

export default function FooterEditor({ data = {}, onChange }) {
  const footer = data.footer || {};
  const quickLinks = footer.quickLinks || [];
  const supportLinks = footer.supportLinks || [];

  const updateField = (field, value) => {
    onChange({
      ...data,
      footer: {
        ...footer,
        [field]: value,
      },
    });
  };

  const updateLinkList = (listKey, index, field, value) => {
    const updated = [...(footer[listKey] || [])];
    updated[index] = { ...updated[index], [field]: value };
    updateField(listKey, updated);
  };

  const toggleLinkActive = (listKey, index) => {
    const updated = [...(footer[listKey] || [])];
    updated[index] = { ...updated[index], isActive: !updated[index].isActive };
    updateField(listKey, updated);
  };

  const addLinkItem = (listKey, defaultLabel = "নতুন লিংক", defaultHref = "#") => {
    const newId = `${listKey.charAt(0)}l-${Date.now()}`;
    const newItems = [
      ...(footer[listKey] || []),
      {
        id: newId,
        label: defaultLabel,
        href: defaultHref,
        isActive: true,
        order: (footer[listKey]?.length || 0) + 1,
      },
    ];
    updateField(listKey, newItems);
  };

  const removeLinkItem = (listKey, index) => {
    if (window.confirm("Are you sure you want to remove this link?")) {
      const updated = (footer[listKey] || []).filter((_, i) => i !== index);
      updateField(listKey, updated);
    }
  };

  const moveLinkItem = (listKey, index, direction) => {
    const list = footer[listKey] || [];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= list.length) return;
    const updated = [...list];
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;
    updateField(listKey, updated);
  };

  return (
    <div className="space-y-6">
      {/* 1. Brand & Contact Information */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          ফুটার ব্র্যান্ড ও পরিচিতি
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">ব্র্যান্ডের নাম</label>
              <input
                type="text"
                value={footer.brandName || ""}
                onChange={(e) => updateField("brandName", e.target.value)}
                placeholder="BanglaQR"
                className="mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">কপিরাইট নোটিশ</label>
              <input
                type="text"
                value={footer.copyrightText || ""}
                onChange={(e) => updateField("copyrightText", e.target.value)}
                placeholder="© 2026 BanglaQR. সর্বস্বত্ব সংরক্ষিত।"
                className="mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">ফুটার সংক্ষিপ্ত বিবরণ</label>
            <textarea
              rows={2}
              value={footer.description || ""}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="বাংলাদেশের ব্যবসায়ীদের জন্য একটি সহজ ও সংগঠিত ডিজিটাল পেমেন্ট সার্ভিস ম্যানেজমেন্ট প্ল্যাটফর্ম।"
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-2">
            <CmsImageUpload
              label="ফুটার লোগো (ঐচ্ছিক)"
              value={footer.logo || ""}
              onChange={(url) => updateField("logo", url)}
            />
          </div>
        </div>
      </div>

      {/* 2. Contact Details */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          যোগাযোগের তথ্য
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700">ঠিকানা</label>
            <input
              type="text"
              value={footer.contactAddress || ""}
              onChange={(e) => updateField("contactAddress", e.target.value)}
              placeholder="ঢাকা, বাংলাদেশ"
              className="mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">ইমেইল</label>
            <input
              type="text"
              value={footer.contactEmail || ""}
              onChange={(e) => updateField("contactEmail", e.target.value)}
              placeholder="support@banglaqr.com"
              className="mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">ফোন নম্বর</label>
            <input
              type="text"
              value={footer.contactPhone || ""}
              onChange={(e) => updateField("contactPhone", e.target.value)}
              placeholder="+880 1234 567890"
              className="mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* 3. Quick Links Table */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Manage quick links</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Links displayed under the primary navigation column in footer.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500">
              {quickLinks.length} links
            </span>
            <button
              type="button"
              onClick={() => addLinkItem("quickLinks", "নতুন কুইক লিংক", "#section")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#00875a] px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#00704a] transition"
            >
              <Plus size={14} />
              <span>Add quick link</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200/80">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4 min-w-[200px]">LINK LABEL</th>
                <th className="py-3 px-4 min-w-[240px]">DESTINATION URL</th>
                <th className="py-3 px-4 w-28 text-center">STATUS</th>
                <th className="py-3 px-4 w-28 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {quickLinks.map((lnk, idx) => (
                <tr key={lnk.id || idx} className="hover:bg-slate-50/50 transition">
                  <td className="py-3 px-4 text-center font-bold text-slate-600">{idx + 1}</td>
                  <td className="py-3 px-4">
                    <input
                      type="text"
                      value={lnk.label || ""}
                      onChange={(e) => updateLinkList("quickLinks", idx, "label", e.target.value)}
                      placeholder="লিংক লেবেল"
                      className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 font-bold focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="text"
                      value={lnk.href || ""}
                      onChange={(e) => updateLinkList("quickLinks", idx, "href", e.target.value)}
                      placeholder="#section বা /url"
                      className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => toggleLinkActive("quickLinks", idx)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
                        lnk.isActive !== false
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-400 border border-slate-200"
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          lnk.isActive !== false ? "bg-emerald-500" : "bg-slate-400"
                        }`}
                      />
                      <span>{lnk.isActive !== false ? "Active" : "Inactive"}</span>
                    </button>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveLinkItem("quickLinks", idx, -1)}
                        disabled={idx === 0}
                        className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                        title="Move Up"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveLinkItem("quickLinks", idx, 1)}
                        disabled={idx === quickLinks.length - 1}
                        className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                        title="Move Down"
                      >
                        <ChevronDown size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeLinkItem("quickLinks", idx)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Support Links Table */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Manage support links</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Help desk, contact, privacy and terms links in footer.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500">
              {supportLinks.length} links
            </span>
            <button
              type="button"
              onClick={() => addLinkItem("supportLinks", "নতুন সাপোর্ট লিংক", "#support")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#00875a] px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#00704a] transition"
            >
              <Plus size={14} />
              <span>Add support link</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200/80">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4 min-w-[200px]">LINK LABEL</th>
                <th className="py-3 px-4 min-w-[240px]">DESTINATION URL</th>
                <th className="py-3 px-4 w-28 text-center">STATUS</th>
                <th className="py-3 px-4 w-28 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {supportLinks.map((lnk, idx) => (
                <tr key={lnk.id || idx} className="hover:bg-slate-50/50 transition">
                  <td className="py-3 px-4 text-center font-bold text-slate-600">{idx + 1}</td>
                  <td className="py-3 px-4">
                    <input
                      type="text"
                      value={lnk.label || ""}
                      onChange={(e) => updateLinkList("supportLinks", idx, "label", e.target.value)}
                      placeholder="লিংক লেবেল"
                      className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 font-bold focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="text"
                      value={lnk.href || ""}
                      onChange={(e) => updateLinkList("supportLinks", idx, "href", e.target.value)}
                      placeholder="#support বা /privacy"
                      className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => toggleLinkActive("supportLinks", idx)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
                        lnk.isActive !== false
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-400 border border-slate-200"
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          lnk.isActive !== false ? "bg-emerald-500" : "bg-slate-400"
                        }`}
                      />
                      <span>{lnk.isActive !== false ? "Active" : "Inactive"}</span>
                    </button>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveLinkItem("supportLinks", idx, -1)}
                        disabled={idx === 0}
                        className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                        title="Move Up"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveLinkItem("supportLinks", idx, 1)}
                        disabled={idx === supportLinks.length - 1}
                        className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                        title="Move Down"
                      >
                        <ChevronDown size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeLinkItem("supportLinks", idx)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
