import { Badge, Button, Table } from "react-bootstrap";

export default function CategoryTable({ categories, onDelete, onEdit }) {
  return (
    <Table striped bordered hover responsive>
      <thead className="table-dark">
        <tr>
          <th width="70">#</th>
          <th>Category Name</th>
          <th>Description</th>
          <th width="120">Status</th>
          <th width="170">Action</th>
        </tr>
      </thead>

      <tbody>
        {categories.length === 0 ? (
          <tr>
            <td colSpan="5" className="text-center">
              No Categories Found
            </td>
          </tr>
        ) : (
          categories.map((category, index) => (
            <tr key={category.category_id}>
              <td>{index + 1}</td>

              <td>{category.category_name}</td>

              <td>{category.description}</td>

              <td>
                <Badge
                  bg={category.status === "ACTIVE" ? "success" : "secondary"}
                >
                  {category.status}
                </Badge>
              </td>

              <td>
                <Button
                  size="sm"
                  variant="warning"
                  className="me-2"
                  onClick={() => onEdit(category)}
                >
                  Edit
                </Button>

                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => onDelete(category.category_id)}
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
