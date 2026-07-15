import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import warrantyService from "../services/warrantyService";
import productService from "../services/productService";
import CustomerNavbar from "../components/layout/CustomerNavbar";
import "../styles/tckTheme.css";

const STATUS_LABEL = {
  ACTIVE: "ใช้งานได้",
  EXPIRED: "หมดอายุ",
  CLAIMED: "เคลมแล้ว",
};

function StatusBadge({ status }) {
  return (
    <span className={`tck-wty-status tck-wty-status-${(status || "").toLowerCase()}`}>
      {STATUS_LABEL[status] || status || "-"}
    </span>
  );
}

export default function WarrantyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [warranty, setWarranty] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchWarranty = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await warrantyService.getWarrantyById(id);

        if (!isMounted) return;

        if (!res?.success || !res?.data) {
          setError("ไม่พบประกันนี้ หรือคุณไม่มีสิทธิ์เข้าถึง");
          return;
        }

        setWarranty(res.data);

        if (res.data.product_id) {
          try {
            const productRes = await productService.getProductById(res.data.product_id);
            if (isMounted && productRes?.success) {
              setProduct(productRes.data);
            }
          } catch {
            // ไม่กระทบหน้าหลักถ้าดึงข้อมูลสินค้าไม่สำเร็จ
          }
        }
      } catch (err) {
        console.error(err);
        if (!isMounted) return;
        setError(
          err.response?.data?.message || "ไม่สามารถโหลดข้อมูลประกันนี้ได้ กรุณาลองใหม่อีกครั้ง",
        );
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchWarranty();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const now = new Date();
  const endDate = warranty?.warranty_end_date ? new Date(warranty.warranty_end_date) : null;
  const isExpired = endDate ? now > endDate : false;
  const canClaim = warranty?.warranty_status === "ACTIVE" && !isExpired;

  let claimBlockedReason = "";
  if (warranty && !canClaim) {
    if (isExpired) {
      claimBlockedReason = "ประกันสินค้านี้หมดอายุแล้ว ไม่สามารถยื่นเคลมได้";
    } else if (warranty.warranty_status === "CLAIMED") {
      claimBlockedReason = "ประกันสินค้านี้ถูกเคลมไปแล้ว";
    } else {
      claimBlockedReason = "ประกันสินค้านี้ไม่สามารถยื่นเคลมได้ในสถานะปัจจุบัน";
    }
  }

  return (
    <div className="tck-home">
      <CustomerNavbar />

      <style>{`
        .tck-wty-detail-head {
          max-width: 1100px;
          margin: 0 auto 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }
        .tck-wty-detail-back {
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
        .tck-wty-detail-back:hover { border-color: var(--accent); color: var(--accent); }

        .tck-wty-detail-panel {
          max-width: 1100px;
          margin: 0 auto;
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: 16px;
          padding: 26px;
        }

        .tck-wty-status {
          display: inline-flex;
          align-items: center;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
          font-weight: 600;
          padding: 5px 10px;
          border-radius: 20px;
          white-space: nowrap;
        }
        .tck-wty-status-active {
          background: rgba(0, 208, 132, 0.14);
          color: #00895a;
        }
        .tck-wty-status-expired,
        .tck-wty-status-claimed {
          background: rgba(98, 108, 122, 0.12);
          color: var(--muted);
        }

        .tck-wty-detail-list {
          margin-top: 18px;
        }

        .tck-wty-claim-box {
          margin-top: 22px;
          padding-top: 20px;
          border-top: 1px solid var(--line);
        }
        .tck-wty-claim-note {
          color: var(--muted);
          font-size: 13.5px;
          background: #F6F8FB;
          border: 1px solid var(--line);
          border-radius: 10px;
          padding: 12px 14px;
        }

        .tck-wty-detail-loading {
          text-align: center;
          color: var(--muted);
          padding: 60px 0;
          font-family: 'IBM Plex Mono', monospace;
        }
      `}</style>

      <div className="tck-wty-detail-head">
        <div>
          <button type="button" className="tck-wty-detail-back" onClick={() => navigate("/warranty")}>
            ← กลับไปหน้า Warranty
          </button>
          <h1 className="tck-title" style={{ fontSize: "clamp(22px, 3vw, 30px)", margin: 0 }}>
            {product?.product_name || (warranty?.product_id ? `สินค้า #${warranty.product_id}` : "รายละเอียดประกัน")}
          </h1>
        </div>
        {warranty && <StatusBadge status={warranty.warranty_status} />}
      </div>

      {loading ? (
        <div className="tck-wty-detail-loading">กำลังโหลด...</div>
      ) : error ? (
        <div className="tck-empty" style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="tck-empty-title">เกิดข้อผิดพลาด</div>
          <div style={{ marginBottom: 16 }}>{error}</div>
          <button type="button" className="tck-cta" onClick={() => navigate("/warranty")}>
            กลับไปหน้า Warranty →
          </button>
        </div>
      ) : (
        <div className="tck-wty-detail-panel">
          <div className="tck-spec-list tck-wty-detail-list">
            <div className="tck-spec-row">
              <span className="tck-spec-mark tck-mono">SN</span>
              <span className="tck-spec-text tck-mono">{warranty?.serial_number || "-"}</span>
            </div>
            <div className="tck-spec-row">
              <span className="tck-spec-mark tck-mono">WTY</span>
              <span className="tck-spec-text">{warranty?.warranty_provider || "-"}</span>
            </div>
            <div className="tck-spec-row">
              <span className="tck-spec-mark tck-mono">QTY</span>
              <span className="tck-spec-text">{warranty?.quantity ?? "-"}</span>
            </div>
            <div className="tck-spec-row">
              <span className="tck-spec-mark tck-mono">START</span>
              <span className="tck-spec-text">
                {warranty?.warranty_start_date
                  ? new Date(warranty.warranty_start_date).toLocaleDateString("th-TH")
                  : "-"}
              </span>
            </div>
            <div className="tck-spec-row">
              <span className="tck-spec-mark tck-mono">END</span>
              <span className="tck-spec-text">
                {warranty?.warranty_end_date
                  ? new Date(warranty.warranty_end_date).toLocaleDateString("th-TH")
                  : "-"}
                {isExpired && <span style={{ color: "var(--danger)", marginLeft: 8 }}>(หมดอายุแล้ว)</span>}
              </span>
            </div>
          </div>

          <div className="tck-wty-claim-box">
            {canClaim ? (
              <button
                type="button"
                className="tck-cta"
                onClick={() => navigate(`/warranty-claims/new?warranty_id=${warranty.warranty_id}`)}
              >
                ยื่นเคลมประกัน →
              </button>
            ) : (
              <div className="tck-wty-claim-note">{claimBlockedReason}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
