import { useEffect, useState } from "react";
import { Badge, Button, Form, Modal } from "react-bootstrap";
import Swal from "sweetalert2";

import warrantyClaimAdminService from "../../services/warrantyClaimAdminService";

const STATUS_BADGE = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "danger",
  COMPLETED: "secondary",
};

export default function WarrantyClaimDetailModal({ show, onHide, claim, onSuccess }) {
  const [status, setStatus] = useState("");
  const [adminRemark, setAdminRemark] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (show && claim) {
      setStatus(claim.claim_status || "PENDING");
      setAdminRemark(claim.admin_remark || "");
    }
  }, [show, claim]);

  const handleUpdateStatus = async () => {
    try {
      setUpdating(true);

      await warrantyClaimAdminService.updateClaimStatus(claim.claim_id, status, adminRemark);

      Swal.fire({
        icon: "success",
        title: "Updated",
        timer: 1000,
        showConfirmButton: false,
      });

      onSuccess();
    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: error.response?.data?.message || "Something went wrong",
      });
    } finally {
      setUpdating(false);
    }
  };

  if (!claim) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Warranty Claim Detail</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <h5>Claim #{claim.claim_number}</h5>

        <p>
          <b>Status:</b> <Badge bg={STATUS_BADGE[claim.claim_status] || "primary"}>{claim.claim_status}</Badge>
        </p>

        <p>
          <b>Problem Description:</b>
          <br />
          {claim.problem_description || "-"}
        </p>

        <hr />

        <h5>Warranty Info</h5>

        <p>
          <b>Serial Number:</b> {claim.serial_number || "-"}
        </p>
        <p>
          <b>Warranty Provider:</b> {claim.warranty_provider || "-"}
        </p>
        <p>
          <b>Warranty Period:</b>{" "}
          {claim.warranty_start_date ? new Date(claim.warranty_start_date).toLocaleDateString() : "-"}
          {" - "}
          {claim.warranty_end_date ? new Date(claim.warranty_end_date).toLocaleDateString() : "-"}
        </p>
        <p>
          <b>Warranty Status:</b> {claim.warranty_status || "-"}
        </p>

        <hr />

        <p>
          <b>Submitted At:</b>{" "}
          {claim.submitted_at ? new Date(claim.submitted_at).toLocaleString() : "-"}
        </p>

        {claim.completed_at && (
          <p>
            <b>Completed At:</b> {new Date(claim.completed_at).toLocaleString()}
          </p>
        )}

        {claim.admin_remark && (
          <p>
            <b>Current Admin Remark:</b> {claim.admin_remark}
          </p>
        )}

        <hr />

        <Form.Group className="mb-3">
          <Form.Label>Update Status</Form.Label>

          <Form.Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="PENDING">PENDING</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
            <option value="COMPLETED">COMPLETED</option>
          </Form.Select>
        </Form.Group>

        <Form.Group>
          <Form.Label>Admin Remark</Form.Label>

          <Form.Control
            as="textarea"
            rows={3}
            placeholder="เขียนหมายเหตุประกอบการอนุมัติ/ปฏิเสธ..."
            value={adminRemark}
            onChange={(e) => setAdminRemark(e.target.value)}
          />
        </Form.Group>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>

        <Button variant="primary" onClick={handleUpdateStatus} disabled={updating}>
          {updating ? "Updating..." : "Update Status"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
