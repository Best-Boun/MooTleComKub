import { Button, Col, Form, Row } from "react-bootstrap";

export default function ProductFilter({
  search,
  setSearch,
  category,
  setCategory,
  status,
  setStatus,
}) {
  return (
    <Row className="mb-4 g-3">
      <Col md={5}>
        <Form.Control
          type="text"
          placeholder="🔍 Search Product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Col>

      <Col md={3}>
        <Form.Select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="Notebook">Notebook</option>
          <option value="Monitor">Monitor</option>
          <option value="Mouse">Mouse</option>
          <option value="Keyboard">Keyboard</option>
        </Form.Select>
      </Col>

      <Col md={2}>
        <Form.Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="INACTIVE">INACTIVE</option>
        </Form.Select>
      </Col>

      <Col md={2}>
        <Button
          variant="secondary"
          className="w-100"
          onClick={() => {
            setSearch("");
            setCategory("");
            setStatus("");
          }}
        >
          Reset
        </Button>
      </Col>
    </Row>
  );
}
