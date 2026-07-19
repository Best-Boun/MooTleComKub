import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import orderService from "../services/orderService";
import paymentService from "../services/paymentService";
import CustomerLayout from "../components/layout/CustomerLayout";
import "../styles/tckTheme.css";

const PAYMENT_METHODS = [
  { value: "PROMPTPAY", label: "PromptPay", desc: "สแกน QR เพื่อชำระเงินทันที" },
  { value: "CREDIT_CARD", label: "บัตรเครดิต/เดบิต", desc: "Visa, Mastercard, JCB" },
  { value: "BANK_TRANSFER", label: "โอนผ่านธนาคาร", desc: "โอนเข้าบัญชีบริษัทโดยตรง" },
];

const STATUS_LABEL = {
  PENDING: "รอดำเนินการ",
  PAID: "ชำระเงินแล้ว",
  SHIPPED: "จัดส่งแล้ว",
  DELIVERED: "จัดส่งสำเร็จ",
  CANCELLED: "ยกเลิกแล้ว",
};

const TRACKING_STEPS = [
  {
    key: "PENDING",
    title: "คำสั่งซื้อถูกสร้าง",
    desc: "เรารับคำสั่งซื้อของคุณไว้เรียบร้อยแล้ว",
  },
  {
    key: "PAID",
    title: "ชำระเงินสำเร็จ",
    desc: "ระบบยืนยันการชำระเงินเรียบร้อยแล้ว",
  },
  {
    key: "SHIPPED",
    title: "กำลังจัดส่ง",
    desc: "พัสดุอยู่ระหว่างการเตรียมและส่งต่อ",
  },
  {
    key: "DELIVERED",
    title: "ส่งถึงมือคุณแล้ว",
    desc: "คำสั่งซื้อถึงปลายทางเรียบร้อยแล้ว",
  },
];

function StatusBadge({ status }) {
  return (
    <span className={`tck-order-status tck-order-status-${(status || "").toLowerCase()}`}>
      {STATUS_LABEL[status] || status || "-"}
    </span>
  );
}

function TrackingTimeline({ status }) {
  const statusOrder = ["PENDING", "PAID", "SHIPPED", "DELIVERED"];
  const currentIndex = statusOrder.indexOf(status || "PENDING");

  if (status === "CANCELLED") {
    return (
      <div className="tck-order-tracking-card">
        <div className="tck-order-tracking-title">สถานะคำสั่งซื้อ</div>
        <div className="tck-order-tracking-cancelled">คำสั่งซื้อถูกยกเลิก</div>
      </div>
    );
  }

  return (
    <div className="tck-order-tracking-card">
      <div className="tck-order-tracking-title">ติดตามคำสั่งซื้อ</div>
      <div className="tck-order-tracking-list">
        {TRACKING_STEPS.map((step, index) => {
          const isDone = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div className="tck-order-tracking-item" key={step.key}>
              <div className={`tck-order-tracking-dot ${isDone ? "done" : ""} ${isCurrent ? "current" : ""}`} />
              <div className="tck-order-tracking-copy">
                <div className="tck-order-tracking-step">{step.title}</div>
                <div className="tck-order-tracking-desc">{step.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showRetryPayment, setShowRetryPayment] = useState(false);
  const [retryPaymentMethod, setRetryPaymentMethod] = useState("PROMPTPAY");
  const [retrySubmitting, setRetrySubmitting] = useState(false);
  const [retryError, setRetryError] = useState("");

  const fetchOrder = async ({ silent } = {}) => {
    try {
      if (!silent) setLoading(true);
      setError("");

      const res = await orderService.getOrderById(id);

      if (!res?.success || !res?.data?.order) {
        setError("ไม่พบคำสั่งซื้อนี้");
        return;
      }

      const storedUser = localStorage.getItem("user");
      const currentUser = storedUser ? JSON.parse(storedUser) : null;

      if (currentUser && Number(res.data.order.user_id) !== Number(currentUser.user_id)) {
        setError("คุณไม่มีสิทธิ์เข้าถึงคำสั่งซื้อนี้");
        return;
      }

      setOrder(res.data.order);
      setItems(Array.isArray(res.data.items) ? res.data.items : []);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "ไม่สามารถโหลดคำสั่งซื้อนี้ได้ กรุณาลองใหม่อีกครั้ง",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleRetryPayment = async () => {
    setRetrySubmitting(true);
    setRetryError("");

    try {
      const res = await paymentService.createPayment(order.order_id, retryPaymentMethod);

      if (!res?.success) {
        throw new Error(res?.message || "ชำระเงินไม่สำเร็จ");
      }

      setShowRetryPayment(false);
      await fetchOrder({ silent: true });
    } catch (err) {
      console.error(err);
      setRetryError(
        err.response?.data?.message || err.message || "ชำระเงินไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
      );
    } finally {
      setRetrySubmitting(false);
    }
  };

  return (
    <CustomerLayout>
    <div className="tck-home">

      <style>{`
        .tck-order-detail-head {
          max-width: 1100px;
          margin: 0 auto 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }
        .tck-order-detail-back {
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
        .tck-order-detail-back:hover { border-color: var(--accent); color: var(--accent); }

        .tck-order-detail-grid {
          max-width: 1100px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 22px;
          align-items: start;
        }
        @media (max-width: 860px) {
          .tck-order-detail-grid { grid-template-columns: 1fr; }
        }
        .tck-order-panel {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: 16px;
          padding: 22px;
          margin-bottom: 18px;
        }
        .tck-order-panel-title {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 17px;
          margin: 0 0 14px;
        }

        .tck-order-item-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
        }
        .tck-order-item-row + .tck-order-item-row {
          border-top: 1px solid var(--line);
        }
        .tck-order-item-name {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 14.5px;
          margin-bottom: 3px;
        }
        .tck-order-item-meta {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
          color: var(--muted);
        }
        .tck-order-item-subtotal {
          font-family: 'IBM Plex Mono', monospace;
          font-weight: 600;
          font-size: 14.5px;
          white-space: nowrap;
        }

        .tck-order-total-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 14px;
          padding-top: 14px;
          border-top: 1px solid var(--line);
        }
        .tck-order-total-label {
          font-size: 14px;
          color: var(--muted);
        }
        .tck-order-total-value {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 22px;
        }

        .tck-order-addr-line {
          font-size: 14px;
          color: var(--ink);
          line-height: 1.7;
        }
        .tck-order-addr-line .muted { color: var(--muted); }

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

        .tck-order-detail-loading {
          text-align: center;
          color: var(--muted);
          padding: 60px 0;
          font-family: 'IBM Plex Mono', monospace;
        }

        .tck-order-tracking-card {
          margin-top: 16px;
          padding: 20px;
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: 14px;
        }
        .tck-order-tracking-title {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 15px;
          margin-bottom: 14px;
        }
        .tck-order-tracking-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .tck-order-tracking-item {
          display: flex;
          gap: 10px;
          align-items: flex-start;
        }
        .tck-order-tracking-dot {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: var(--line);
          margin-top: 6px;
          flex-shrink: 0;
        }
        .tck-order-tracking-dot.done {
          background: #22c55e;
        }
        .tck-order-tracking-dot.current {
          background: var(--accent);
          box-shadow: 0 0 0 4px rgba(43, 89, 255, 0.15);
        }
        .tck-order-tracking-step {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 13.5px;
          margin-bottom: 2px;
        }
        .tck-order-tracking-desc {
          font-size: 13px;
          color: var(--muted);
          line-height: 1.5;
        }
        .tck-order-tracking-cancelled {
          font-size: 14px;
          color: var(--danger);
        }

        .tck-retry-payment-card {
          margin-top: 18px;
          padding-top: 18px;
          border-top: 1px solid var(--line);
        }
        .tck-retry-payment-btn {
          width: 100%;
          background: var(--accent);
          color: #fff;
          border: none;
          font-weight: 600;
          font-size: 14.5px;
          padding: 12px 16px;
          border-radius: 10px;
          cursor: pointer;
        }
        .tck-retry-payment-btn:hover { background: var(--accent-dark, var(--accent)); }
        .tck-pay-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 4px;
        }
        .tck-pay-card {
          border: 1px solid var(--line);
          border-radius: 12px;
          padding: 14px;
          cursor: pointer;
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .tck-pay-card.selected {
          border-color: var(--accent);
          background: #F3F6FF;
        }
        .tck-pay-name {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 14.5px;
        }
        .tck-pay-desc {
          font-size: 13px;
          color: var(--muted);
        }
        .tck-retry-confirm-btn {
          width: 100%;
          margin-top: 12px;
          background: var(--ink);
          color: #fff;
          border: none;
          font-weight: 600;
          font-size: 14.5px;
          padding: 12px 16px;
          border-radius: 10px;
          cursor: pointer;
        }
        .tck-retry-confirm-btn:hover { background: var(--accent); }
        .tck-retry-confirm-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .tck-retry-error {
          background: #FDEDEC;
          border: 1px solid #F5C6C0;
          color: var(--danger);
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 13.5px;
          margin-top: 12px;
        }
      `}</style>

      <div className="tck-order-detail-head">
        <div>
          <button type="button" className="tck-order-detail-back" onClick={() => navigate("/orders")}>
            ← กลับไปหน้า Orders
          </button>
          <h1 className="tck-title" style={{ fontSize: "clamp(22px, 3vw, 30px)", margin: 0 }}>
            {order?.order_number ? `คำสั่งซื้อ #${order.order_number}` : "รายละเอียดคำสั่งซื้อ"}
          </h1>
        </div>
        {order && <StatusBadge status={order.order_status} />}
      </div>

      {loading ? (
        <div className="tck-order-detail-loading">กำลังโหลด...</div>
      ) : error ? (
        <div className="tck-empty" style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="tck-empty-title">เกิดข้อผิดพลาด</div>
          <div style={{ marginBottom: 16 }}>{error}</div>
          <button type="button" className="tck-cta" onClick={() => navigate("/orders")}>
            กลับไปหน้า Orders →
          </button>
        </div>
      ) : (
        <div className="tck-order-detail-grid">
          <div>
            <div className="tck-order-panel">
              <h2 className="tck-order-panel-title">รายการสินค้า</h2>

              {items.length === 0 ? (
                <div className="tck-order-addr-line muted">ไม่พบรายการสินค้าในคำสั่งซื้อนี้</div>
              ) : (
                items.map((item) => (
                  <div className="tck-order-item-row" key={item.order_item_id}>
                    <div>
                      <div className="tck-order-item-name">
                        {item.product_name || `สินค้า #${item.product_id}`}
                      </div>
                      <div className="tck-order-item-meta">
                        ฿{Number(item.unit_price || 0).toLocaleString()} x {item.quantity}
                      </div>
                    </div>
                    <div className="tck-order-item-subtotal">
                      ฿{Number(item.subtotal || 0).toLocaleString()}
                    </div>
                  </div>
                ))
              )}

              <div className="tck-order-total-row">
                <span className="tck-order-total-label">ยอดรวมทั้งหมด</span>
                <span className="tck-order-total-value">
                  ฿{Number(order?.total_amount || 0).toLocaleString()}
                </span>
              </div>

              {order?.order_status === "PENDING" && (
                <div className="tck-retry-payment-card">
                  {!showRetryPayment ? (
                    <button
                      type="button"
                      className="tck-retry-payment-btn"
                      onClick={() => {
                        setRetryError("");
                        setShowRetryPayment(true);
                      }}
                    >
                      ลองชำระเงินอีกครั้ง
                    </button>
                  ) : (
                    <>
                      <div className="tck-pay-list">
                        {PAYMENT_METHODS.map((method) => (
                          <label
                            key={method.value}
                            className={`tck-pay-card${retryPaymentMethod === method.value ? " selected" : ""}`}
                          >
                            <input
                              type="radio"
                              name="retry_payment_method"
                              checked={retryPaymentMethod === method.value}
                              onChange={() => setRetryPaymentMethod(method.value)}
                            />
                            <div>
                              <div className="tck-pay-name">{method.label}</div>
                              <div className="tck-pay-desc">{method.desc}</div>
                            </div>
                          </label>
                        ))}
                      </div>

                      {retryError && <div className="tck-retry-error">{retryError}</div>}

                      <button
                        type="button"
                        className="tck-retry-confirm-btn"
                        disabled={retrySubmitting}
                        onClick={handleRetryPayment}
                      >
                        {retrySubmitting ? "กำลังดำเนินการ..." : "ยืนยันการชำระเงิน"}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="tck-order-panel">
            <h2 className="tck-order-panel-title">ที่อยู่จัดส่ง</h2>
            <div className="tck-order-addr-line">
              <strong>{order?.shipping_name || "-"}</strong>
              <br />
              <span className="muted">{order?.shipping_phone || "-"}</span>
              <br />
              {order?.shipping_address || "-"} {order?.shipping_subdistrict}{" "}
              {order?.shipping_district}
              <br />
              {order?.shipping_province} {order?.shipping_postal_code}
            </div>

            <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--line)" }}>
              <div className="tck-order-addr-line muted">
                วันที่สั่งซื้อ:{" "}
                {order?.order_date ? new Date(order.order_date).toLocaleString("th-TH") : "-"}
              </div>
              <TrackingTimeline status={order?.order_status} />
            </div>
          </div>
        </div>
      )}
    </div>
    </CustomerLayout>
  );
}