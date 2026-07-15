import api from "./api";

const warrantyService = {
  // ดึงประกันทั้งหมดของผู้ใช้ปัจจุบัน
  async getMyWarranties() {
    const response = await api.get("/warranties");
    return response.data;
  },

  // ดึงรายละเอียดประกันตาม ID
  async getWarrantyById(id) {
    const response = await api.get(`/warranties/${id}`);
    return response.data;
  },

  // ยื่นคำขอเคลมประกัน
  async createClaim(warrantyId, problemDescription) {
    const response = await api.post("/warranty-claims", {
      warranty_id: warrantyId,
      problem_description: problemDescription,
    });
    return response.data;
  },

  // ดึงรายการเคลมทั้งหมดของผู้ใช้ปัจจุบัน
  async getMyClaims() {
    const response = await api.get("/warranty-claims/my");
    return response.data;
  },

  // ดึงรายละเอียดเคลมตาม ID
  async getClaimById(id) {
    const response = await api.get(`/warranty-claims/${id}`);
    return response.data;
  },
};

export default warrantyService;
