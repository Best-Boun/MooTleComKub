import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import warrantyService from "../services/warrantyService";
import productService from "../services/productService";
import CustomerNavbar from "../components/layout/CustomerNavbar";
import "../styles/tckTheme.css";

export default function WarrantyClaimNew() {
  const [searchParams] = useSearchParams();
  const warrantyId = searchParams.get("warranty_id");
  const navigate = useNavigate();

  const [warranty, setWarranty] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [problemDescription, setProblemDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchWarranty = async () => {
      if (!warrantyId) {
        setLoadError("ไม่พบข้อมูลประกันที่ต้องการยื่นเคลม กรุณาเข้าจากหน้ารายละเอียดประกัน");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setLoadError("");

        const res = await warrantyService.getWarrantyById(warrantyId);

        if (!isMounted) return;

        if (!res?.success || !res?.data) {
          setLoadError("ไม่พบประกันนี้ หรือคุณไม่มีสิทธิ์เข้าถึง");
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
        setLoadError(
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
  }, [warrantyId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!problemDescription.trim()) {
      setSubmitError("กรุณากรอกอาการหรือปัญหาที่พบ");
      return;
    }

    setSubmitError("");
    setSubmitting(true);

    try {
      const res = await warrantyService.createClaim(warrantyId, problemDescription.trim());

      if (!res?.success) {
        throw new Error(res?.message || "ส่งคำขอเคลมไม่สำเร็จ");
      }

      navigate(`/warranty-claims/${res.claimId}`);
    } catch (err) {
      console.error(err);
      setSubmitError(
        err.response?.data?.message || err.message || "ส่งคำขอเคลมไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="tck-home">
      <CustomerNavbar />

      <style>{`
        .tck-claim-head {
          max-width: 700px;
          margin: 0 auto 16px;
        }
        .tck-claim-back {
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
        .tck-claim-back:hover { border-color: var(--accent); color: var(--accent); }

        .tck-claim-panel {
          max-width: 700px;
          margin: 0 auto;
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: 16px;
          padding: 24px;
        }
        .tck-claim-summary {
          background: #F6F8FB;
          border: 1px solid var(--line);
          border-radius: 12px;
          padding: 14px 16px;
          margin-bottom: 20px;
        }
        .tck-claim-summary-name {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 15px;
          margin-bottom: 6px;
        }
        .tck-claim-summary-meta {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12.5px;
          color: var(--muted);
          line-height: 1.7;
        }

        .tck-claim-label {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 14px;
          margin-bottom: 8px;
          display: block;
        }
        .tck-claim-textarea {
          width: 100%;
          min-height: 140px;
          border: 1px solid var(--line);
          border-radius: 10px;
          padding: 12px 14px;
          font-size: 14px;
          font-family: 'Inter', sans-serif;
          color: var(--ink);
          background: #F9FAFC;
          resize: vertical;
        }

        .tck-claim-error {
          background: #FDEDEC;
          border: 1px solid #F5C6C0;
          color: var(--danger);
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 14px;
          margin: 16px 0;
        }

        .tck-claim-submit-btn {
          width: 100%;
          margin-top: 6px;
          background: var(--ink);
          color: #fff;
          border: none;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 15px;
          padding: 13px 16px;
          border-radius: 10px;
          cursor: pointer;
        }
        .tck-claim-submit-btn:hover { background: var(--accent); }
        .tck-claim-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .tck-claim-loading {
          text-align: center;
          color: var(--muted);
          padding: 60px 0;
          font-family: 'IBM Plex Mono', monospace;
        }
      `}</style>

      <div className="tck-claim-head">
        <button type="button" className="tck-claim-back" onClick={() => navigate("/warranty")}>
          ← กลับไปหน้า Warranty
        </button>
        <h1 className="tck-title" style={{ fontSize: "clamp(22px, 3vw, 30px)", margin: 0 }}>
          ยื่นเคลมประกัน
        </h1>
      </div>

      {loading ? (
        <div className="tck-claim-loading">กำลังโหลด...</div>
      ) : loadError ? (
        <div className="tck-empty" style={{ maxWidth: 700, margin: "0 auto" }}>
          <div className="tck-empty-title">เกิดข้อผิดพลาด</div>
          <div style={{ marginBottom: 16 }}>{loadError}</div>
          <button type="button" className="tck-cta" onClick={() => navigate("/warranty")}>
            กลับไปหน้า Warranty →
          </button>
        </div>
      ) : (
        <div className="tck-claim-panel">
          <div className="tck-claim-summary">
            <div className="tck-claim-summary-name">
              {product?.product_name || (warranty?.product_id ? `สินค้า #${warranty.product_id}` : "-")}
            </div>
            <div className="tck-claim-summary-meta">
              SN: {warranty?.serial_number || "-"}
              <br />
              หมดประกัน:{" "}
              {warranty?.warranty_end_date
                ? new Date(warranty.warranty_end_date).toLocaleDateString("th-TH")
                : "-"}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <label className="tck-claim-label" htmlFor="problem_description">
              อาการ/ปัญหาที่พบ
            </label>
            <textarea
              id="problem_description"
              className="tck-claim-textarea"
              placeholder="อธิบายอาการหรือปัญหาที่พบกับสินค้าของคุณ..."
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              required
            />

            {submitError && <div className="tck-claim-error">{submitError}</div>}

            <button type="submit" className="tck-claim-submit-btn" disabled={submitting}>
              {submitting ? "กำลังส่งคำขอ..." : "ส่งคำขอเคลม"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
