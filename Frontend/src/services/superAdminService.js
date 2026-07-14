import api from "./api";

const superAdminService = {
  // ================= Admin Accounts =================
  async getAdmins() {
    const response = await api.get("/admins");
    return response.data;
  },

  async createAdmin(data) {
    const response = await api.post("/admins", data);
    return response.data;
  },

  async updateAdmin(id, data) {
    const response = await api.put(`/admins/${id}`, data);
    return response.data;
  },

  async deleteAdmin(id) {
    const response = await api.delete(`/admins/${id}`);
    return response.data;
  },

  // ================= Roles =================
  async getRoles() {
    const response = await api.get("/roles");
    return response.data;
  },

  async updateRole(id, data) {
    const response = await api.put(`/roles/${id}`, data);
    return response.data;
  },

  // ================= System =================
  async getSystemLogs(params) {
    const response = await api.get("/system/logs", { params });
    return response.data;
  },

  async updateSystemSettings(data) {
    const response = await api.put("/system/settings", data);
    return response.data;
  },
};

export default superAdminService;
