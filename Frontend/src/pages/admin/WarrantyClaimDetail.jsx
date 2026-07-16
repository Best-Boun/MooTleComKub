import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, Row, Col, Badge, Spinner, Button, Form } from "react-bootstrap";
import Swal from "sweetalert2";

import warrantyClaimAdminService from "../../services/warrantyClaimAdminService";

export default function WarrantyClaimDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [claim, setClaim] = useState(null);

  const [status, setStatus] = useState("");
  const [remark, setRemark] = useState("");

  useEffect(() => {
    fetchClaim();
  }, [id]);

  const fetchClaim = async () => {
    try {
      setLoading(true);

      const res = await warrantyClaimAdminService.getClaimById(id);

      setClaim(res.data);

      setStatus(res.data.claim_status);
      setRemark(res.data.admin_remark || "");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await warrantyClaimAdminService.updateClaimStatus(id, status, remark);

      Swal.fire({
        icon: "success",
        title: "Updated",
        text: "Claim updated successfully",
        timer: 1200,
        showConfirmButton: false,
      });

      fetchClaim();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: error.response?.data?.message || "Something went wrong",
      });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (!claim) {
    return (
      <Card className="shadow-sm">
        <Card.Body>
          <h5>Claim not found</h5>

          <Button onClick={() => navigate(-1)}>Back</Button>
        </Card.Body>
      </Card>
    );
  }

  return (
    <>
      <Row className="mb-4">
        <Col lg={8}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <h4 className="fw-bold mb-4">🛡 Warranty Claim Information</h4>

              <Row className="g-3">
                <Col md={6}>
                  <strong>Claim Number</strong>
                  <p>{claim.claim_number}</p>
                </Col>

                <Col md={6}>
                  <strong>Customer</strong>
                  <p>
                    {claim.first_name} {claim.last_name}
                  </p>
                </Col>

                <Col md={6}>
                  <strong>Email</strong>
                  <p>{claim.email}</p>
                </Col>

                <Col md={6}>
                  <strong>Product</strong>
                  <p>{claim.product_name}</p>
                </Col>

                <Col md={6}>
                  <strong>Serial Number</strong>
                  <p>{claim.serial_number}</p>
                </Col>

                <Col md={6}>
                  <strong>Warranty Provider</strong>
                  <p>{claim.warranty_provider || "-"}</p>
                </Col>

                <Col md={6}>
                  <strong>Warranty Start</strong>
                  <p>
                    {new Date(claim.warranty_start_date).toLocaleDateString()}
                  </p>
                </Col>

                <Col md={6}>
                  <strong>Warranty End</strong>
                  <p>
                    {new Date(claim.warranty_end_date).toLocaleDateString()}
                  </p>
                </Col>

                <Col xs={12}>
                  <strong>Problem Description</strong>

                  <Card className="bg-light mt-2">
                    <Card.Body>{claim.problem_description}</Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <h4 className="fw-bold mb-4">⚙ Claim Status</h4>

              <p>
                <Badge
                  bg={
                    status === "PENDING"
                      ? "warning"
                      : status === "APPROVED"
                        ? "primary"
                        : status === "COMPLETED"
                          ? "success"
                          : "danger"
                  }
                >
                  {status}
                </Badge>
              </p>

              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>

                <Form.Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="PENDING">PENDING</option>

                  <option value="APPROVED">APPROVED</option>

                  <option value="REJECTED">REJECTED</option>

                  <option value="COMPLETED">COMPLETED</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Admin Remark</Form.Label>

                <Form.Control
                  as="textarea"
                  rows={4}
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                />
              </Form.Group>

              <div className="d-grid gap-2">
                <Button variant="success" onClick={handleSave}>
                  Save Changes
                </Button>

                <Button variant="secondary" onClick={() => navigate(-1)}>
                  ← Back
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
}
