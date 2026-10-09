import api from "./api";

export const userApi = {
  getProfile: () => api.get("/users/me").then((res) => res.data),
};

