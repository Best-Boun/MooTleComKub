import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Table,
  Badge,
  Spinner,
  Button,
} from "react-bootstrap";

import orderService from "../../services/orderService";

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);

      const res = await orderService.getOrderById(id);

      setOrder(res.data.order);
      setItems(res.data.items);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (!order) {
    return (
      <Card className="shadow-sm">
        <Card.Body>
          <h5>Order not found</h5>

          <Button onClick={() => navigate(-1)}>Back</Button>
        </Card.Body>
      </Card>
    );
  }

  return (
    <>
      <Row className="mb-4">
        <Col lg={8}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <h4 className="fw-bold mb-4">📦 Order Information</h4>

              <Row className="g-3">
                <Col md={6}>
                  <strong>Order Number</strong>
                  <p>{order.order_number}</p>
                </Col>

                <Col md={6}>
                  <strong>Customer</strong>
                  <p>{order.full_name}</p>
                </Col>

                <Col md={6}>
                  <strong>Email</strong>
                  <p>{order.email}</p>
                </Col>

                <Col md={6}>
                  <strong>Status</strong>
                  <p>
                    <Badge
                      bg={
                        order.order_status === "DELIVERED"
                          ? "success"
                          : order.order_status === "PENDING"
                            ? "warning"
                            : order.order_status === "PAID"
                              ? "primary"
                              : "secondary"
                      }
                    >
                      {order.order_status}
                    </Badge>
                  </p>
                </Col>

                <Col md={6}>
                  <strong>Payment Method</strong>
                  <p>
                    {order.payment_method ? (
                      order.payment_method === "CREDIT_CARD" ? (
                        "💳 Credit Card"
                      ) : order.payment_method === "PROMPTPAY" ? (
                        "📱 PromptPay"
                      ) : order.payment_method === "BANK_TRANSFER" ? (
                        "🏦 Bank Transfer"
                      ) : (
                        order.payment_method
                      )
                    ) : (
                      <span className="text-muted">Waiting for Payment</span>
                    )}
                  </p>
                </Col>

                <Col md={6}>
                  <strong>Order Date</strong>
                  <p>
                    {new Date(order.order_date).toLocaleDateString("th-TH")}
                  </p>
                </Col>

                <Col md={6}>
                  <strong>Order Time</strong>
                  <p>
                    {new Date(order.order_date).toLocaleTimeString("th-TH", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    น.
                  </p>
                </Col>

                {/* <Col md={6}>
                  <strong>Transaction ID</strong>
                  <p>{order.transaction_id || "-"}</p>
                </Col> */}

                {/* <Col md={6}>
                  <strong>Total Amount</strong>
                  <p className="fw-bold text-success">
                    ฿{Number(order.total_amount).toLocaleString()}
                  </p>
                </Col> */}
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <h4 className="fw-bold mb-4">🚚 Shipping</h4>

              <p>
                <strong>Name</strong>
                <br />
                {order.shipping_name}
              </p>

              <p>
                <strong>Phone</strong>
                <br />
                {order.shipping_phone}
              </p>

              <p>
                <strong>Address</strong>
                <br />
                {order.shipping_address}
                <br />
                {order.shipping_subdistrict}, {order.shipping_district}
                <br />
                {order.shipping_province} {order.shipping_postal_code}
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Card className="shadow-sm border-0">
        <Card.Body>
          <h4 className="fw-bold mb-3">🛒 Order Items</h4>

          <Table striped hover responsive>
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Product</th>
                <th width="120">Qty</th>
                <th width="150">Unit Price</th>
                <th width="150">Subtotal</th>
              </tr>
            </thead>

            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center">
                    No Products
                  </td>
                </tr>
              ) : (
                items.map((item, index) => (
                  <tr key={item.order_item_id}>
                    <td>{index + 1}</td>

                    <td>{item.product_name}</td>

                    <td>{item.quantity}</td>

                    <td>฿{Number(item.unit_price).toLocaleString()}</td>

                    <td className="fw-bold">
                      ฿{Number(item.subtotal).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>

          <div className="d-flex justify-content-between align-items-center mt-4">
            <Button variant="secondary" onClick={() => navigate(-1)}>
              ← Back
            </Button>

            <h4 className="text-success mb-0">
              Total : ฿{Number(order.total_amount).toLocaleString()}
            </h4>
          </div>
        </Card.Body>
      </Card>
    </>
  );
}