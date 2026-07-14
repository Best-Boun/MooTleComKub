import { useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";
import Swal from "sweetalert2";

import customerService from "../../services/customerService";

export default function CustomerForm({ customer, onSuccess, onClose }) {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    status: "ACTIVE",
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        first_name: customer.first_name || "",

        last_name: customer.last_name || "",

        email: customer.email || "",

        phone: customer.phone || "",

        status: customer.status || "ACTIVE",
      });
    }
  }, [customer]);

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
      await customerService.updateCustomer(customer.user_id, formData);

      Swal.fire({
        icon: "success",

        title: "Updated",

        text: "Customer updated successfully",

        timer: 1200,

        showConfirmButton: false,
      });

      onSuccess();

      onClose();
    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",

        title: "Error",

        text: error.response?.data?.message || "Update failed",
      });
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>First Name</Form.Label>

        <Form.Control
          name="first_name"
          value={formData.first_name}
          onChange={handleChange}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Last Name</Form.Label>

        <Form.Control
          name="last_name"
          value={formData.last_name}
          onChange={handleChange}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Email</Form.Label>

        <Form.Control
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Phone</Form.Label>

        <Form.Control
          name="phone"
          value={formData.phone}
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
          Update Customer
        </Button>
      </div>
    </Form>
  );
}
