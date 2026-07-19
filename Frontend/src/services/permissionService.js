import api from "./api";

const permissionService = {
  // ดึงสิทธิ์ของผู้ใช้ที่ Login อยู่ (ใช้ในหน้า Admin เพื่อซ่อนเมนู/ปิดปุ่ม)
  async getMyPermissions() {
    const response = await api.get("/admin-permissions/me");
    return response.data;
  },
};

export default permissionService;
