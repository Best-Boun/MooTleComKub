import api from "./api";

const specTemplateService = {
  // ดึง spec template ตาม category
  async getByCategory(categoryId) {
    const response = await api.get(`/spec-templates/categories/${categoryId}`);
    return response.data;
  },

  // ดึง spec template ทั้งหมดทุก category (SuperAdmin)
  async getAll() {
    const response = await api.get("/spec-templates");
    return response.data;
  },

  // สร้าง spec template ใหม่ (SuperAdmin)
  async create(categoryId, specName) {
    const response = await api.post("/spec-templates", {
      category_id: categoryId,
      spec_name: specName,
    });
    return response.data;
  },

  // ลบ spec template (SuperAdmin)
  async remove(templateId) {
    const response = await api.delete(`/spec-templates/${templateId}`);
    return response.data;
  },
};

export default specTemplateService;
