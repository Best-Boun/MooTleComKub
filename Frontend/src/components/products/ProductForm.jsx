import { useEffect, useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import productService from "../../services/productService";
import Swal from "sweetalert2";

export default function ProductForm({ mode, product, onSuccess, onClose }) {
  const [preview, setPreview] = useState("");

  const [formData, setFormData] = useState({
    category_id: "",
    brand_id: "",
    sku: "",
    image: product.image || "",
    product_name: "",
    description: "",
    price: "",
    stock: "",
    warranty_provider: "",
    status: "ACTIVE",
  });

  useEffect(() => {
    if (mode === "edit" && product) {
      setFormData({
        category_id: product.category_id || "",
        brand_id: product.brand_id || "",
        sku: product.sku || "",
        image: product.image || "",
        product_name: product.product_name || "",
        description: product.description || "",
        price: product.price || "",
        stock: product.stock || "",
        warranty_provider: product.warranty_provider || "",
        status: product.status || "ACTIVE",
      });

      if (product.image) {
        setPreview(`http://localhost:5000${product.image}`);
      }
    } else {
      setPreview("");
    }
  }, [mode, product]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));

      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const submitData = new FormData();

    Object.keys(formData).forEach((key) => {
      submitData.append(key, formData[key]);
    });

    try {
      if (mode === "add") {
        await productService.createProduct(submitData);

        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Product added successfully",
        });
      } else {
        await productService.updateProduct(product.product_id, submitData);

        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Product updated successfully",
        });
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong",
      });
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Category ID</Form.Label>

            <Form.Control
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Brand ID</Form.Label>

            <Form.Control
              name="brand_id"
              value={formData.brand_id}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-3">
        <Form.Label>SKU</Form.Label>

        <Form.Control
          name="sku"
          value={formData.sku}
          onChange={handleChange}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Product Image</Form.Label>

        <Form.Control
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />

        {preview && (
          <div className="mt-3">
            <img
              src={preview}
              alt="preview"
              width="150"
              height="150"
              style={{
                objectFit: "cover",
                borderRadius: "10px",
              }}
            />
          </div>
        )}
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Product Name</Form.Label>

        <Form.Control
          name="product_name"
          value={formData.product_name}
          onChange={handleChange}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Description</Form.Label>

        <Form.Control
          as="textarea"
          rows={3}
          name="description"
          value={formData.description}
          onChange={handleChange}
        />
      </Form.Group>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Price</Form.Label>

            <Form.Control
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Stock</Form.Label>

            <Form.Control
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-3">
        <Form.Label>Warranty Provider</Form.Label>

        <Form.Control
          name="warranty_provider"
          value={formData.warranty_provider}
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
          {mode === "add" ? "Add Product" : "Update Product"}
        </Button>
      </div>
    </Form>
  );
}
