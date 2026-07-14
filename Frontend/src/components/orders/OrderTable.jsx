import { Badge, Button, Table } from "react-bootstrap";

export default function OrderTable({ orders, onView, onDelete }) {
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

              <td>
                <Badge
                  bg={
                    order.order_status === "DELIVERED"
                      ? "success"
                      : order.order_status === "PENDING"
                        ? "warning"
                        : order.order_status === "CANCELLED"
                          ? "danger"
                          : "primary"
                  }
                >
                  {order.order_status}
                </Badge>
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

                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => onDelete(order.order_id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </Table>
  );
}
