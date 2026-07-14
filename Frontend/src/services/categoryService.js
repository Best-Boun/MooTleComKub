import api from "./api";

const categoryService = {
  // ดึง Category ทั้งหมด
  async getAllCategories() {
    const response = await api.get("/categories");
    return response.data;
  },

  // ดึง Category ตาม ID
  async getCategoryById(id) {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  // เพิ่ม Category
  async createCategory(data) {
    const response = await api.post("/categories", data);
    return response.data;
  },

  // แก้ไข Category
  async updateCategory(id, data) {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },

  // ลบ Category
  async deleteCategory(id) {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};

export default categoryService;
