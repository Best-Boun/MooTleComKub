import api from "./api";

const productSpecService = {
  // ดึงสเปคทั้งหมดของสินค้าหนึ่งตัว
  async getByProductId(productId) {
    const response = await api.get(`/product-specs/product/${productId}`);
    return response.data;
  },

  // แก้ไขสเปคสินค้า (Admin/SuperAdmin)
  // หมายเหตุ: backend รับ field ชื่อ specName/specValue (camelCase) ไม่ใช่ spec_name/spec_value
  async updateProductSpecs(productId, specsArray) {
    const response = await api.put(`/product-specs/product/${productId}`, {
      specs: specsArray,
    });
    return response.data;
  },
};

export default productSpecService;
