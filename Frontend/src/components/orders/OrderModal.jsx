import { useEffect, useState } from "react";
import { Badge, Button, Modal, Table, Form } from "react-bootstrap";
import Swal from "sweetalert2";

import orderService from "../../services/orderService";

export default function OrderDetailModal({ show, onHide, order, onSuccess }) {
  const [detail, setDetail] = useState(null);
  const [status, setStatus] = useState("");

  const fetchDetail = async () => {
    try {
      if (!order) return;

      const res = await orderService.getOrderById(order.order_id);

      setDetail(res.data);
      setStatus(res.data.order.order_status);
    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load order detail",
      });
    }
  };

  useEffect(() => {
    if (show) {
      fetchDetail();
    }
  }, [show, order]);

  const handleUpdateStatus = async () => {
    try {
      await orderService.updateOrderStatus(order.order_id, status);

      Swal.fire({
        icon: "success",
        title: "Updated",
        text: "Order status updated",
        timer: 1200,
        showConfirmButton: false,
      });

      onSuccess();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Update failed",
      });
    }
  };

  if (!detail) return null;

  const { order: orderData, items } = detail;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Order Detail</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <h5 className="fw-bold">Order #{orderData.order_number}</h5>

        <p>
          <b>Customer:</b> {orderData.full_name}
        </p>

        <p>
          <b>Email:</b> {orderData.email}
        </p>

        <p>
          <b>Shipping:</b> {orderData.shipping_address}
        </p>

        <p>
          <b>Total:</b> ฿{Number(orderData.total_amount).toLocaleString()}
        </p>

        <p>
          <b>Status:</b> <Badge bg="primary">{orderData.order_status}</Badge>
        </p>

        <hr />

        <h5>Products</h5>

        <Table bordered hover>
          <thead className="table-dark">
            <tr>
              <th>Product</th>

              <th>Quantity</th>

              <th>Price</th>

              <th>Subtotal</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item) => (
              <tr key={item.order_item_id}>
                <td>{item.product_name}</td>

                <td>{item.quantity}</td>

                <td>฿{Number(item.unit_price).toLocaleString()}</td>

                <td>฿{Number(item.subtotal).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </Table>

        <hr />

        <Form.Group>
          <Form.Label>Update Status</Form.Label>

          <Form.Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="PENDING">PENDING</option>

            <option value="PAID">PAID</option>

            <option value="SHIPPED">SHIPPED</option>

            <option value="DELIVERED">DELIVERED</option>

            <option value="CANCELLED">CANCELLED</option>
          </Form.Select>
        </Form.Group>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>

        <Button variant="primary" onClick={handleUpdateStatus}>
          Update Status
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
