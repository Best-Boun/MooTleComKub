import { Badge, Button, Table } from "react-bootstrap";

export default function CustomerTable({
  customers,
  onView,
  onEdit,
  onDelete,
  allowManage = true,
}) {
  return (
    <Table striped bordered hover responsive>
      <thead className="table-dark">
        <tr>
          <th width="70">#</th>
          <th>Name</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Status</th>
          <th width="240">Action</th>
        </tr>
      </thead>

      <tbody>
        {customers.length === 0 ? (
          <tr>
            <td colSpan="6" className="text-center">
              No Customers Found
            </td>
          </tr>
        ) : (
          customers.map((customer, index) => (
            <tr key={customer.user_id}>
              <td>{index + 1}</td>

              <td>
                {customer.first_name} {customer.last_name}
              </td>

              <td>{customer.email}</td>

              <td>{customer.phone || "-"}</td>

              <td>
                <Badge
                  bg={customer.status === "ACTIVE" ? "success" : "secondary"}
                >
                  {customer.status}
                </Badge>
              </td>

              <td>
                <Button
                  size="sm"
                  variant="info"
                  className="me-2"
                  onClick={() => onView(customer)}
                >
                  <i className="bi bi-eye"></i> View
                </Button>

                {allowManage && (
                  <>
                    <Button
                      size="sm"
                      variant="warning"
                      className="me-2"
                      onClick={() => onEdit(customer)}
                    >
                      Edit
                    </Button>

                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => onDelete(customer.user_id)}
                    >
                      Delete
                    </Button>
                  </>
                )}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </Table>
  );
}