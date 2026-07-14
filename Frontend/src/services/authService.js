import api from "./api";

const authService = {
  async login(data) {
    const response = await api.post("/auth/login", data);
    return response.data;
  },

  async register(data) {
    const response = await api.post("/auth/register", data);
    return response.data;
  },

  async getProfile() {
    const response = await api.get("/auth/profile");
    return response.data;
  },
};

export default authService;
