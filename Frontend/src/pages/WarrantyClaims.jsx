import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

export default function WarrantyClaims() {
  const navigate = useNavigate();

  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await warrantyService.getMyClaims();

        if (!res?.success) {
          throw new Error(res?.message || "โหลดรายการเคลมไม่สำเร็จ");
        }

        setClaims(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
        setError(
          err.response?.data?.message || err.message || "ไม่สามารถโหลดรายการเคลมได้ กรุณาลองใหม่อีกครั้ง",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchClaims();
  }, []);

  return (
    <div className="tck-home">
      <CustomerNavbar />

      <style>{`
        .tck-claims-head {
          max-width: 1100px;
          margin: 0 auto 20px;
        }
        .tck-claims-list {
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .tck-claim-card {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: 14px;
          padding: 18px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          cursor: pointer;
          transition: box-shadow 0.15s ease, transform 0.15s ease;
        }
        .tck-claim-card:hover {
          box-shadow: 0 10px 24px rgba(16, 19, 26, 0.08);
          transform: translateY(-1px);
        }
        .tck-claim-number {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 15.5px;
          margin-bottom: 4px;
        }
        .tck-claim-date {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12.5px;
          color: var(--muted);
        }
        .tck-claim-right {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-shrink: 0;
        }
        .tck-claim-arrow {
          color: var(--muted);
          font-size: 18px;
        }
        @media (max-width: 560px) {
          .tck-claim-card { flex-wrap: wrap; }
          .tck-claim-right { width: 100%; justify-content: space-between; }
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

        .tck-claims-loading {
          text-align: center;
          color: var(--muted);
          padding: 60px 0;
          font-family: 'IBM Plex Mono', monospace;
        }
      `}</style>

      <div className="tck-claims-head">
        <h1 className="tck-title" style={{ fontSize: "clamp(24px, 3.5vw, 32px)" }}>
          รายการเคลมประกัน
        </h1>
        <p className="tck-sub" style={{ margin: 0 }}>
          ตรวจสอบสถานะคำขอเคลมประกันสินค้าของคุณ
        </p>
      </div>

      {loading ? (
        <div className="tck-claims-loading">กำลังโหลด...</div>
      ) : error ? (
        <div className="tck-empty" style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="tck-empty-title">เกิดข้อผิดพลาด</div>
          <div>{error}</div>
        </div>
      ) : claims.length === 0 ? (
        <div className="tck-empty" style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="tck-empty-title">คุณยังไม่เคยยื่นเคลมประกัน</div>
          <div style={{ marginBottom: 16 }}>
            หากสินค้าของคุณมีปัญหาและยังอยู่ในประกัน สามารถยื่นเคลมได้จากหน้ารายละเอียดประกัน
          </div>
          <button type="button" className="tck-cta" onClick={() => navigate("/warranty")}>
            ดูประกันสินค้าของฉัน →
          </button>
        </div>
      ) : (
        <div className="tck-claims-list">
          {claims.map((claim) => (
            <div
              key={claim.claim_id}
              className="tck-claim-card"
              onClick={() => navigate(`/warranty-claims/${claim.claim_id}`)}
            >
              <div>
                <div className="tck-claim-number">#{claim.claim_number}</div>
                <div className="tck-claim-date">
                  {claim.submitted_at ? new Date(claim.submitted_at).toLocaleString("th-TH") : "-"}
                </div>
              </div>

              <div className="tck-claim-right">
                <StatusBadge status={claim.claim_status} />
                <span className="tck-claim-arrow">→</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
