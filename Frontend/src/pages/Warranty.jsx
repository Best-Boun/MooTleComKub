import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

function isPastEndDate(endDate) {
  if (!endDate) return false;
  return new Date() > new Date(endDate);
}

export default function Warranty() {
  const navigate = useNavigate();

  const [warranties, setWarranties] = useState([]);
  const [productsById, setProductsById] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [warrantyRes, productsRes] = await Promise.all([
          warrantyService.getMyWarranties(),
          productService.getAllProducts(),
        ]);

        if (!warrantyRes?.success) {
          throw new Error(warrantyRes?.message || "โหลดข้อมูลประกันไม่สำเร็จ");
        }

        setWarranties(Array.isArray(warrantyRes.data) ? warrantyRes.data : []);

        const list = Array.isArray(productsRes?.data) ? productsRes.data : [];
        const map = {};
        list.forEach((p) => {
          map[p.product_id] = p;
        });
        setProductsById(map);
      } catch (err) {
        console.error(err);
        setError(
          err.response?.data?.message || err.message || "ไม่สามารถโหลดข้อมูลประกันได้ กรุณาลองใหม่อีกครั้ง",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="tck-home">
      <CustomerNavbar />

      <style>{`
        .tck-wty-head {
          max-width: 1100px;
          margin: 0 auto 20px;
        }
        .tck-wty-list {
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .tck-wty-card {
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
        .tck-wty-card:hover {
          box-shadow: 0 10px 24px rgba(16, 19, 26, 0.08);
          transform: translateY(-1px);
        }
        .tck-wty-name {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 15.5px;
          margin-bottom: 4px;
        }
        .tck-wty-meta {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12.5px;
          color: var(--muted);
        }
        .tck-wty-right {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-shrink: 0;
        }
        .tck-wty-end-date {
          text-align: right;
          font-size: 13px;
        }
        .tck-wty-end-date .label {
          color: var(--muted);
          font-size: 11.5px;
        }
        .tck-wty-end-date .value {
          font-family: 'IBM Plex Mono', monospace;
          font-weight: 600;
        }
        .tck-wty-expired-tag {
          color: var(--danger);
          font-size: 11px;
          font-weight: 600;
        }
        .tck-wty-arrow {
          color: var(--muted);
          font-size: 18px;
        }
        @media (max-width: 560px) {
          .tck-wty-card { flex-wrap: wrap; }
          .tck-wty-right { width: 100%; justify-content: space-between; }
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

        .tck-wty-loading {
          text-align: center;
          color: var(--muted);
          padding: 60px 0;
          font-family: 'IBM Plex Mono', monospace;
        }

        .tck-wty-claims-link {
          background: transparent;
          border: none;
          padding: 0;
          margin-top: 8px;
          color: var(--accent);
          font-size: 13.5px;
          cursor: pointer;
        }
        .tck-wty-claims-link:hover {
          text-decoration: underline;
        }
      `}</style>

      <div className="tck-wty-head">
        <h1 className="tck-title" style={{ fontSize: "clamp(24px, 3.5vw, 32px)" }}>
          ประกันสินค้าของฉัน
        </h1>
        <p className="tck-sub" style={{ margin: 0 }}>
          ตรวจสอบสถานะและวันหมดอายุประกันสินค้าที่คุณซื้อ
        </p>
        <button
          type="button"
          className="tck-wty-claims-link"
          onClick={() => navigate("/warranty-claims")}
        >
          ดูประวัติการเคลมทั้งหมด →
        </button>
      </div>

      {loading ? (
        <div className="tck-wty-loading">กำลังโหลด...</div>
      ) : error ? (
        <div className="tck-empty" style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="tck-empty-title">เกิดข้อผิดพลาด</div>
          <div>{error}</div>
        </div>
      ) : warranties.length === 0 ? (
        <div className="tck-empty" style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="tck-empty-title">คุณยังไม่มีประกันสินค้า</div>
          <div style={{ marginBottom: 16 }}>
            ประกันจะถูกสร้างขึ้นโดยอัตโนมัติหลังจากคุณได้รับสินค้าและแอดมินยืนยันการจัดส่งเรียบร้อยแล้ว
          </div>
          <button type="button" className="tck-cta" onClick={() => navigate("/orders")}>
            ดูคำสั่งซื้อของฉัน →
          </button>
        </div>
      ) : (
        <div className="tck-wty-list">
          {warranties.map((warranty) => {
            const product = productsById[warranty.product_id];
            const name = product?.product_name || `สินค้า #${warranty.product_id}`;
            const expired = isPastEndDate(warranty.warranty_end_date);

            return (
              <div
                key={warranty.warranty_id}
                className="tck-wty-card"
                onClick={() => navigate(`/warranty/${warranty.warranty_id}`)}
              >
                <div>
                  <div className="tck-wty-name">{name}</div>
                  <div className="tck-wty-meta">
                    SN: {warranty.serial_number || "-"} · {warranty.warranty_provider || "-"}
                  </div>
                </div>

                <div className="tck-wty-right">
                  <div className="tck-wty-end-date">
                    <div className="label">หมดอายุ</div>
                    <div className="value">
                      {warranty.warranty_end_date
                        ? new Date(warranty.warranty_end_date).toLocaleDateString("th-TH")
                        : "-"}
                    </div>
                    {expired && warranty.warranty_status === "ACTIVE" && (
                      <div className="tck-wty-expired-tag">หมดอายุแล้ว</div>
                    )}
                  </div>
                  <StatusBadge status={warranty.warranty_status} />
                  <span className="tck-wty-arrow">→</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
