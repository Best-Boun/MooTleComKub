import api from "./api";

const warrantyClaimAdminService = {
  // ดึงคำขอเคลมทั้งหมด (แอดมิน)
  async getAllClaims() {
    const response = await api.get("/warranty-claims");
    return response.data;
  },

  // อัปเดตสถานะคำขอเคลม (แอดมิน)
  async updateClaimStatus(claimId, claim_status, admin_remark) {
    const response = await api.put(`/warranty-claims/${claimId}/status`, {
      claim_status,
      admin_remark,
    });

    return response.data;
  },
};

export default warrantyClaimAdminService;
