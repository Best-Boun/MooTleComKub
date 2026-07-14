import { useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";
import Swal from "sweetalert2";

import categoryService from "../../services/categoryService";

export default function CategoryForm({ mode, category, onSuccess, onClose }) {
  const [formData, setFormData] = useState({
    category_name: "",
    description: "",
    status: "ACTIVE",
  });

  useEffect(() => {
    if (mode === "edit" && category) {
      setFormData({
        category_name: category.category_name || "",
        description: category.description || "",
        status: category.status || "ACTIVE",
      });
    }
  }, [mode, category]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (mode === "add") {
        await categoryService.createCategory(formData);

        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Category created successfully",
          timer: 1200,
          showConfirmButton: false,
        });
      } else {
        await categoryService.updateCategory(category.category_id, formData);

        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Category updated successfully",
          timer: 1200,
          showConfirmButton: false,
        });
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Something went wrong",
      });
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>Category Name</Form.Label>

        <Form.Control
          type="text"
          name="category_name"
          value={formData.category_name}
          onChange={handleChange}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Description</Form.Label>

        <Form.Control
          as="textarea"
          rows={4}
          name="description"
          value={formData.description}
          onChange={handleChange}
        />
      </Form.Group>

      <Form.Group className="mb-4">
        <Form.Label>Status</Form.Label>

        <Form.Select
          name="status"
          value={formData.status}
          onChange={handleChange}
        >
          <option value="ACTIVE">ACTIVE</option>
          <option value="INACTIVE">INACTIVE</option>
        </Form.Select>
      </Form.Group>

      <div className="d-flex justify-content-end">
        <Button variant="secondary" className="me-2" onClick={onClose}>
          Cancel
        </Button>

        <Button variant="primary" type="submit">
          {mode === "add" ? "Add Category" : "Update Category"}
        </Button>
      </div>
    </Form>
  );
}
