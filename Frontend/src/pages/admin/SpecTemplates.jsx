import { useEffect, useState } from "react";
import { Button, Card, Form, Spinner, Table } from "react-bootstrap";
import Swal from "sweetalert2";

import categoryService from "../../services/categoryService";
import specTemplateService from "../../services/specTemplateService";

export default function SpecTemplates() {
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  const [templates, setTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newSpecName, setNewSpecName] = useState("");
  const [saving, setSaving] = useState(false);

  const loadCategories = async () => {
    try {
      setCategoriesLoading(true);

      const res = await categoryService.getAllCategories();
      const list = Array.isArray(res?.data) ? res.data : [];
      setCategories(list);

      if (list.length > 0) {
        setSelectedCategoryId(String(list[0].category_id));
      }
    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load categories",
      });
    } finally {
      setCategoriesLoading(false);
    }
  };

  const loadTemplates = async (categoryId) => {
    if (!categoryId) {
      setTemplates([]);
      return;
    }

    try {
      setTemplatesLoading(true);

      const res = await specTemplateService.getByCategory(categoryId);
      setTemplates(Array.isArray(res?.data) ? res.data : []);
    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load spec templates",
      });
    } finally {
      setTemplatesLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadTemplates(selectedCategoryId);
    setShowAddForm(false);
    setNewSpecName("");
  }, [selectedCategoryId]);

  const handleAddSpec = async (e) => {
    e.preventDefault();

    if (!newSpecName.trim()) return;

    setSaving(true);

    try {
      const res = await specTemplateService.create(selectedCategoryId, newSpecName.trim());

      if (!res?.success) {
        throw new Error(res?.message || "Failed to create spec template");
      }

      setNewSpecName("");
      setShowAddForm(false);
      await loadTemplates(selectedCategoryId);
    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || error.message || "Failed to create spec template",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (template) => {
    const result = await Swal.fire({
      title: `Delete spec "${template.spec_name}"?`,
      text: "การลบ spec นี้จะไม่กระทบค่าที่สินค้าเคยกรอกไว้ในตาราง product_specs โดยตรง",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await specTemplateService.remove(template.template_id);

      if (!res?.success) {
        throw new Error(res?.message || "Failed to delete spec template");
      }

      await loadTemplates(selectedCategoryId);
    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Delete Failed",
        text: error.response?.data?.message || error.message || "Something went wrong",
      });
    }
  };

  return (
    <Card className="shadow-sm border-0">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold mb-0">Manage Spec Templates</h3>
        </div>

        {categoriesLoading ? (
          <div className="text-center py-5">
            <Spinner animation="border" />
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center text-muted py-5">
            ยังไม่มี Category ในระบบ กรุณาสร้าง Category ก่อน
          </div>
        ) : (
          <>
            <Form.Group className="mb-4" style={{ maxWidth: 320 }}>
              <Form.Label>Category</Form.Label>
              <Form.Select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c.category_id} value={c.category_id}>
                    {c.category_name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Spec Fields</h5>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowAddForm((v) => !v)}
              >
                {showAddForm ? "Cancel" : "+ Add Spec"}
              </Button>
            </div>

            {showAddForm && (
              <Form className="d-flex gap-2 mb-3" onSubmit={handleAddSpec}>
                <Form.Control
                  placeholder="Spec name (e.g. RAM)"
                  value={newSpecName}
                  onChange={(e) => setNewSpecName(e.target.value)}
                  required
                />
                <Button type="submit" variant="success" disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </Button>
              </Form>
            )}

            {templatesLoading ? (
              <div className="text-center py-4">
                <Spinner animation="border" size="sm" />
              </div>
            ) : (
              <Table striped bordered hover responsive>
                <thead className="table-dark">
                  <tr>
                    <th>#</th>
                    <th>Spec Name</th>
                    <th width="120">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {templates.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="text-center text-muted">
                        Category นี้ยังไม่มี spec template เลย
                      </td>
                    </tr>
                  ) : (
                    templates.map((template, index) => (
                      <tr key={template.template_id}>
                        <td>{index + 1}</td>
                        <td>{template.spec_name}</td>
                        <td>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDelete(template)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            )}
          </>
        )}
      </Card.Body>
    </Card>
  );
}
