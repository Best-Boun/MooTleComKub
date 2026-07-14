import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import orderService from "../services/orderService";
import CustomerNavbar from "../components/layout/CustomerNavbar";
import "../styles/tckTheme.css";

const STATUS_LABEL = {
  PENDING: "รอดำเนินการ",
  PAID: "ชำระเงินแล้ว",
  SHIPPED: "จัดส่งแล้ว",
  DELIVERED: "จัดส่งสำเร็จ",
  CANCELLED: "ยกเลิกแล้ว",
};

function StatusBadge({ status }) {
  return (
    <span className={`tck-order-status tck-order-status-${(status || "").toLowerCase()}`}>
      {STATUS_LABEL[status] || status || "-"}
    </span>
  );
}

export default function Orders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await orderService.getMyOrders();

        if (!res?.success) {
          throw new Error(res?.message || "โหลดคำสั่งซื้อไม่สำเร็จ");
        }

        setOrders(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
        setError(
          err.response?.data?.message || err.message || "ไม่สามารถโหลดคำสั่งซื้อได้ กรุณาลองใหม่อีกครั้ง",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="tck-home">
      <CustomerNavbar />

      <style>{`
        .tck-orders-head {
          max-width: 1100px;
          margin: 0 auto 20px;
        }
        .tck-orders-list {
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .tck-order-card {
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
        .tck-order-card:hover {
          box-shadow: 0 10px 24px rgba(16, 19, 26, 0.08);
          transform: translateY(-1px);
        }
        .tck-order-number {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 15.5px;
          margin-bottom: 4px;
        }
        .tck-order-date {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12.5px;
          color: var(--muted);
        }
        .tck-order-right {
          display: flex;
          align-items: center;
          gap: 18px;
          flex-shrink: 0;
        }
        .tck-order-total {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 17px;
        }
        .tck-order-arrow {
          color: var(--muted);
          font-size: 18px;
        }
        @media (max-width: 560px) {
          .tck-order-card { flex-wrap: wrap; }
          .tck-order-right { width: 100%; justify-content: space-between; }
        }

        .tck-order-status {
          display: inline-flex;
          align-items: center;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
          font-weight: 600;
          padding: 5px 10px;
          border-radius: 20px;
          white-space: nowrap;
        }
        .tck-order-status-pending {
          background: rgba(98, 108, 122, 0.12);
          color: var(--muted);
        }
        .tck-order-status-paid,
        .tck-order-status-delivered {
          background: rgba(0, 208, 132, 0.14);
          color: #00895a;
        }
        .tck-order-status-shipped {
          background: rgba(43, 89, 255, 0.12);
          color: var(--accent);
        }
        .tck-order-status-cancelled {
          background: rgba(229, 72, 77, 0.12);
          color: var(--danger);
        }

        .tck-orders-loading {
          text-align: center;
          color: var(--muted);
          padding: 60px 0;
          font-family: 'IBM Plex Mono', monospace;
        }
      `}</style>

      <div className="tck-orders-head">
        <h1 className="tck-title" style={{ fontSize: "clamp(24px, 3.5vw, 32px)" }}>
          คำสั่งซื้อของฉัน
        </h1>
        <p className="tck-sub" style={{ margin: 0 }}>
          ตรวจสอบสถานะและรายละเอียดคำสั่งซื้อทั้งหมดของคุณ
        </p>
      </div>

      {loading ? (
        <div className="tck-orders-loading">กำลังโหลด...</div>
      ) : error ? (
        <div className="tck-empty" style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="tck-empty-title">เกิดข้อผิดพลาด</div>
          <div>{error}</div>
        </div>
      ) : orders.length === 0 ? (
        <div className="tck-empty" style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="tck-empty-title">คุณยังไม่เคยสั่งซื้อสินค้า</div>
          <div style={{ marginBottom: 16 }}>เลือกซื้อสินค้าชิ้นแรกของคุณได้เลย</div>
          <button type="button" className="tck-cta" onClick={() => navigate("/products")}>
            เลือกซื้อสินค้า →
          </button>
        </div>
      ) : (
        <div className="tck-orders-list">
          {orders.map((order) => (
            <div
              key={order.order_id}
              className="tck-order-card"
              onClick={() => navigate(`/orders/${order.order_id}`)}
            >
              <div>
                <div className="tck-order-number">#{order.order_number}</div>
                <div className="tck-order-date">
                  {order.order_date ? new Date(order.order_date).toLocaleString("th-TH") : "-"}
                </div>
              </div>

              <div className="tck-order-right">
                <StatusBadge status={order.order_status} />
                <div className="tck-order-total">
                  ฿{Number(order.total_amount || 0).toLocaleString()}
                </div>
                <span className="tck-order-arrow">→</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
