import { useState } from "react";
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import CmsImageUpload from "../CmsImageUpload";
import logoImg from "../../../../assets/logo.jpg";

export default function NavbarEditor({ data = {}, onChange }) {
  const navbar = data.navbar || {};
  const menuItems = navbar.menuItems || [];

  const updateField = (field, value) => {
    onChange({
      ...data,
      navbar: {
        ...navbar,
        [field]: value,
      },
    });
  };

  const updateMenuItem = (index, field, value) => {
    const updated = [...menuItems];
    updated[index] = { ...updated[index], [field]: value };
    updateField("menuItems", updated);
  };

  const toggleMenuItemActive = (index) => {
    const updated = [...menuItems];
    updated[index] = { ...updated[index], isActive: !updated[index].isActive };
    updateField("menuItems", updated);
  };

  const addMenuItem = () => {
    const newItems = [
      ...menuItems,
      {
        id: `nav-${Date.now()}`,
        label: "নতুন মেনু",
        href: "#section",
        isActive: true,
        order: menuItems.length + 1,
      },
    ];
    updateField("menuItems", newItems);
  };

  const removeMenuItem = (index) => {
    if (window.confirm("Are you sure you want to remove this navigation item?")) {
      const updated = menuItems.filter((_, i) => i !== index);
      updateField("menuItems", updated);
    }
  };

  const moveMenuItem = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= menuItems.length) return;
    const updated = [...menuItems];
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;
    updateField("menuItems", updated);
  };

  return (
    <div className="space-y-6">
      {/* Brand & Basic Settings */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          ব্র্যান্ড ও বেসিক সেটিংস
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="text-xs font-semibold text-slate-700">ব্র্যান্ডের নাম</label>
            <input
              type="text"
              value={navbar.brandName || ""}
              onChange={(e) => updateField("brandName", e.target.value)}
              placeholder="BanglaQR"
              className="mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">ভাষা ব্যাজ</label>
            <input
              type="text"
              value={navbar.language || ""}
              onChange={(e) => updateField("language", e.target.value)}
              placeholder="বাংলা"
              className="mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="md:col-span-2">
            <CmsImageUpload
              label="ব্র্যান্ড লোগো (ডিফল্ট লোগো না চাইলে কাস্টম ইমেজ আপলোড করুন)"
              value={navbar.logo}
              fallbackImage={logoImg}
              onChange={(url) => updateField("logo", url)}
            />
          </div>
        </div>
      </div>

      {/* Header Buttons */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          বাটন ও অ্যাকশন লিংক
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="text-xs font-semibold text-slate-700">লগইন বাটন টেক্সট</label>
            <input
              type="text"
              value={navbar.loginButtonText || ""}
              onChange={(e) => updateField("loginButtonText", e.target.value)}
              placeholder="লগইন"
              className="mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">লগইন লিংক URL</label>
            <input
              type="text"
              value={navbar.loginButtonUrl || ""}
              onChange={(e) => updateField("loginButtonUrl", e.target.value)}
              placeholder="/login"
              className="mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">রেজিস্ট্রেশন বাটন টেক্সট (CTA)</label>
            <input
              type="text"
              value={navbar.ctaButtonText || ""}
              onChange={(e) => updateField("ctaButtonText", e.target.value)}
              placeholder="মার্চেন্ট অ্যাকাউন্ট খুলুন"
              className="mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">রেজিস্ট্রেশন লিংক URL</label>
            <input
              type="text"
              value={navbar.ctaButtonUrl || ""}
              onChange={(e) => updateField("ctaButtonUrl", e.target.value)}
              placeholder="/register"
              className="mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Navigation Menu Links Table */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Manage navigation menu links</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Add, edit, reorder or toggle menu items displayed on the public website navbar.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500">
              {menuItems.length} menu links
            </span>
            <button
              type="button"
              onClick={addMenuItem}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#00875a] px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#00704a] transition"
            >
              <Plus size={14} />
              <span>Add link</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200/80">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4 min-w-[200px]">MENU LABEL</th>
                <th className="py-3 px-4 min-w-[260px]">TARGET URL / ANCHOR</th>
                <th className="py-3 px-4 w-28 text-center">STATUS</th>
                <th className="py-3 px-4 w-28 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {menuItems.map((item, idx) => (
                <tr key={item.id || idx} className="hover:bg-slate-50/50 transition">
                  <td className="py-3 px-4 text-center font-bold text-slate-600">{idx + 1}</td>
                  <td className="py-3 px-4">
                    <input
                      type="text"
                      value={item.label || ""}
                      onChange={(e) => updateMenuItem(idx, "label", e.target.value)}
                      placeholder="মেনু নাম"
                      className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="text"
                      value={item.href || ""}
                      onChange={(e) => updateMenuItem(idx, "href", e.target.value)}
                      placeholder="#section বা /url"
                      className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => toggleMenuItemActive(idx)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
                        item.isActive !== false
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-400 border border-slate-200"
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          item.isActive !== false ? "bg-emerald-500" : "bg-slate-400"
                        }`}
                      />
                      <span>{item.isActive !== false ? "Active" : "Inactive"}</span>
                    </button>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveMenuItem(idx, -1)}
                        disabled={idx === 0}
                        className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                        title="Move Up"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveMenuItem(idx, 1)}
                        disabled={idx === menuItems.length - 1}
                        className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                        title="Move Down"
                      >
                        <ChevronDown size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeMenuItem(idx)}
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
