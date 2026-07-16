import api from "./api";

const warrantyService = {
  // ==========================
  // Customer
  // ==========================

  // ดึงประกันทั้งหมดของผู้ใช้ปัจจุบัน
  async getMyWarranties() {
    const response = await api.get("/warranties");
    return response.data;
  },

  // ดึงรายละเอียดประกัน
  async getWarrantyById(id) {
    const response = await api.get(`/warranties/${id}`);
    return response.data;
  },

  // ส่งคำขอเคลม
  async createClaim(warrantyId, problemDescription) {
    const response = await api.post("/warranty-claims", {
      warranty_id: warrantyId,
      problem_description: problemDescription,
    });

    return response.data;
  },

  // ดูเคลมของตัวเอง
  async getMyClaims() {
    const response = await api.get("/warranty-claims/my");
    return response.data;
  },

  // ดูรายละเอียดเคลม
  async getClaimById(id) {
    const response = await api.get(`/warranty-claims/${id}`);
    return response.data;
  },

  // ==========================
  // Admin
  // ==========================

  // ดูเคลมทั้งหมด
  async getAllClaims() {
    const response = await api.get("/warranty-claims");
    return response.data;
  },

  // เปลี่ยนสถานะเคลม
  async updateClaimStatus(id, claim_status, admin_remark) {
    const response = await api.put(`/warranty-claims/${id}/status`, {
      claim_status,
      admin_remark,
    });

    return response.data;
  },
};

export default warrantyService;
