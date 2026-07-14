import api from "./api";

const paymentService = {
  // สร้างการชำระเงินสำหรับออเดอร์
  async createPayment(orderId, paymentMethod) {
    const response = await api.post("/payments", {
      order_id: orderId,
      payment_method: paymentMethod,
    });
    return response.data;
  },

  // ดึงรายละเอียดการชำระเงิน
  async getPayment(id) {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  },
};

export default paymentService;
