import { Col, Form, Row } from "react-bootstrap";

export default function CustomerFilter({
  search,
  setSearch,
  status,
  setStatus,
}) {
  return (
    <Row className="mb-3">
      <Col md={8}>
        <Form.Control
          type="text"
          placeholder="Search name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Col>

      <Col md={4}>
        <Form.Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Status</option>

          <option value="ACTIVE">ACTIVE</option>

          <option value="INACTIVE">INACTIVE</option>
        </Form.Select>
      </Col>
    </Row>
  );
}
