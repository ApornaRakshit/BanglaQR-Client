import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  Users,
  Plus,
  Search,
  RefreshCw,
  Edit,
  Trash2,
  FileText,
  Building2,
  Mail,
  Phone,
  MapPin,
  AlertCircle,
  Check,
  X,
  Eye,
  ArrowRight,
} from "lucide-react";
import { merchantApi } from "../../../services/merchantApi";

export default function Customers() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [customerForm, setCustomerForm] = useState({
    name: "",
    businessName: "",
    email: "",
    phone: "",
    billingAddress: "",
    taxIdentification: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState(null);

  // View Customer Modal
  const [viewCustomer, setViewCustomer] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  // Toast
  const [toastMsg, setToastMsg] = useState(null);
  const showToast = (msg, isError = false) => {
    setToastMsg({ msg, isError });
    setTimeout(() => setToastMsg(null), 4000);
  };

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await merchantApi.getInvoiceCustomers({ search });
      setCustomers(res.data || []);
    } catch (err) {
      console.error("Failed to load customers:", err);
      setError(err.response?.data?.message || "Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const handleOpenAddModal = () => {
    setEditingCustomer(null);
    setCustomerForm({
      name: "",
      businessName: "",
      email: "",
      phone: "",
      billingAddress: "",
      taxIdentification: "",
      notes: "",
    });
    setModalError(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (cust) => {
    setEditingCustomer(cust);
    setCustomerForm({
      name: cust.name,
      businessName: cust.businessName || "",
      email: cust.email || "",
      phone: cust.phone || "",
      billingAddress: cust.billingAddress || "",
      taxIdentification: cust.taxIdentification || "",
      notes: cust.notes || "",
    });
    setModalError(null);
    setModalOpen(true);
  };

  const handleViewCustomer = async (cust) => {
    try {
      setViewLoading(true);
      const res = await merchantApi.getInvoiceCustomerById(cust.id);
      setViewCustomer(res.data);
    } catch (err) {
      showToast("Failed to load customer details", true);
    } finally {
      setViewLoading(false);
    }
  };

  const handleSaveCustomer = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setModalError(null);

      if (editingCustomer) {
        await merchantApi.updateInvoiceCustomer(editingCustomer.id, customerForm);
        showToast("Customer updated successfully!");
      } else {
        await merchantApi.createInvoiceCustomer(customerForm);
        showToast("Customer added successfully!");
      }

      setModalOpen(false);
      fetchCustomers();
    } catch (err) {
      setModalError(err.response?.data?.message || "Failed to save customer");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCustomer = async (cust) => {
    if (!window.confirm(`Are you sure you want to archive customer '${cust.name}'?`)) return;
    try {
      await merchantApi.deleteInvoiceCustomer(cust.id);
      showToast("Customer archived successfully");
      fetchCustomers();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete customer", true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold ${
            toastMsg.isError
              ? "bg-rose-50 border-rose-200 text-rose-800"
              : "bg-emerald-50 border-emerald-200 text-emerald-800"
          }`}
        >
          {toastMsg.isError ? <AlertCircle className="h-4 w-4 text-rose-600" /> : <Check className="h-4 w-4 text-emerald-600" />}
          {toastMsg.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Customer Directory
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Manage your client contact book, billing addresses, and invoice histories
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchCustomers}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Link
            to="/merchant/invoices"
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
          >
            Back to Invoices
          </Link>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            <Plus className="h-4 w-4" />
            Add New Customer
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search customers by name, business, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
        />
      </div>

      {/* Customers List / Grid */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
          <RefreshCw className="h-8 w-8 text-emerald-600 animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-slate-600">Loading customer directory...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center text-rose-800">
          <AlertCircle className="h-8 w-8 text-rose-600 mx-auto mb-2" />
          <p className="font-semibold text-xs">{error}</p>
        </div>
      ) : customers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
          <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No customers found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {search
              ? "No customers match your search criteria."
              : "Add your frequent clients to the customer directory for fast one-click invoice generation."}
          </p>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            Add First Customer
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{c.name}</h3>
                    {c.businessName && (
                      <p className="text-xs font-semibold text-slate-500 flex items-center gap-1 mt-0.5">
                        <Building2 className="h-3 w-3 text-slate-400" />
                        {c.businessName}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleViewCustomer(c)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                    title="View Customer History"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                  {c.email && (
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{c.email}</span>
                    </div>
                  )}
                  {c.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{c.phone}</span>
                    </div>
                  )}
                  {c.billingAddress && (
                    <div className="flex items-start gap-2 text-slate-500">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{c.billingAddress}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <Link
                  to="/merchant/invoices/new"
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Invoice
                </Link>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditModal(c)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
                    title="Edit"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteCustomer(c)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                    title="Archive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Customer Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingCustomer ? "Edit Customer" : "Add New Customer"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {modalError && (
              <div className="my-3 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                {modalError}
              </div>
            )}

            <form onSubmit={handleSaveCustomer} className="space-y-3.5 my-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mahbubul Alam"
                  value={customerForm.name}
                  onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Business / Company Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. TechCorp Bangladesh"
                  value={customerForm.businessName}
                  onChange={(e) => setCustomerForm({ ...customerForm, businessName: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="e.g. client@example.com"
                    value={customerForm.email}
                    onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    placeholder="e.g. 01700000000"
                    value={customerForm.phone}
                    onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Billing Address</label>
                <textarea
                  rows={2}
                  placeholder="Street address, City, District"
                  value={customerForm.billingAddress}
                  onChange={(e) => setCustomerForm({ ...customerForm, billingAddress: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tax / BIN ID (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. BIN-984210"
                  value={customerForm.taxIdentification}
                  onChange={(e) => setCustomerForm({ ...customerForm, taxIdentification: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                >
                  {saving ? "Saving..." : editingCustomer ? "Update Customer" : "Save Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Customer Modal */}
      {viewCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Customer Details & History</h3>
              <button onClick={() => setViewCustomer(null)} className="p-1.5 text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="my-4 space-y-3">
              <div className="p-4 bg-slate-50 rounded-xl space-y-1">
                <h4 className="font-bold text-sm text-slate-900">{viewCustomer.name}</h4>
                {viewCustomer.businessName && <p className="text-slate-600 font-semibold">{viewCustomer.businessName}</p>}
                <p className="text-slate-500">Email: {viewCustomer.email || "—"} | Phone: {viewCustomer.phone || "—"}</p>
                {viewCustomer.billingAddress && <p className="text-slate-500">{viewCustomer.billingAddress}</p>}
              </div>

              <h4 className="font-bold text-slate-900 pt-2">Invoices Issued to Customer:</h4>
              {viewCustomer.invoices?.length > 0 ? (
                <div className="border border-slate-200/80 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Invoice #</th>
                        <th className="p-2.5">Date</th>
                        <th className="p-2.5 text-right">Amount</th>
                        <th className="p-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {viewCustomer.invoices.map((inv) => (
                        <tr key={inv.id}>
                          <td className="p-2.5 font-mono font-bold text-emerald-700">{inv.invoiceNumber}</td>
                          <td className="p-2.5 text-slate-500">{new Date(inv.issueDate).toLocaleDateString()}</td>
                          <td className="p-2.5 text-right font-bold">৳{inv.amount.toFixed(2)}</td>
                          <td className="p-2.5 capitalize">{inv.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-slate-400 italic">No invoices issued to this customer yet.</p>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setViewCustomer(null)}
                className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

