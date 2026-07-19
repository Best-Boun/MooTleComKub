import { Badge, Button, Form, Table } from "react-bootstrap";
import { LockFill } from "react-bootstrap-icons";

export default function OrderTable({
  orders,
  onView,
  onDelete,
  onUpdateStatus,
  allowManage = true,
}) {
  return (
    <Table striped bordered hover responsive>
      <thead className="table-dark">
        <tr>
          <th>#</th>
          <th>Order No.</th>
          <th>Customer</th>
          <th>Total</th>
          <th>Status</th>
          <th>Date</th>
          <th width="180">Action</th>
        </tr>
      </thead>

      <tbody>
        {orders.length === 0 ? (
          <tr>
            <td colSpan="7" className="text-center">
              No Orders Found
            </td>
          </tr>
        ) : (
          orders.map((order, index) => (
            <tr key={order.order_id}>
              <td>{index + 1}</td>

              <td>{order.order_number}</td>

              <td>{order.full_name}</td>

              <td>฿{Number(order.total_amount).toLocaleString()}</td>

              <td style={{ minWidth: "170px" }}>
                {!allowManage ||
                order.order_status === "DELIVERED" ||
                order.order_status === "CANCELLED" ? (
                  <div
                    className="d-flex justify-content-between align-items-center border rounded px-2 py-1 bg-light"
                    style={{ height: "31px" }}
                  >
                    <span>
                      {order.order_status === "DELIVERED"
                        ? "🟢 Delivered"
                        : order.order_status === "CANCELLED"
                          ? "🔴 Cancelled"
                          : order.order_status}
                    </span>

                    <LockFill className="text-secondary" title="Locked" />
                  </div>
                ) : (
                  <Form.Select
                    size="sm"
                    value={order.order_status}
                    onChange={(e) =>
                      onUpdateStatus(order.order_id, e.target.value)
                    }
                  >
                    <option value="PENDING">🟡 Pending</option>
                    <option value="PAID">🔵 Paid</option>
                    <option value="DELIVERED">🟢 Delivered</option>
                    <option value="CANCELLED">🔴 Cancelled</option>
                  </Form.Select>
                )}
              </td>

              <td>{new Date(order.order_date).toLocaleDateString()}</td>

              <td>
                <Button
                  size="sm"
                  variant="info"
                  className="me-2"
                  onClick={() => onView(order)}
                >
                  View
                </Button>

                {allowManage && (
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => onDelete(order.order_id)}
                  >
                    Delete
                  </Button>
                )}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </Table>
  );
}