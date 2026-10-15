import { useState, useEffect } from "react";
import {
  ServerCog,
  RefreshCw,
  Plus,
  CheckCircle2,
  AlertCircle,
  X,
  Radio,
  FileCode,
  Check,
} from "lucide-react";
import { institutionApi } from "../../services/institutionApi";

export default function InstitutionServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    serviceCode: "",
    serviceName: "",
    serviceType: "payment_gateway",
    integrationMode: "api",
    availabilityStatus: "available",
    applicationRequired: true,
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchServices = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await institutionApi.getServices();
      setServices(res.services || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load institution services.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleSaveService = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await institutionApi.saveService(form);
      setSuccessMsg(`Service '${form.serviceName}' saved successfully`);
      setIsModalOpen(false);
      setForm({
        serviceCode: "",
        serviceName: "",
        serviceType: "payment_gateway",
        integrationMode: "api",
        availabilityStatus: "available",
        applicationRequired: true,
      });
      fetchServices();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to save service.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
              <ServerCog size={24} />
            </div>
            Institutional Service Catalog
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure merchant payment methods, QR settlement capabilities, and availability
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchServices}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 transition"
          >
            <RefreshCw size={15} className={loading ? "animate-spin text-blue-600" : ""} />
          </button>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition"
          >
            <Plus size={15} />
            <span>Add Service</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center justify-between border border-emerald-200">
          <span>{successMsg}</span>
          <button type="button" onClick={() => setSuccessMsg("")}>
            <X size={14} />
          </button>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
          {error}
        </div>
      )}

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            <RefreshCw size={24} className="animate-spin mx-auto text-blue-600 mb-2" />
            <p className="text-xs">Loading services...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="col-span-full p-8 text-center bg-white rounded-2xl border border-slate-200">
            <ServerCog size={32} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No institutional services configured</p>
            <p className="text-xs text-slate-400 mt-1">
              Add your first payment gateway or QR service capability above.
            </p>
          </div>
        ) : (
          services.map((svc) => (
            <div
              key={svc.id}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                    {svc.service_code}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      svc.availability_status === "available"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {svc.availability_status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-3">{svc.service_name}</h3>
                <p className="text-xs text-slate-500 capitalize mt-0.5">
                  Type: {svc.service_type?.replace(/_/g, " ")}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Integration Mode</span>
                  <span className="font-semibold uppercase text-slate-800 text-[11px]">
                    {svc.integration_mode}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Application Required</span>
                  <span className="font-semibold text-slate-800">
                    {svc.application_required ? "Yes (KYC Enforced)" : "Direct Enablement"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Connection Status</span>
                  <span className="font-semibold text-slate-800 capitalize">
                    {svc.connection_status || "Not Connected"}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Service Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Add Institutional Service</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Service Name</label>
                <input
                  type="text"
                  placeholder="e.g. BanglaQR Merchant Settlement"
                  value={form.serviceName}
                  onChange={(e) => setForm({ ...form, serviceName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Service Code</label>
                  <input
                    type="text"
                    placeholder="e.g. BQR_SETTLE"
                    value={form.serviceCode}
                    onChange={(e) => setForm({ ...form, serviceCode: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Service Type</label>
                  <select
                    value={form.serviceType}
                    onChange={(e) => setForm({ ...form, serviceType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  >
                    <option value="payment_gateway">Payment Gateway</option>
                    <option value="qr_collection">QR Merchant Collection</option>
                    <option value="pos_terminal">POS Terminal Acquiring</option>
                    <option value="escrow_settlement">Escrow & Settlement</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Integration Mode</label>
                  <select
                    value={form.integrationMode}
                    onChange={(e) => setForm({ ...form, integrationMode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  >
                    <option value="api">Direct API (REST / JSON)</option>
                    <option value="hosted_checkout">Hosted Checkout</option>
                    <option value="qr_offline">Offline QR Interoperable</option>
                    <option value="manual">Manual Batch / Portal</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Availability</label>
                  <select
                    value={form.availabilityStatus}
                    onChange={(e) => setForm({ ...form, availabilityStatus: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  >
                    <option value="available">Available</option>
                    <option value="testing_only">Sandbox Testing Only</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="appReq"
                  checked={form.applicationRequired}
                  onChange={(e) => setForm({ ...form, applicationRequired: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="appReq" className="text-slate-700 font-medium">
                  Require compliance application before activating for merchants
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

