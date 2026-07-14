import api from "./api";

const productService = {
  // ดึงสินค้าทั้งหมด
  async getAllProducts(params = {}) {
    const response = await api.get("/products", { params });
    return response.data;
  },

  // ดึงสินค้าตาม ID
  async getProductById(id) {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // เพิ่มสินค้า
  async createProduct(data) {
    const response = await api.post("/products", data);
    return response.data;
  },

  // แก้ไขสินค้า
  async updateProduct(id, data) {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },

  // ลบสินค้า
  async deleteProduct(id) {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  // เปลี่ยนสถานะ Active / Inactive
  async toggleStatus(id) {
    const response = await api.patch(`/products/${id}/status`);
    return response.data;
  },
};

export default productService;
