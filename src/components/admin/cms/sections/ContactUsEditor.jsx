import { useState } from "react";
import { Plus, Trash2, Phone, Mail, MapPin, CheckCircle2, Eye, EyeOff, GripVertical, AlertCircle, Sparkles, Sliders, MessageSquare } from "lucide-react";

export default function ContactUsEditor({ data = {}, onChange }) {
  const contact = data.contact || {};

  // Normalize services list into array of objects: { id, name, description, isActive, order }
  const rawServices = contact.services || contact.servicesList || [
    { id: "1", name: "BanglaQR পেমেন্ট গেটওয়ে", description: "QR ও অনলাইন গেটওয়ে পেমেন্ট", isActive: true, order: 1 },
    { id: "2", name: "মার্চেন্ট POS সিস্টেম", description: "দোকান ও সুপারশপের সমাধান", isActive: true, order: 2 },
    { id: "3", name: "ডায়নামিক QR সল্যুশন", description: "অ্যাপ ও কাউন্টার কালেকশন", isActive: true, order: 3 },
    { id: "4", name: "API ও ERP ইন্টিগ্রেশন", description: "সরাসরি সিস্টেম ইন্টিগ্রেশন", isActive: true, order: 4 },
    { id: "5", name: "কাস্টম পেমেন্ট সফটওয়্যার", description: "কাস্টমাইজড সফটওয়্যার সমাধান", isActive: true, order: 5 },
  ];

  const services = rawServices.map((item, idx) => {
    if (typeof item === "string") {
      return {
        id: String(idx + 1),
        name: item,
        description: "",
        isActive: true,
        order: idx + 1,
      };
    }
    return {
      id: item.id || String(idx + 1),
      name: item.name || "",
      description: item.description || "",
      isActive: item.isActive !== false,
      order: item.order || idx + 1,
    };
  });

  const updateField = (field, value) => {
    onChange({
      ...data,
      contact: {
        ...contact,
        [field]: value,
      },
    });
  };

  const updateMultipleFields = (fieldsObj) => {
    onChange({
      ...data,
      contact: {
        ...contact,
        ...fieldsObj,
      },
    });
  };

  const updateServices = (newServicesList) => {
    onChange({
      ...data,
      contact: {
        ...contact,
        services: newServicesList,
      },
    });
  };

  const addServiceOption = () => {
    const newId = String(Date.now());
    const newService = {
      id: newId,
      name: "নতুন সার্ভিস অপশন",
      description: "সার্ভিসের সংক্ষিপ্ত বিবরণ",
      isActive: true,
      order: services.length + 1,
    };
    updateServices([...services, newService]);
  };

  const updateServiceItem = (index, field, value) => {
    const updated = [...services];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    updateServices(updated);
  };

  const toggleServiceActive = (index) => {
    const updated = [...services];
    updated[index] = {
      ...updated[index],
      isActive: !updated[index].isActive,
    };
    updateServices(updated);
  };

  const removeServiceOption = (index) => {
    const updated = services.filter((_, i) => i !== index);
    updateServices(updated);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Section Copy */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <Sparkles size={16} className="text-emerald-600" />
          <span>সেকশন পরিচিতি ও মূল শিরোনাম (Section Content)</span>
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">টপ ব্যাজ (Pill Badge)</label>
              <input
                type="text"
                value={contact.badge ?? "যোগাযোগ করুন"}
                onChange={(e) => updateField("badge", e.target.value)}
                placeholder="যেমন: যোগাযোগ করুন বা GET IN TOUCH"
                className="mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">মূল শিরোনাম (Headline)</label>
              <input
                type="text"
                value={contact.title ?? contact.heading ?? ""}
                onChange={(e) => {
                  updateMultipleFields({
                    title: e.target.value,
                    heading: e.target.value,
                  });
                }}
                placeholder="যেমন: বাংলাদেশের সেরা পেমেন্ট ও সফটওয়্যার পার্টনারের সাথে যোগাযোগ করুন"
                className="mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">পরিচিতি / বর্ণনা (Description)</label>
            <textarea
              rows={2}
              value={contact.subtitle ?? contact.description ?? ""}
              onChange={(e) => {
                updateMultipleFields({
                  subtitle: e.target.value,
                  description: e.target.value,
                });
              }}
              placeholder="আপনার ব্যবসাকে ডিজিটাল ও সহজ করতে আজই আমাদের সাথে যোগাযোগ করুন..."
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* 2. Left 3 Contact Info Cards */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <Phone size={16} className="text-emerald-600" />
          <span>বাম পাশের ৩টি কন্টাক্ট ইনফো কার্ড (Contact Information)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Hotline Card */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
              <Phone size={16} />
              <span>১. হটলাইন ও সেলস</span>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600">কার্ড টাইটেল</label>
              <input
                type="text"
                value={contact.salesTitle ?? contact.hotlineTitle ?? ""}
                onChange={(e) => {
                  updateMultipleFields({
                    salesTitle: e.target.value,
                    hotlineTitle: e.target.value,
                  });
                }}
                placeholder="হটলাইন ও সেলস"
                className="mt-1 h-8 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-900 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600">ফোন নম্বরসমূহ</label>
              <input
                type="text"
                value={contact.salesPhone ?? contact.hotlineNumbers ?? ""}
                onChange={(e) => {
                  updateMultipleFields({
                    salesPhone: e.target.value,
                    hotlineNumbers: e.target.value,
                  });
                }}
                placeholder="09602-111215  09697-428578"
                className="mt-1 h-8 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-900 font-bold focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600">সময়সীমা / প্রাপ্যতা</label>
              <input
                type="text"
                value={contact.salesHours ?? contact.hotlineAvailability ?? ""}
                onChange={(e) => {
                  updateMultipleFields({
                    salesHours: e.target.value,
                    hotlineAvailability: e.target.value,
                  });
                }}
                placeholder="সপ্তাহের ৭ দিন সকাল ৯:০০ - রাত ৯:০০"
                className="mt-1 h-8 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-[11px] text-slate-600 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Email Card */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
              <Mail size={16} />
              <span>২. ইমেইল যোগাযোগ</span>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600">কার্ড টাইটেল</label>
              <input
                type="text"
                value={contact.emailTitle ?? ""}
                onChange={(e) => updateField("emailTitle", e.target.value)}
                placeholder="ইমেইল যোগাযোগ"
                className="mt-1 h-8 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-900 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600">ইমেইল ঠিকানা</label>
              <input
                type="text"
                value={contact.emailAddress ?? ""}
                onChange={(e) => updateField("emailAddress", e.target.value)}
                placeholder="info@csnbd.com"
                className="mt-1 h-8 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-900 font-bold focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600">রেসপন্স টাইম / বিবরণ</label>
              <input
                type="text"
                value={contact.emailSubtitle ?? ""}
                onChange={(e) => updateField("emailSubtitle", e.target.value)}
                placeholder="আমরা ২৪ ঘণ্টার মধ্যে উত্তর দিই"
                className="mt-1 h-8 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-[11px] text-slate-600 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Office Card */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
              <MapPin size={16} />
              <span>৩. প্রধান কার্যালয়</span>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600">কার্ড টাইটেল</label>
              <input
                type="text"
                value={contact.officeTitle ?? ""}
                onChange={(e) => updateField("officeTitle", e.target.value)}
                placeholder="প্রধান কার্যালয়"
                className="mt-1 h-8 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-900 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600">ঠিকানা</label>
              <textarea
                rows={2}
                value={contact.officeAddress ?? ""}
                onChange={(e) => updateField("officeAddress", e.target.value)}
                placeholder="ওয়াকিল টাওয়ার (৮ম তলা) তা-১৩১, গুলশান-১ বাড্ডা লিংক রোড, ঢাকা-১২১২"
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-900 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600">ম্যাপ লিংক (ঐচ্ছিক)</label>
              <input
                type="text"
                value={contact.mapLink ?? ""}
                onChange={(e) => updateField("mapLink", e.target.value)}
                placeholder="https://maps.google.com/..."
                className="mt-1 h-8 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-900 focus:border-emerald-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Right Form Settings */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <MessageSquare size={16} className="text-emerald-600" />
          <span>ডান পাশের কন্টাক্ট ফর্ম টেক্সট ও সেটিংস (Form Settings)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700">ফর্মের শিরোনাম (Form Title)</label>
            <input
              type="text"
              value={contact.formTitle ?? "ফ্রি ডেমো বা তথ্য জানতে অনুরোধ করুন"}
              onChange={(e) => updateField("formTitle", e.target.value)}
              placeholder="ফ্রি ডেমো বা তথ্য জানতে অনুরোধ করুন"
              className="mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">ফর্মের সাবটাইটেল (Form Subtitle)</label>
            <input
              type="text"
              value={contact.formSubtitle ?? "নিচের ফর্মটি পূরণ করুন, আমাদের বিশেষজ্ঞ দল দ্রুত যোগাযোগ করবে।"}
              onChange={(e) => updateField("formSubtitle", e.target.value)}
              placeholder="নিচের ফর্মটি পূরণ করুন, আমাদের বিশেষজ্ঞ দল দ্রুত যোগাযোগ করবে।"
              className="mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">সাবমিট বাটন টেক্সট</label>
            <input
              type="text"
              value={contact.submitButtonText ?? "বার্তা পাঠান"}
              onChange={(e) => updateField("submitButtonText", e.target.value)}
              placeholder="বার্তা পাঠান"
              className="mt-1 h-10 w-full rounded-xl border border-emerald-400 bg-emerald-50/30 px-3.5 text-xs font-bold text-emerald-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Success Message & Field Labels */}
        <div className="pt-2 border-t border-slate-100 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">সফল জমা বার্তা (Success Message)</label>
              <input
                type="text"
                value={contact.successMessage ?? "আপনার বার্তা সফলভাবে গৃহীত হয়েছে! আমাদের প্রতিনিধি শীঘ্রই আপনার সাথে যোগাযোগ করবেন।"}
                onChange={(e) => updateField("successMessage", e.target.value)}
                placeholder="আপনার বার্তা সফলভাবে গৃহীত হয়েছে..."
                className="mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">সার্ভিস ড্রপডাউন লেবেল</label>
              <input
                type="text"
                value={contact.serviceDropdownLabel ?? "কোন সেবা সম্পর্কে জানতে চান?"}
                onChange={(e) => updateField("serviceDropdownLabel", e.target.value)}
                placeholder="কোন সেবা সম্পর্কে জানতে চান?"
                className="mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="text-[11px] font-semibold text-slate-600">নাম ফিল্ডের লেবেল</label>
              <input
                type="text"
                value={contact.nameLabel ?? "আপনার পূর্ণ নাম"}
                onChange={(e) => updateField("nameLabel", e.target.value)}
                className="mt-1 h-8 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-900 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600">ফোন ফিল্ডের লেবেল</label>
              <input
                type="text"
                value={contact.phoneLabel ?? "মোবাইল নম্বর"}
                onChange={(e) => updateField("phoneLabel", e.target.value)}
                className="mt-1 h-8 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-900 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600">ইমেইল ফিল্ডের লেবেল</label>
              <input
                type="text"
                value={contact.emailLabel ?? "ইমেইল ঠিকানা"}
                onChange={(e) => updateField("emailLabel", e.target.value)}
                className="mt-1 h-8 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-900 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600">প্রতিষ্ঠানের নাম লেবেল</label>
              <input
                type="text"
                value={contact.companyLabel ?? "প্রতিষ্ঠানের নাম"}
                onChange={(e) => updateField("companyLabel", e.target.value)}
                className="mt-1 h-8 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-900 focus:border-emerald-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. সেবা নির্বাচনের অপশনসমূহ (DYNAMIC SERVICES DROPDOWN) */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sliders size={16} className="text-emerald-600" />
              <span>সেবা নির্বাচনের অপশনসমূহ (Dynamic Service Options)</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                {services.length} টি অপশন
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              পাবলিক কন্টাক্ট ফর্মের ড্রপডাউনে এই সেবাগুলো প্রদর্শিত হবে। শুধুমাত্র সক্রিয় (Active) অপশনগুলো গ্রাহক দেখতে পাবেন।
            </p>
          </div>

          <button
            type="button"
            onClick={addServiceOption}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#00875a] px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#00704a] transition self-start sm:self-auto cursor-pointer"
          >
            <Plus size={14} />
            <span>অপশন যোগ করুন</span>
          </button>
        </div>

        <div className="space-y-3">
          {services.map((srv, idx) => (
            <div
              key={srv.id || idx}
              className={`rounded-xl border p-4 transition-all ${
                srv.isActive
                  ? "border-slate-200 bg-white shadow-2xs"
                  : "border-slate-200 bg-slate-50/80 opacity-70"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                {/* Order indicator */}
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-black text-slate-600">
                  {idx + 1}
                </div>

                {/* Service Name Input */}
                <div className="flex-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    সার্ভিস / সফটওয়্যারের নাম (বাংলা) *
                  </label>
                  <input
                    type="text"
                    value={srv.name}
                    onChange={(e) => updateServiceItem(idx, "name", e.target.value)}
                    placeholder="যেমন: BanglaQR পেমেন্ট গেটওয়ে"
                    className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* Service Short Description Input */}
                <div className="flex-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    সংক্ষিপ্ত বিবরণ (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    value={srv.description || ""}
                    onChange={(e) => updateServiceItem(idx, "description", e.target.value)}
                    placeholder="যেমন: QR ও অনলাইন গেটওয়ে পেমেন্ট"
                    className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* Actions: Active Toggle & Delete */}
                <div className="flex items-center gap-2 self-end sm:self-center pt-1 sm:pt-4">
                  {/* Active / Inactive Toggle */}
                  <button
                    type="button"
                    onClick={() => toggleServiceActive(idx)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold border transition cursor-pointer ${
                      srv.isActive
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                        : "bg-slate-200/70 border-slate-300 text-slate-600 hover:bg-slate-300"
                    }`}
                    title={srv.isActive ? "সক্রিয় অপশন (ক্লিক করে নিষ্ক্রিয় করুন)" : "নিষ্ক্রিয় অপশন (ক্লিক করে সক্রিয় করুন)"}
                  >
                    {srv.isActive ? <Eye size={13} /> : <EyeOff size={13} />}
                    <span>{srv.isActive ? "Active" : "Inactive"}</span>
                  </button>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => removeServiceOption(idx)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition cursor-pointer"
                    title="অপশনটি মুছে ফেলুন"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {services.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-xs text-slate-500">
              কোনো সার্ভিস অপশন নেই। অনুগ্রহ করে উপরে <span className="font-bold">"অপশন যোগ করুন"</span> বাটনে ক্লিক করে সার্ভিস তৈরি করুন।
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
