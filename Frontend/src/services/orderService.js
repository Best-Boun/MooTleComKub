import api from "./api";

const orderService = {
  // ดึงออเดอร์ทั้งหมด
  async getAllOrders() {
    const response = await api.get("/orders");
    return response.data;
  },

  // ดึงรายละเอียดออเดอร์
  async getOrderById(id) {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // เปลี่ยนสถานะออเดอร์
  async updateOrderStatus(id, order_status) {
    const response = await api.put(`/orders/${id}/status`, {
      order_status,
    });

    return response.data;
  },

  // ลบออเดอร์
  async deleteOrder(id) {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
  },
};

export default orderService;
