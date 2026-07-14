import { Modal } from "react-bootstrap";
import CategoryForm from "./CategoryForm";

export default function CategoryModal({
  show,
  onHide,
  mode,
  category,
  onSuccess,
}) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {mode === "add" ? "Add Category" : "Edit Category"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <CategoryForm
          mode={mode}
          category={category}
          onSuccess={onSuccess}
          onClose={onHide}
        />
      </Modal.Body>
    </Modal>
  );
}
