import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import cartService from "../services/cartService";
import productService from "../services/productService";
import addressService from "../services/addressService";
import orderService from "../services/orderService";
import paymentService from "../services/paymentService";
import CustomerNavbar from "../components/layout/CustomerNavbar";
import "../styles/tckTheme.css";

const PAYMENT_METHODS = [
  { value: "PROMPTPAY", label: "PromptPay", desc: "สแกน QR เพื่อชำระเงินทันที" },
  { value: "CREDIT_CARD", label: "บัตรเครดิต/เดบิต", desc: "Visa, Mastercard, JCB" },
  { value: "BANK_TRANSFER", label: "โอนผ่านธนาคาร", desc: "โอนเข้าบัญชีบริษัทโดยตรง" },
];

const EMPTY_ADDRESS_FORM = {
  recipient_name: "",
  phone: "",
  address_line: "",
  subdistrict: "",
  district: "",
  province: "",
  postal_code: "",
};

export default function Checkout() {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [productsById, setProductsById] = useState({});
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("PROMPTPAY");

  const [showAddForm, setShowAddForm] = useState(false);
  const [addressForm, setAddressForm] = useState(EMPTY_ADDRESS_FORM);
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressFormError, setAddressFormError] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setLoadError("");

      const [cartRes, productsRes, addressRes] = await Promise.all([
        cartService.getCart(),
        productService.getAllProducts(),
        addressService.getAddresses(),
      ]);

      setCart(cartRes?.data || null);

      const list = Array.isArray(productsRes?.data) ? productsRes.data : [];
      const map = {};
      list.forEach((p) => {
        map[p.product_id] = p;
      });
      setProductsById(map);

      const addressList = Array.isArray(addressRes?.addresses)
        ? addressRes.addresses
        : [];
      setAddresses(addressList);

      const defaultAddress = addressList.find((a) => a.is_default) || addressList[0];
      if (defaultAddress) setSelectedAddressId(defaultAddress.address_id);
    } catch (err) {
      console.error(err);
      setLoadError("ไม่สามารถโหลดข้อมูลการชำระเงินได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const items = Array.isArray(cart?.items)
    ? cart.items.filter((item) => item && item.cart_item_id)
    : [];

  const total = items.reduce(
    (sum, item) => sum + Number(item.subtotal ?? item.price * item.quantity ?? 0),
    0,
  );

  const handleAddressFormChange = (e) => {
    const { name, value } = e.target;
    setAddressForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setAddressFormError("");
    setSavingAddress(true);

    try {
      const res = await addressService.createAddress(addressForm);
      const newAddress = res?.address;

      if (newAddress) {
        setAddresses((prev) => [newAddress, ...prev]);
        setSelectedAddressId(newAddress.address_id);
      } else {
        await loadData();
      }

      setAddressForm(EMPTY_ADDRESS_FORM);
      setShowAddForm(false);
    } catch (err) {
      console.error(err);
      setAddressFormError(
        err.response?.data?.message || "บันทึกที่อยู่ไม่สำเร็จ กรุณาตรวจสอบข้อมูล",
      );
    } finally {
      setSavingAddress(false);
    }
  };

  const handleConfirmOrder = async () => {
    if (!selectedAddressId) {
      setSubmitError("กรุณาเลือกที่อยู่จัดส่ง");
      return;
    }

    setSubmitError("");
    setSubmitting(true);

    try {
      const orderRes = await orderService.createOrder(selectedAddressId);

      if (!orderRes?.success) {
        throw new Error(orderRes?.message || "สร้างคำสั่งซื้อไม่สำเร็จ");
      }

      const orderId = orderRes.data.order_id;

      const paymentRes = await paymentService.createPayment(orderId, paymentMethod);

      if (!paymentRes?.success) {
        throw new Error(paymentRes?.message || "ชำระเงินไม่สำเร็จ");
      }

      navigate(`/orders/${orderId}`);
    } catch (err) {
      console.error(err);
      setSubmitError(
        err.response?.data?.message || err.message || "ดำเนินการสั่งซื้อไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="tck-home">
      <CustomerNavbar />

      <style>{`
        .tck-checkout-head {
          max-width: 1100px;
          margin: 0 auto 20px;
        }
        .tck-checkout-grid {
          max-width: 1100px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 22px;
          align-items: start;
        }
        @media (max-width: 860px) {
          .tck-checkout-grid { grid-template-columns: 1fr; }
        }
        .tck-checkout-panel {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: 16px;
          padding: 22px;
          margin-bottom: 18px;
        }
        .tck-checkout-panel-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }
        .tck-checkout-panel-title {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 17px;
          margin: 0;
        }
        .tck-addr-toggle {
          border: 1px solid var(--line);
          background: transparent;
          color: var(--accent);
          font-size: 13px;
          padding: 6px 12px;
          border-radius: 8px;
          cursor: pointer;
        }
        .tck-addr-toggle:hover { background: #F6F8FB; }

        .tck-addr-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .tck-addr-card {
          border: 1px solid var(--line);
          border-radius: 12px;
          padding: 14px;
          cursor: pointer;
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }
        .tck-addr-card.selected {
          border-color: var(--accent);
          background: #F3F6FF;
        }
        .tck-addr-card input { margin-top: 3px; }
        .tck-addr-name {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 14.5px;
          margin-bottom: 3px;
        }
        .tck-addr-detail {
          font-size: 13.5px;
          color: var(--muted);
          line-height: 1.5;
        }
        .tck-addr-badge {
          display: inline-block;
          margin-left: 8px;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10.5px;
          color: #00895a;
          background: rgba(0, 208, 132, 0.12);
          padding: 2px 7px;
          border-radius: 20px;
          vertical-align: middle;
        }

        .tck-addr-form {
          margin-top: 14px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .tck-addr-form input {
          border: 1px solid var(--line);
          border-radius: 8px;
          padding: 10px 12px;
          font-size: 14px;
          font-family: 'Inter', sans-serif;
          color: var(--ink);
          background: #F9FAFC;
        }
        .tck-addr-form input.full-row { grid-column: 1 / -1; }
        .tck-addr-form-actions {
          grid-column: 1 / -1;
          display: flex;
          gap: 10px;
          margin-top: 4px;
        }

        .tck-pay-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
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

        .tck-summary-panel {
          position: sticky;
          top: 20px;
        }
        .tck-summary-item {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          font-size: 13.5px;
          padding: 8px 0;
        }
        .tck-summary-item + .tck-summary-item {
          border-top: 1px solid var(--line);
        }
        .tck-summary-name {
          color: var(--ink);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .tck-summary-qty {
          color: var(--muted);
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
        }
        .tck-summary-total-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 14px;
          padding-top: 14px;
          border-top: 1px solid var(--line);
        }
        .tck-summary-total-label {
          font-size: 14px;
          color: var(--muted);
        }
        .tck-summary-total-value {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 22px;
        }
        .tck-confirm-btn {
          width: 100%;
          margin-top: 16px;
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
        .tck-confirm-btn:hover { background: var(--accent); }
        .tck-confirm-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .tck-checkout-error {
          background: #FDEDEC;
          border: 1px solid #F5C6C0;
          color: var(--danger);
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 14px;
          margin-bottom: 16px;
        }
        .tck-checkout-loading {
          text-align: center;
          color: var(--muted);
          padding: 60px 0;
          font-family: 'IBM Plex Mono', monospace;
        }
      `}</style>

      <div className="tck-checkout-head">
        <h1 className="tck-title" style={{ fontSize: "clamp(24px, 3.5vw, 32px)" }}>
          ชำระเงิน
        </h1>
        <p className="tck-sub" style={{ margin: 0 }}>
          เลือกที่อยู่จัดส่งและวิธีชำระเงินเพื่อยืนยันคำสั่งซื้อ
        </p>
      </div>

      {loading ? (
        <div className="tck-checkout-loading">กำลังโหลด...</div>
      ) : loadError ? (
        <div className="tck-empty" style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="tck-empty-title">เกิดข้อผิดพลาด</div>
          <div>{loadError}</div>
        </div>
      ) : items.length === 0 ? (
        <div className="tck-empty" style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="tck-empty-title">ตะกร้าของคุณว่างอยู่</div>
          <div style={{ marginBottom: 16 }}>เพิ่มสินค้าลงตะกร้าก่อนดำเนินการชำระเงิน</div>
          <button type="button" className="tck-cta" onClick={() => navigate("/")}>
            เลือกซื้อสินค้า →
          </button>
        </div>
      ) : (
        <div className="tck-checkout-grid">
          <div>
            <div className="tck-checkout-panel">
              <div className="tck-checkout-panel-head">
                <h2 className="tck-checkout-panel-title">ที่อยู่จัดส่ง</h2>
                <button
                  type="button"
                  className="tck-addr-toggle"
                  onClick={() => setShowAddForm((v) => !v)}
                >
                  {showAddForm ? "ยกเลิก" : "+ เพิ่มที่อยู่ใหม่"}
                </button>
              </div>

              {addresses.length === 0 && !showAddForm && (
                <div className="tck-addr-detail">
                  ยังไม่มีที่อยู่จัดส่ง กด "+ เพิ่มที่อยู่ใหม่" เพื่อเริ่มต้น
                </div>
              )}

              {addresses.length > 0 && (
                <div className="tck-addr-list">
                  {addresses.map((addr) => (
                    <label
                      key={addr.address_id}
                      className={`tck-addr-card${selectedAddressId === addr.address_id ? " selected" : ""}`}
                    >
                      <input
                        type="radio"
                        name="address"
                        checked={selectedAddressId === addr.address_id}
                        onChange={() => setSelectedAddressId(addr.address_id)}
                      />
                      <div>
                        <div className="tck-addr-name">
                          {addr.recipient_name}
                          {addr.is_default ? <span className="tck-addr-badge">ค่าเริ่มต้น</span> : null}
                        </div>
                        <div className="tck-addr-detail">
                          {addr.phone}
                          <br />
                          {addr.address_line} {addr.subdistrict} {addr.district}{" "}
                          {addr.province} {addr.postal_code}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {showAddForm && (
                <form className="tck-addr-form" onSubmit={handleAddAddress}>
                  {addressFormError && (
                    <div className="tck-checkout-error full-row">{addressFormError}</div>
                  )}
                  <input
                    className="full-row"
                    name="recipient_name"
                    placeholder="ชื่อผู้รับ"
                    value={addressForm.recipient_name}
                    onChange={handleAddressFormChange}
                    required
                  />
                  <input
                    className="full-row"
                    name="phone"
                    placeholder="เบอร์โทรศัพท์"
                    value={addressForm.phone}
                    onChange={handleAddressFormChange}
                    required
                  />
                  <input
                    className="full-row"
                    name="address_line"
                    placeholder="ที่อยู่ (บ้านเลขที่, ถนน)"
                    value={addressForm.address_line}
                    onChange={handleAddressFormChange}
                    required
                  />
                  <input
                    name="subdistrict"
                    placeholder="ตำบล/แขวง"
                    value={addressForm.subdistrict}
                    onChange={handleAddressFormChange}
                    required
                  />
                  <input
                    name="district"
                    placeholder="อำเภอ/เขต"
                    value={addressForm.district}
                    onChange={handleAddressFormChange}
                    required
                  />
                  <input
                    name="province"
                    placeholder="จังหวัด"
                    value={addressForm.province}
                    onChange={handleAddressFormChange}
                    required
                  />
                  <input
                    name="postal_code"
                    placeholder="รหัสไปรษณีย์ (5 หลัก)"
                    value={addressForm.postal_code}
                    onChange={handleAddressFormChange}
                    required
                  />
                  <div className="tck-addr-form-actions">
                    <button type="submit" className="tck-cta" disabled={savingAddress}>
                      {savingAddress ? "กำลังบันทึก..." : "บันทึกที่อยู่"}
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="tck-checkout-panel">
              <div className="tck-checkout-panel-head">
                <h2 className="tck-checkout-panel-title">วิธีชำระเงิน</h2>
              </div>
              <div className="tck-pay-list">
                {PAYMENT_METHODS.map((method) => (
                  <label
                    key={method.value}
                    className={`tck-pay-card${paymentMethod === method.value ? " selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      checked={paymentMethod === method.value}
                      onChange={() => setPaymentMethod(method.value)}
                    />
                    <div>
                      <div className="tck-pay-name">{method.label}</div>
                      <div className="tck-pay-desc">{method.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="tck-checkout-panel tck-summary-panel">
            <h2 className="tck-checkout-panel-title" style={{ marginBottom: 12 }}>
              สรุปคำสั่งซื้อ
            </h2>

            {items.map((item) => {
              const product = productsById[item.product_id];
              const name = product?.product_name || `สินค้า #${item.product_id}`;

              return (
                <div className="tck-summary-item" key={item.cart_item_id}>
                  <div>
                    <div className="tck-summary-name">{name}</div>
                    <div className="tck-summary-qty">x{item.quantity}</div>
                  </div>
                  <div>฿{Number(item.subtotal || 0).toLocaleString()}</div>
                </div>
              );
            })}

            <div className="tck-summary-total-row">
              <span className="tck-summary-total-label">ยอดรวมทั้งหมด</span>
              <span className="tck-summary-total-value">
                ฿{Number(total || 0).toLocaleString()}
              </span>
            </div>

            {submitError && <div className="tck-checkout-error" style={{ marginTop: 14 }}>{submitError}</div>}

            <button
              type="button"
              className="tck-confirm-btn"
              disabled={submitting || !selectedAddressId}
              onClick={handleConfirmOrder}
            >
              {submitting ? "กำลังดำเนินการ..." : "ยืนยันคำสั่งซื้อ"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
