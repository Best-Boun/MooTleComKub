import api from "./api";

const customerService = {
  // ดึงลูกค้าทั้งหมด
  async getAllCustomers() {
    const response = await api.get("/customers");
    return response.data;
  },

  // ดึงลูกค้าตาม ID
  async getCustomerById(id) {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },

  // แก้ไขลูกค้า
  async updateCustomer(id, data) {
    const response = await api.put(`/customers/${id}`, data);
    return response.data;
  },

  // ลบลูกค้า
  async deleteCustomer(id) {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  },

  // ดึง Order ของลูกค้า
  async getCustomerOrders(id) {
    const response = await api.get(`/customers/${id}/orders`);
    return response.data;
  },

  // ดึงสถิติของลูกค้า
  async getCustomerStatistics(id) {
    const response = await api.get(`/customers/${id}/statistics`);
    return response.data;
  },
};

export default customerService;
