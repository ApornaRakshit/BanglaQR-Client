import { useState, useEffect } from "react";
import {
  PlugZap,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Play,
  ShieldAlert,
  Server,
  Layers,
  Clock,
  Lock,
  X,
  Loader2,
} from "lucide-react";
import { institutionApi } from "../../services/institutionApi";

export default function InstitutionConnections() {
  const [connections, setConnections] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [testingServiceId, setTestingServiceId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [connRes, svcRes] = await Promise.all([
        institutionApi.getConnections(),
        institutionApi.getServices(),
      ]);
      setConnections(connRes.connections || []);
      setServices(svcRes.services || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load service connections.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTestConnection = async (serviceId) => {
    setTestingServiceId(serviceId);
    setError("");
    setSuccessMsg("");
    try {
      const res = await institutionApi.testConnection(serviceId);
      setSuccessMsg(res.message || "Connection tested successfully");
      fetchData();
    } catch (err) {
      setError(err?.response?.data?.message || "Connection test failed.");
    } finally {
      setTestingServiceId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "connected":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 size={12} />
            Connected & Verified
          </span>
        );
      case "testing":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
            <Clock size={12} />
            Testing / Sandbox
          </span>
        );
      case "setup_pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
            <Clock size={12} />
            Setup Pending
          </span>
        );
      case "error":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
            <AlertTriangle size={12} />
            Error / Failed
          </span>
        );
      case "not_connected":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
            Not Connected
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <PlugZap size={24} />
            </div>
            Technical Service Connections & Handshakes
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            BanglaQR API integration modes, sandbox connectivity verification, and handshake audit logs
          </p>
        </div>

        <button
          type="button"
          onClick={fetchData}
          className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 transition self-start sm:self-auto"
        >
          <RefreshCw size={15} className={loading ? "animate-spin text-emerald-600" : ""} />
        </button>
      </div>

      {/* Security Notice Banner */}
      <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center gap-3 shadow-xs">
        <Lock size={20} className="text-emerald-400 shrink-0" />
        <div className="text-xs">
          <span className="font-bold block">Zero-Secret Policy & Compliance Verification</span>
          <p className="text-slate-300 mt-0.5">
            Plaintext API secrets and private merchant settlement keys are strictly sealed in hardware vault storage and never transmitted to or rendered in browser portals.
          </p>
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

      {/* Available Services & Connection Status Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Configured Service Integrations</h3>

        {loading ? (
          <div className="py-12 text-center text-slate-400">
            <RefreshCw size={24} className="animate-spin mx-auto text-emerald-600 mb-2" />
            <p className="text-xs">Checking integration endpoints...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
            No institutional services configured yet. Add services in Institutional Services catalog first.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((svc) => {
              const conn = connections.find((c) => c.institution_service_id === svc.id);
              const isTesting = testingServiceId === svc.id;

              return (
                <div
                  key={svc.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {svc.service_code}
                      </span>
                      {getStatusBadge(conn?.status || "not_connected")}
                    </div>

                    <h4 className="text-base font-bold text-slate-900">{svc.service_name}</h4>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 pt-1">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Integration Mode</span>
                        <span className="font-semibold text-slate-700 uppercase text-[11px]">
                          {conn?.connection_mode || svc.integration_mode || "api"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Environment</span>
                        <span className="font-semibold text-slate-700 uppercase text-[11px]">
                          {conn?.environment || "sandbox"}
                        </span>
                      </div>
                    </div>

                    {conn?.connection_notes && (
                      <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        {conn.connection_notes}
                      </p>
                    )}

                    <div className="text-[10px] text-slate-400 pt-1">
                      <span>Last Tested: </span>
                      <span className="font-mono text-slate-600">
                        {conn?.last_tested_at ? new Date(conn.last_tested_at).toLocaleString() : "Never"}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => handleTestConnection(svc.id)}
                      disabled={isTesting}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 transition"
                    >
                      {isTesting ? (
                        <>
                          <Loader2 size={13} className="animate-spin text-emerald-400" />
                          <span>Testing Handshake...</span>
                        </>
                      ) : (
                        <>
                          <Play size={12} className="text-emerald-400 fill-emerald-400" />
                          <span>Test Handshake</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

