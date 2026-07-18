import { Modal } from "react-bootstrap";
import ProductForm from "./ProductForm";

export default function ProductModal({
  show,
  onHide,
  mode,
  product,
  categories,
  onSuccess,
  onSkuMatch,
}) {
  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {mode === "add" ? "Add Product" : "Edit Product"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <ProductForm
          mode={mode}
          product={product}
          categories={categories}
          onSuccess={onSuccess}
          onClose={onHide}
          onSkuMatch={onSkuMatch}
        />
      </Modal.Body>
    </Modal>
  );
}
