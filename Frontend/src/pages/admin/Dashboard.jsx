import { Card, Col, Row, Table, Badge, ProgressBar } from "react-bootstrap";

// ================= Mock Data (สรุปภาพรวมของทุกหน้า ยกเว้น Reports) =================
const summaryCards = [
  {
    label: "Categories",
    value: 12,
    icon: "bi-grid",
    color: "primary",
    hint: "+2 this month",
  },
  {
    label: "Products",
    value: 148,
    icon: "bi-box-seam",
    color: "success",
    hint: "+9 this month",
  },
  {
    label: "Orders",
    value: 356,
    icon: "bi-receipt",
    color: "warning",
    hint: "+27 this week",
  },
  {
    label: "Customers",
    value: 512,
    icon: "bi-people",
    color: "info",
    hint: "+14 this week",
  },
  {
    label: "Admin Accounts",
    value: 6,
    icon: "bi-person-badge",
    color: "danger",
    hint: "1 inactive",
  },
];

const weeklySales = [
  { day: "Mon", amount: 12000 },
  { day: "Tue", amount: 18500 },
  { day: "Wed", amount: 9800 },
  { day: "Thu", amount: 22300 },
  { day: "Fri", amount: 27600 },
  { day: "Sat", amount: 31200 },
  { day: "Sun", amount: 20400 },
];
const maxSales = Math.max(...weeklySales.map((d) => d.amount));

const orderStatusBreakdown = [
  { status: "Completed", count: 210, percent: 59, variant: "success" },
  { status: "Processing", count: 84, percent: 24, variant: "warning" },
  { status: "Pending", count: 42, percent: 12, variant: "secondary" },
  { status: "Cancelled", count: 20, percent: 5, variant: "danger" },
];

const recentOrders = [
  { id: 1024, customer: "Somchai P.", amount: 2590, status: "Completed", date: "2026-07-14" },
  { id: 1023, customer: "Malee W.", amount: 1290, status: "Processing", date: "2026-07-14" },
  { id: 1022, customer: "Anan T.", amount: 4590, status: "Pending", date: "2026-07-13" },
  { id: 1021, customer: "Nok S.", amount: 890, status: "Completed", date: "2026-07-13" },
  { id: 1020, customer: "Ploy K.", amount: 3200, status: "Cancelled", date: "2026-07-12" },
];

const lowStockProducts = [
  { name: "MSI", category: "Laptop", stock: 4 },
  { name: "MAC", category: "Laptop", stock: 6 },
  { name: "Dell", category: "Laptop", stock: 2 },
  { name: "Asus", category: "Laptop", stock: 5 },
];

const statusVariant = {
  Completed: "success",
  Processing: "warning",
  Pending: "secondary",
  Cancelled: "danger",
};

export default function Dashboard() {
  return (
    <div>
      <div className="mb-4">
        <h2 className="mb-1">Dashboard</h2>
        <p className="text-muted mb-0">
          สรุปภาพรวมข้อมูลของระบบ (Categories, Products, Orders, Customers, Admin
          Accounts) — ข้อมูลตัวอย่าง (Mock Data)
        </p>
      </div>

      {/* ============ Summary Cards ============ */}
      <Row className="g-3 mb-4">
        {summaryCards.map((card) => (
          <Col key={card.label} xs={12} sm={6} lg={3}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Body className="d-flex align-items-center gap-3">
                <div
                  className={`d-flex align-items-center justify-content-center rounded-circle bg-${card.color} bg-opacity-25 text-${card.color}`}
                  style={{ width: 48, height: 48, fontSize: 22 }}
                >
                  <i className={`bi ${card.icon}`}></i>
                </div>
                <div>
                  <div className="text-muted small">{card.label}</div>
                  <div className="fs-4 fw-bold">{card.value.toLocaleString()}</div>
                  <div className="text-muted small">{card.hint}</div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row className="g-3 mb-4">
        {/* ============ Weekly Sales (mock bar chart) ============ */}
        <Col lg={7}>
          <Card className="h-100 shadow-sm border-0">
            <Card.Body>
              <Card.Title className="mb-3">Weekly Sales Overview</Card.Title>
              <div className="d-flex align-items-end gap-3" style={{ height: 180 }}>
                {weeklySales.map((d) => (
                  <div
                    key={d.day}
                    className="d-flex flex-column align-items-center flex-fill"
                  >
                    <div
                      className="bg-primary rounded-top w-100"
                      style={{
                        height: `${(d.amount / maxSales) * 140}px`,
                      }}
                      title={`฿${d.amount.toLocaleString()}`}
                    ></div>
                    <small className="text-muted mt-2">{d.day}</small>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* ============ Order Status Breakdown ============ */}
        <Col lg={5}>
          <Card className="h-100 shadow-sm border-0">
            <Card.Body>
              <Card.Title className="mb-3">Order Status Breakdown</Card.Title>
              {orderStatusBreakdown.map((item) => (
                <div className="mb-3" key={item.status}>
                  <div className="d-flex justify-content-between small mb-1">
                    <span>{item.status}</span>
                    <span className="text-muted">{item.count} orders</span>
                  </div>
                  <ProgressBar
                    now={item.percent}
                    variant={item.variant}
                    label={`${item.percent}%`}
                  />
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-3">
        {/* ============ Recent Orders ============ */}
        <Col lg={7}>
          <Card className="h-100 shadow-sm border-0">
            <Card.Body>
              <Card.Title className="mb-3">Recent Orders</Card.Title>
              <Table striped bordered hover responsive size="sm">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{order.customer}</td>
                      <td>฿{order.amount.toLocaleString()}</td>
                      <td>
                        <Badge bg={statusVariant[order.status]}>{order.status}</Badge>
                      </td>
                      <td>{order.date}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        {/* ============ Low Stock Products ============ */}
        <Col lg={5}>
          <Card className="h-100 shadow-sm border-0">
            <Card.Body>
              <Card.Title className="mb-3">Low Stock Products</Card.Title>
              <Table striped bordered hover responsive size="sm">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockProducts.map((product) => (
                    <tr key={product.name}>
                      <td>{product.name}</td>
                      <td>{product.category}</td>
                      <td>
                        <Badge bg={product.stock <= 3 ? "danger" : "warning"}>
                          {product.stock}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
