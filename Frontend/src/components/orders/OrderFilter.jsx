import { Col, Form, Row } from "react-bootstrap";

export default function OrderFilter({ search, setSearch, status, setStatus }) {
  return (
    <Row className="mb-3">
      <Col md={8}>
        <Form.Control
          type="text"
          placeholder="Search Order Number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Col>

      <Col md={4}>
        <Form.Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="PENDING">PENDING</option>
          <option value="PAID">PAID</option>
          <option value="SHIPPED">SHIPPED</option>
          <option value="DELIVERED">DELIVERED</option>
          <option value="CANCELLED">CANCELLED</option>
        </Form.Select>
      </Col>
    </Row>
  );
}
