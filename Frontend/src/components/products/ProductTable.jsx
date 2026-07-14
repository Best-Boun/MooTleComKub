import { Badge, Button, Table } from "react-bootstrap";

export default function ProductTable({ products, onDelete, onEdit }) {
  return (
    <Table striped bordered hover responsive>
      <thead className="table-dark">
        <tr>
          <th>#</th>
          <th>Image</th>
          <th>Name</th>
          <th>Brand</th>
          <th>Category</th>
          <th>Price</th>
          <th>Stock</th>
          <th>Status</th>
          <th width="170">Action</th>
        </tr>
      </thead>

      <tbody>
        {products.length === 0 ? (
          <tr>
            <td colSpan="9" className="text-center">
              No Products Found
            </td>
          </tr>
        ) : (
          products.map((product, index) => (
            <tr key={product.product_id}>
              <td>{index + 1}</td>

              <td>
                <img
                  src={
                    product.image || "https://placehold.co/60x60?text=No+Image"
                  }
                  alt={product.product_name}
                  width="60"
                  height="60"
                  style={{ objectFit: "cover" }}
                />
              </td>

              <td>{product.product_name}</td>

              <td>{product.brand_name}</td>

              <td>{product.category_name}</td>

              <td>฿{Number(product.price).toLocaleString()}</td>

              <td>{product.stock}</td>

              <td>
                <Badge
                  bg={product.status === "ACTIVE" ? "success" : "secondary"}
                >
                  {product.status}
                </Badge>
              </td>

              <td>
                <Button
                  size="sm"
                  variant="warning"
                  className="me-2"
                  onClick={() => onEdit(product)}
                >
                  Edit
                </Button>

                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => onDelete(product.product_id)}
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
