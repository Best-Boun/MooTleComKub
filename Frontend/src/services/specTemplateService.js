import api from "./api";

const specTemplateService = {
  // ดึงรายชื่อ field สเปคของ category หนึ่ง
  async getByCategory(categoryId) {
    const response = await api.get(`/spec-templates/category/${categoryId}`);
    return response.data;
  },
};

export default specTemplateService;
