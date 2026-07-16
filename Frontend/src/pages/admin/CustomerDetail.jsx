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

import customerService from "../../services/customerService";

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [customer, setCustomer] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchCustomerDetail();
  }, [id]);

  const fetchCustomerDetail = async () => {
    try {
      setLoading(true);

      const [customerRes, statsRes, ordersRes] = await Promise.all([
        customerService.getCustomerById(id),
        customerService.getCustomerStatistics(id),
        customerService.getCustomerOrders(id),
      ]);

      setCustomer(customerRes.data);
      setStatistics(statsRes.data);
      setOrders(ordersRes.data);
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

  if (!customer) {
    return (
      <Card className="shadow-sm">
        <Card.Body>
          <h5>Customer not found</h5>

          <Button
            variant="secondary"
            onClick={() => navigate("/admin/customers")}
          >
            Back
          </Button>
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
              <h4 className="fw-bold mb-4">👤 Customer Information</h4>

              <Row className="g-3">
                <Col md={6}>
                  <strong>Full Name</strong>
                  <p>
                    {customer.first_name} {customer.last_name}
                  </p>
                </Col>

                <Col md={6}>
                  <strong>Email</strong>
                  <p>{customer.email}</p>
                </Col>

                <Col md={6}>
                  <strong>Phone</strong>
                  <p>{customer.phone || "-"}</p>
                </Col>

                <Col md={6}>
                  <strong>Status</strong>
                  <p>
                    <Badge
                      bg={
                        customer.status === "ACTIVE" ? "success" : "secondary"
                      }
                    >
                      {customer.status}
                    </Badge>
                  </p>
                </Col>

                <Col md={6}>
                  <strong>Role</strong>
                  <p>
                    {customer.role_id === 1
                      ? "Customer"
                      : customer.role_id === 2
                        ? "Admin"
                        : "Super Admin"}
                  </p>
                </Col>

                <Col md={6}>
                  <strong>Created At</strong>
                  <p>{new Date(customer.created_at).toLocaleDateString()}</p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <h4 className="fw-bold mb-4">📊 Statistics</h4>

              <div className="mb-4">
                <h6>Total Orders</h6>

                <h3 className="text-primary">
                  {statistics?.total_orders || 0}
                </h3>
              </div>

              <div className="mb-4">
                <h6>Total Spending</h6>

                <h3 className="text-success">
                  ฿{Number(statistics?.total_spending || 0).toLocaleString()}
                </h3>
              </div>

              <div>
                <h6>Warranty Claims</h6>

                <h3 className="text-warning">
                  {statistics?.total_claims || 0}
                </h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <h4 className="fw-bold mb-3">📦 Recent Orders</h4>

              <Table striped hover responsive>
                <thead>
                  <tr>
                    <th>Order No.</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th>Date</th>
                    <th width="120">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center">
                        No Orders
                      </td>
                    </tr>
                  ) : (
                    orders.slice(0, 5).map((order) => (
                      <tr key={order.order_id}>
                        <td>{order.order_number}</td>

                        <td>
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
                        </td>

                        <td>฿{Number(order.total_amount).toLocaleString()}</td>

                        <td>
                          {new Date(order.order_date).toLocaleDateString()}
                        </td>

                        <td>
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() =>
                              navigate(`/admin/orders/${order.order_id}`)
                            }
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm border-0">
            <Card.Body>
              

              <Button
                variant="secondary"
                onClick={() => navigate("/admin/customers")}
              >
                ← Back
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
}
   