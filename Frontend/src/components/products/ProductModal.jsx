import { Modal } from "react-bootstrap";
import ProductForm from "./ProductForm";

export default function ProductModal({ show, handleClose, onSubmit }) {
  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Add Product</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <ProductForm onSubmit={onSubmit} handleClose={handleClose} />
      </Modal.Body>
    </Modal>
  );
}
