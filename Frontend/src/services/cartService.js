import api from "./api";

const cartService = {
  // ดึงตะกร้าสินค้าของผู้ใช้ปัจจุบัน
  async getCart() {
    const response = await api.get("/cart");
    return response.data;
  },

  // เพิ่มสินค้าลงตะกร้า
  async addItem(productId, quantity = 1) {
    const response = await api.post("/cart/items", {
      product_id: productId,
      quantity,
    });
    return response.data;
  },

  // แก้ไขจำนวนสินค้าในตะกร้า
  async updateItem(cartItemId, quantity) {
    const response = await api.put(`/cart/items/${cartItemId}`, { quantity });
    return response.data;
  },

  // ลบสินค้าออกจากตะกร้า
  async removeItem(cartItemId) {
    const response = await api.delete(`/cart/items/${cartItemId}`);
    return response.data;
  },

  // ล้างตะกร้าทั้งหมด
  async clearCart() {
    const response = await api.delete("/cart");
    return response.data;
  },
};

export default cartService;