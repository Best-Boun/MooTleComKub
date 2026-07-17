import api from "./api";

const brandService = {
  // ดึง Brand ทั้งหมด
  async getBrandsByCategory(categoryId) {
    const response = await api.get(`/brands/category/${categoryId}`);
    return response.data;
  },

  // ดึง Brand ตาม ID
  async getBrandById(id) {
    const response = await api.get(`/brands/${id}`);
    return response.data;
  },
};

export default brandService;
