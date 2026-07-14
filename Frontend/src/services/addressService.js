import api from "./api";

const addressService = {
  // ดึงที่อยู่ทั้งหมดของผู้ใช้ปัจจุบัน
  async getAddresses() {
    const response = await api.get("/addresses");
    return response.data;
  },

  // ดึงที่อยู่ตาม ID
  async getAddressById(id) {
    const response = await api.get(`/addresses/${id}`);
    return response.data;
  },

  // เพิ่มที่อยู่ใหม่
  async createAddress(data) {
    const response = await api.post("/addresses", data);
    return response.data;
  },

  // แก้ไขที่อยู่
  async updateAddress(id, data) {
    const response = await api.put(`/addresses/${id}`, data);
    return response.data;
  },

  // ลบที่อยู่
  async deleteAddress(id) {
    const response = await api.delete(`/addresses/${id}`);
    return response.data;
  },

  // ตั้งเป็นที่อยู่หลัก
  async setDefaultAddress(id) {
    const response = await api.patch(`/addresses/${id}/default`);
    return response.data;
  },
};

export default addressService;
