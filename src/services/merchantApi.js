import api from "./api";

export const merchantApi = {
  // --- Profile & Onboarding ---
  getMe: async () => {
    const { data } = await api.get("/merchants/me");
    return data;
  },

  getOnboarding: async () => {
    const { data } = await api.get("/merchants/me/onboarding");
    return data;
  },

  updateCompany: async (payload) => {
    const { data } = await api.put("/merchants/me/company", payload);
    return data;
  },

  updateContact: async (payload) => {
    const { data } = await api.put("/merchants/me/contact", payload);
    return data;
  },

  updateCommercial: async (payload) => {
    const { data } = await api.put("/merchants/me/commercial", payload);
    return data;
  },

  getKyc: async () => {
    const { data } = await api.get("/merchants/me/kyc");
    return data;
  },

  updateKyc: async (payload) => {
    const { data } = await api.put("/merchants/me/kyc", payload);
    return data;
  },

  // --- Documents ---
  getDocuments: async () => {
    const { data } = await api.get("/merchants/me/documents");
    return data;
  },

  uploadDocument: async (formData) => {
    const { data } = await api.post("/merchants/me/documents", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  },

  replaceDocument: async (id, formData) => {
    const { data } = await api.post(`/merchants/me/documents/${id}/replace`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  },

  deleteDocument: async (id) => {
    const { data } = await api.delete(`/merchants/me/documents/${id}`);
    return data;
  },

  getDocumentBlob: async (id) => {
    return await api.get(`/merchants/me/documents/${id}/view`, {
      responseType: "blob",
    });
  },

  submitApplication: async () => {
    const { data } = await api.post("/merchants/me/submit");
    return data;
  },

  // --- Gateway Catalogue & Applications ---
  getGateways: async (params = {}) => {
    const { data } = await api.get("/merchants/me/gateways", { params });
    return data;
  },

  getGatewayById: async (id) => {
    const { data } = await api.get(`/merchants/me/gateways/${id}`);
    return data;
  },

  applyGateway: async (gatewayId, payload = {}) => {
    const { data } = await api.post(`/merchants/me/gateways/${gatewayId}/apply`, payload);
    return data;
  },

  getApplications: async (params = {}) => {
    const { data } = await api.get("/merchants/me/applications", { params });
    return data;
  },

  getApplicationById: async (id) => {
    const { data } = await api.get(`/merchants/me/applications/${id}`);
    return data;
  },

  // --- My Services ---
  getMyServices: async (params = {}) => {
    const { data } = await api.get("/merchants/me/services", { params });
    return data;
  },

  getMyServiceById: async (id) => {
    const { data } = await api.get(`/merchants/me/services/${id}`);
    return data;
  },

  updateServiceConfiguration: async (id, payload) => {
    const { data } = await api.put(`/merchants/me/services/${id}/configuration`, payload);
    return data;
  },

  // --- Add-ons ---
  getAddons: async (params = {}) => {
    const { data } = await api.get("/merchants/me/addons", { params });
    return data;
  },

  applyAddon: async (addonId, payload = {}) => {
    const { data } = await api.post(`/merchants/me/addons/${addonId}/apply`, payload);
    return data;
  },

  // --- Notifications ---
  getNotifications: async () => {
    const { data } = await api.get("/merchants/me/notifications");
    return data;
  },

  getUnreadNotificationCount: async () => {
    const { data } = await api.get("/merchants/me/notifications/unread-count");
    return data;
  },

  markNotificationRead: async (id) => {
    const { data } = await api.patch(`/merchants/me/notifications/${id}/read`);
    return data;
  },

  markAllNotificationsRead: async () => {
    const { data } = await api.patch("/merchants/me/notifications/read-all");
    return data;
  },

  // --- Support Tickets ---
  getTickets: async (params = {}) => {
    const { data } = await api.get("/merchants/me/support", { params });
    return data;
  },

  getTicketById: async (id) => {
    const { data } = await api.get(`/merchants/me/support/${id}`);
    return data;
  },

  createTicket: async (payload) => {
    const { data } = await api.post("/merchants/me/support", payload);
    return data;
  },

  replyTicket: async (id, payload) => {
    const { data } = await api.post(`/merchants/me/support/${id}/reply`, payload);
    return data;
  },

  // --- Invoices & Billing ---
  getInvoiceStats: async () => {
    const { data } = await api.get("/merchants/me/invoices/stats");
    return data;
  },

  getNextInvoiceNumber: async () => {
    const { data } = await api.get("/merchants/me/invoices/next-number");
    return data;
  },

  getInvoices: async (params = {}) => {
    const { data } = await api.get("/merchants/me/invoices", { params });
    return data;
  },

  getInvoiceById: async (id) => {
    const { data } = await api.get(`/merchants/me/invoices/${id}`);
    return data;
  },

  getInvoicePdfBlob: async (id) => {
    return await api.get(`/merchants/me/invoices/${id}/pdf`, {
      responseType: "blob",
    });
  },

  exportInvoicesExcel: async (params = {}) => {
    return await api.get("/merchants/me/invoices/export.xlsx", {
      params,
      responseType: "blob",
    });
  },

  getInvoicePaymentLink: async (id) => {
    const { data } = await api.get(`/merchants/me/invoices/${id}/payment-link`);
    return data;
  },

  createInvoice: async (payload) => {
    const { data } = await api.post("/merchants/me/invoices", payload);
    return data;
  },

  updateInvoice: async (id, payload) => {
    const { data } = await api.put(`/merchants/me/invoices/${id}`, payload);
    return data;
  },

  sendInvoice: async (id) => {
    const { data } = await api.post(`/merchants/me/invoices/${id}/send`);
    return data;
  },

  sendInvoiceReminder: async (id) => {
    const { data } = await api.post(`/merchants/me/invoices/${id}/remind`);
    return data;
  },

  recordInvoicePayment: async (id, payload) => {
    const { data } = await api.post(`/merchants/me/invoices/${id}/payments`, payload);
    return data;
  },

  cancelInvoice: async (id, payload = {}) => {
    const { data } = await api.post(`/merchants/me/invoices/${id}/cancel`, payload);
    return data;
  },

  // --- Invoice Customers ---
  getInvoiceCustomers: async (params = {}) => {
    const { data } = await api.get("/merchants/me/invoice-customers", { params });
    return data;
  },

  createInvoiceCustomer: async (payload) => {
    const { data } = await api.post("/merchants/me/invoice-customers", payload);
    return data;
  },

  getInvoiceCustomerById: async (id) => {
    const { data } = await api.get(`/merchants/me/invoice-customers/${id}`);
    return data;
  },

  updateInvoiceCustomer: async (id, payload) => {
    const { data } = await api.put(`/merchants/me/invoice-customers/${id}`, payload);
    return data;
  },

  deleteInvoiceCustomer: async (id) => {
    const { data } = await api.delete(`/merchants/me/invoice-customers/${id}`);
    return data;
  },

  // --- Settings ---
  getSettings: async () => {
    const { data } = await api.get("/merchants/me/settings");
    return data;
  },

  changePassword: async (payload) => {
    const { data } = await api.put("/merchants/me/settings/password", payload);
    return data;
  },
};
