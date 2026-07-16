import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Button, Card, Form, Spinner, Table } from "react-bootstrap";
import Swal from "sweetalert2";

import warrantyClaimAdminService from "../../services/warrantyClaimAdminService";

import CustomPagination from "../../components/common/Pagination";

const STATUS_BADGE = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "danger",
  COMPLETED: "secondary",
};

export default function WarrantyClaims() {

  const navigate = useNavigate();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  const [status, setStatus] = useState("");



  const [currentPage, setCurrentPage] = useState(1);
  const claimsPerPage = 10;

  // โหลด Warranty Claims
  const fetchClaims = async () => {
    try {
      setLoading(true);

      const res = await warrantyClaimAdminService.getAllClaims();

      setClaims(res.data);
    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load warranty claims",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  // เปิดรายละเอียด
  const handleView = (claim) => {
    navigate(`/admin/warranty-claims/${claim.claim_id}`);
  };

  // Filter
  const filteredClaims = claims.filter((claim) => {
    return status === "" || claim.claim_status === status;
  });

  // Pagination
  const indexOfLast = currentPage * claimsPerPage;
  const indexOfFirst = indexOfLast - claimsPerPage;
  const currentClaims = filteredClaims.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredClaims.length / claimsPerPage);

  return (
    <>
      <Card className="shadow-sm border-0">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="fw-bold mb-0">Warranty Claims</h3>
          </div>

          <Form.Group className="mb-3" style={{ maxWidth: 240 }}>
            <Form.Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="PENDING">PENDING</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
              <option value="COMPLETED">COMPLETED</option>
            </Form.Select>
          </Form.Group>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
            </div>
          ) : (
            <>
              <Table striped bordered hover responsive>
                <thead className="table-dark">
                  <tr>
                    <th>#</th>
                    <th>Claim No.</th>
                    <th>Serial Number</th>
                    <th>Order Item</th>
                    <th>Status</th>
                    <th>Submitted At</th>
                    <th width="120">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {currentClaims.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center">
                        No Warranty Claims Found
                      </td>
                    </tr>
                  ) : (
                    currentClaims.map((claim, index) => (
                      <tr key={claim.claim_id}>
                        <td>{index + 1}</td>
                        <td>{claim.claim_number}</td>
                        <td>{claim.serial_number || "-"}</td>
                        <td>#{claim.order_item_id ?? "-"}</td>
                        <td>
                          <Badge
                            bg={STATUS_BADGE[claim.claim_status] || "primary"}
                          >
                            {claim.claim_status}
                          </Badge>
                        </td>
                        <td>
                          {claim.submitted_at
                            ? new Date(claim.submitted_at).toLocaleDateString()
                            : "-"}
                        </td>
                        <td>
                          <Button
                            size="sm"
                            variant="info"
                            onClick={() => handleView(claim)}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>

              <CustomPagination
                currentPage={currentPage}
                totalPages={totalPages}
                setCurrentPage={setCurrentPage}
              />
            </>
          )}
        </Card.Body>
      </Card>

      
    </>
  );
}
