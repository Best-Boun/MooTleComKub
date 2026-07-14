import { Modal } from "react-bootstrap";
import CustomerForm from "./CustomerForm";

export default function CustomerModal({ show, onHide, customer, onSuccess }) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Customer</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <CustomerForm
          customer={customer}
          onSuccess={onSuccess}
          onClose={onHide}
        />
      </Modal.Body>
    </Modal>
  );
}
