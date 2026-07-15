import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import warrantyService from "../services/warrantyService";
import CustomerNavbar from "../components/layout/CustomerNavbar";
import "../styles/tckTheme.css";

const STATUS_LABEL = {
  PENDING: "รอตรวจสอบ",
  APPROVED: "อนุมัติแล้ว",
  REJECTED: "ถูกปฏิเสธ",
  COMPLETED: "เสร็จสิ้น",
};

function StatusBadge({ status }) {
  return (
    <span className={`tck-claim-status tck-claim-status-${(status || "").toLowerCase()}`}>
      {STATUS_LABEL[status] || status || "-"}
    </span>
  );
}

export default function WarrantyClaimDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchClaim = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await warrantyService.getClaimById(id);

        if (!isMounted) return;

        if (!res?.success || !res?.data) {
          setError("ไม่พบคำขอเคลมนี้ หรือคุณไม่มีสิทธิ์เข้าถึง");
          return;
        }

        setClaim(res.data);
      } catch (err) {
        console.error(err);
        if (!isMounted) return;
        setError(
          err.response?.data?.message || "ไม่สามารถโหลดคำขอเคลมนี้ได้ กรุณาลองใหม่อีกครั้ง",
        );
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchClaim();

    return () => {
      isMounted = false;
    };
  }, [id]);

  return (
    <div className="tck-home">
      <CustomerNavbar />

      <style>{`
        .tck-claim-detail-head {
          max-width: 700px;
          margin: 0 auto 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }
        .tck-claim-detail-back {
          background: transparent;
          border: 1px solid var(--line);
          color: var(--ink);
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12.5px;
          padding: 7px 12px;
          border-radius: 8px;
          cursor: pointer;
          margin-bottom: 14px;
        }
        .tck-claim-detail-back:hover { border-color: var(--accent); color: var(--accent); }

        .tck-claim-detail-panel {
          max-width: 700px;
          margin: 0 auto;
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: 16px;
          padding: 26px;
        }

        .tck-claim-status {
          display: inline-flex;
          align-items: center;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
          font-weight: 600;
          padding: 5px 10px;
          border-radius: 20px;
          white-space: nowrap;
        }
        .tck-claim-status-pending {
          background: rgba(98, 108, 122, 0.12);
          color: var(--muted);
        }
        .tck-claim-status-approved {
          background: rgba(0, 208, 132, 0.14);
          color: #00895a;
        }
        .tck-claim-status-rejected {
          background: rgba(229, 72, 77, 0.12);
          color: var(--danger);
        }
        .tck-claim-status-completed {
          background: var(--ink);
          color: #fff;
        }

        .tck-claim-detail-list { margin-top: 18px; }

        .tck-claim-note-box {
          margin-top: 20px;
          padding: 14px 16px;
          background: #F6F8FB;
          border: 1px solid var(--line);
          border-radius: 10px;
          font-size: 13.5px;
          color: var(--muted);
        }
        .tck-claim-remark-box {
          margin-top: 20px;
          padding: 14px 16px;
          border-radius: 10px;
          font-size: 13.5px;
        }
        .tck-claim-remark-box.approved {
          background: rgba(0, 208, 132, 0.08);
          border: 1px solid rgba(0, 208, 132, 0.3);
        }
        .tck-claim-remark-box.rejected {
          background: rgba(229, 72, 77, 0.08);
          border: 1px solid rgba(229, 72, 77, 0.3);
        }
        .tck-claim-remark-box.other {
          background: #F6F8FB;
          border: 1px solid var(--line);
        }
        .tck-claim-remark-label {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 13px;
          margin-bottom: 4px;
        }

        .tck-claim-detail-loading {
          text-align: center;
          color: var(--muted);
          padding: 60px 0;
          font-family: 'IBM Plex Mono', monospace;
        }
      `}</style>

      <div className="tck-claim-detail-head">
        <div>
          <button type="button" className="tck-claim-detail-back" onClick={() => navigate("/warranty-claims")}>
            ← กลับไปหน้ารายการเคลม
          </button>
          <h1 className="tck-title" style={{ fontSize: "clamp(22px, 3vw, 30px)", margin: 0 }}>
            {claim?.claim_number ? `เคลม #${claim.claim_number}` : "รายละเอียดคำขอเคลม"}
          </h1>
        </div>
        {claim && <StatusBadge status={claim.claim_status} />}
      </div>

      {loading ? (
        <div className="tck-claim-detail-loading">กำลังโหลด...</div>
      ) : error ? (
        <div className="tck-empty" style={{ maxWidth: 700, margin: "0 auto" }}>
          <div className="tck-empty-title">เกิดข้อผิดพลาด</div>
          <div style={{ marginBottom: 16 }}>{error}</div>
          <button type="button" className="tck-cta" onClick={() => navigate("/warranty-claims")}>
            กลับไปหน้ารายการเคลม →
          </button>
        </div>
      ) : (
        <div className="tck-claim-detail-panel">
          <div className="tck-spec-list tck-claim-detail-list">
            <div className="tck-spec-row">
              <span className="tck-spec-mark tck-mono">DATE</span>
              <span className="tck-spec-text">
                {claim?.submitted_at ? new Date(claim.submitted_at).toLocaleString("th-TH") : "-"}
              </span>
            </div>
            <div className="tck-spec-row">
              <span className="tck-spec-mark tck-mono">ISSUE</span>
              <span className="tck-spec-text">{claim?.problem_description || "-"}</span>
            </div>
            {claim?.claim_status === "COMPLETED" && claim?.completed_at && (
              <div className="tck-spec-row">
                <span className="tck-spec-mark tck-mono">DONE</span>
                <span className="tck-spec-text">
                  {new Date(claim.completed_at).toLocaleString("th-TH")}
                </span>
              </div>
            )}
          </div>

          {claim?.claim_status === "PENDING" && (
            <div className="tck-claim-note-box">กำลังรอการตรวจสอบจากทีมงาน</div>
          )}

          {claim?.admin_remark && (
            <div
              className={`tck-claim-remark-box ${
                claim.claim_status === "APPROVED"
                  ? "approved"
                  : claim.claim_status === "REJECTED"
                    ? "rejected"
                    : "other"
              }`}
            >
              <div className="tck-claim-remark-label">หมายเหตุจากทีมงาน</div>
              <div>{claim.admin_remark}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
