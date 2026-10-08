import api from "./api";

export const merchantApi = {
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

  submitApplication: async () => {
    const { data } = await api.post("/merchants/me/submit");
    return data;
  },
};

