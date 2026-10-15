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

  // Banking Institutions & Branches for KYC
  getActiveInstitutions: async () => {
    const { data } = await api.get("/merchants/institutions");
    return data;
  },

  getInstitutionBranches: async (institutionId) => {
    const { data } = await api.get(`/merchants/institutions/${institutionId}/branches`);
    return data;
  },

  getGeoDivisions: async () => {
    const { data } = await api.get("/merchants/geo/divisions");
    return data;
  },

  getGeoDistricts: async (params = {}) => {
    const { data } = await api.get("/merchants/geo/districts", { params });
    return data;
  },

  getGeoUpazilas: async (params = {}) => {
    const { data } = await api.get("/merchants/geo/upazilas", { params });
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

  submitCorrection: async (payload = {}) => {
    const { data } = await api.post("/merchants/me/corrections/resubmit", payload);
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

  // --- Add-ons & Orders ---
  getAddons: async (params = {}) => {
    const { data } = await api.get("/merchants/me/addons", { params });
    return data;
  },

  applyAddon: async (addonId, payload = {}) => {
    const { data } = await api.post(`/merchants/me/addons/${addonId}/apply`, payload);
    return data;
  },

  createAddonOrder: async (addonId, payload = {}) => {
    const { data } = await api.post(`/merchants/me/addons/${addonId}/order`, payload);
    return data;
  },

  getAddonOrders: async (params = {}) => {
    const { data } = await api.get("/merchants/me/addon-orders", { params });
    return data;
  },

  getAddonOrderById: async (orderId) => {
    const { data } = await api.get(`/merchants/me/addon-orders/${orderId}`);
    return data;
  },

  resumeOrderCheckout: async (orderId, payload = {}) => {
    const { data } = await api.post(`/merchants/me/addon-orders/${orderId}/checkout`, payload);
    return data;
  },

  getAddonPayments: async (params = {}) => {
    const { data } = await api.get("/merchants/me/addon-payments", { params });
    return data;
  },

  getAddonPaymentById: async (paymentId) => {
    const { data } = await api.get(`/merchants/me/addon-payments/id/${paymentId}`);
    return data;
  },

  refreshPaymentStatus: async (paymentId) => {
    const { data } = await api.post(`/merchants/me/addon-payments/id/${paymentId}/refresh`);
    return data;
  },

  getAddonPaymentStatus: async (paymentReference) => {
    const { data } = await api.get(`/merchants/me/addon-payments/${paymentReference}/status`);
    return data;
  },

  // Aliases for orders & payments
  getOrders: async (params = {}) => {
    const { data } = await api.get("/merchants/me/addon-orders", { params });
    return data;
  },
  getOrderById: async (orderId) => {
    const { data } = await api.get(`/merchants/me/addon-orders/${orderId}`);
    return data;
  },
  getPayments: async (params = {}) => {
    const { data } = await api.get("/merchants/me/addon-payments", { params });
    return data;
  },
  getPaymentById: async (paymentId) => {
    const { data } = await api.get(`/merchants/me/addon-payments/id/${paymentId}`);
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
