import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import cartService from "../services/cartService";
import productService from "../services/productService";

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [productsById, setProductsById] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const loadCart = async () => {
    try {
      setError("");
      const [cartRes, productsRes] = await Promise.all([
        cartService.getCart(),
        productService.getAllProducts(),
      ]);

      console.log("CART =", cartRes);
      console.log("PRODUCTS =", productsRes);

      setCart(cartRes?.data || null);

      const list = Array.isArray(productsRes?.data) ? productsRes.data : [];
      const map = {};
      list.forEach((p) => {
        map[p.product_id] = p;
      });
      setProductsById(map);
    } catch (err) {
      console.error(err);
      setError("ไม่สามารถโหลดตะกร้าสินค้าได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const items = Array.isArray(cart?.items)
    ? cart.items.filter((item) => item && item.cart_item_id)
    : [];

  const total = items.reduce(
    (sum, item) => sum + Number(item.subtotal ?? item.price * item.quantity ?? 0),
    0,
  );

  const handleQuantityChange = async (item, nextQuantity) => {
    if (nextQuantity < 1) return;
    if (item.stock != null && nextQuantity > item.stock) return;

    // เปลี่ยนจำนวนบนหน้าจอทันที
    setCart((prev) => ({
      ...prev,
      items: prev.items.map((i) =>
        i.cart_item_id === item.cart_item_id
          ? {
              ...i,
              quantity: nextQuantity,
              subtotal: nextQuantity * Number(i.price),
            }
          : i,
      ),
    }));

    try {
      await cartService.updateItem(item.cart_item_id, nextQuantity);
    } catch (err) {
      console.error(err);
      setError("อัปเดตจำนวนสินค้าไม่สำเร็จ");
      loadCart();
    }
  };

  const handleRemove = async (item) => {
    setUpdatingId(item.cart_item_id);
    try {
      const res = await cartService.removeItem(item.cart_item_id);
      setCart(res?.data || null);
    } catch (err) {
      console.error(err);
      setError("ลบสินค้าออกจากตะกร้าไม่สำเร็จ");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleClear = async () => {
    setUpdatingId("clear");
    try {
      await cartService.clearCart();
      await loadCart();
    } catch (err) {
      console.error(err);
      setError("ล้างตะกร้าไม่สำเร็จ");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="tck-cart">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap');

        .tck-cart {
          --bg: #EEF1F5;
          --surface: #FFFFFF;
          --ink: #10131A;
          --muted: #626C7A;
          --accent: #2B59FF;
          --danger: #C0392B;
          --line: #D8DEE8;

          background: var(--bg);
          color: var(--ink);
          font-family: 'Inter', sans-serif;
          min-height: 100%;
          padding: 28px 24px 64px;
        }

        .tck-cart-wrap {
          max-width: 900px;
          margin: 0 auto;
        }

        .tck-cart-back {
          background: transparent;
          border: 1px solid var(--line);
          color: var(--ink);
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12.5px;
          padding: 7px 12px;
          border-radius: 8px;
          cursor: pointer;
          margin-bottom: 18px;
        }
        .tck-cart-back:hover { border-color: var(--accent); color: var(--accent); }

        .tck-cart-head {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 18px;
        }
        .tck-cart-title {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 28px;
          margin: 0;
        }
        .tck-cart-count {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12.5px;
          color: var(--muted);
        }

        .tck-cart-error {
          background: #FDEDEC;
          border: 1px solid #F5C6C0;
          color: var(--danger);
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 14px;
          margin-bottom: 18px;
        }

        .tck-cart-empty {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: 16px;
          padding: 48px 24px;
          text-align: center;
          color: var(--muted);
        }
        .tck-cart-empty-cta {
          margin-top: 16px;
          display: inline-flex;
          background: var(--ink);
          color: #fff;
          border: none;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 14.5px;
          padding: 11px 20px;
          border-radius: 10px;
          cursor: pointer;
        }
        .tck-cart-empty-cta:hover { background: var(--accent); }

        .tck-cart-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .tck-cart-item {
          display: flex;
          align-items: center;
          gap: 16px;
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: 14px;
          padding: 14px;
        }
        .tck-cart-item-media {
          width: 76px;
          height: 76px;
          border-radius: 10px;
          overflow: hidden;
          background: #F4F6F9;
          flex-shrink: 0;
        }
        .tck-cart-item-media img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .tck-cart-item-info {
          flex: 1;
          min-width: 0;
        }
        .tck-cart-item-name {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 15px;
          margin: 0 0 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .tck-cart-item-price {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 13px;
          color: var(--muted);
        }
        .tck-cart-item-stock-warn {
          font-size: 12.5px;
          color: var(--danger);
          margin-top: 4px;
        }

        .tck-qty {
          display: flex;
          align-items: center;
          border: 1px solid var(--line);
          border-radius: 8px;
          overflow: hidden;
        }
        .tck-qty button {
          width: 30px;
          height: 30px;
          border: none;
          background: #F6F8FB;
          color: var(--ink);
          font-size: 16px;
          cursor: pointer;
        }
        .tck-qty button:disabled { opacity: 0.4; cursor: not-allowed; }
        .tck-qty span {
          width: 36px;
          text-align: center;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 14px;
        }

        .tck-cart-item-subtotal {
          width: 96px;
          text-align: right;
          font-family: 'IBM Plex Mono', monospace;
          font-weight: 600;
          font-size: 14.5px;
        }

        .tck-cart-item-remove {
          background: transparent;
          border: 1px solid var(--line);
          color: var(--muted);
          border-radius: 8px;
          width: 32px;
          height: 32px;
          cursor: pointer;
          flex-shrink: 0;
        }
        .tck-cart-item-remove:hover { border-color: var(--danger); color: var(--danger); }
        .tck-cart-item-remove:disabled { opacity: 0.4; cursor: not-allowed; }

        .tck-cart-summary {
          margin-top: 20px;
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: 16px;
          padding: 20px 22px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .tck-cart-summary-total {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 22px;
        }
        .tck-cart-summary-actions {
          display: flex;
          gap: 10px;
        }
        .tck-cart-clear {
          background: transparent;
          border: 1px solid var(--line);
          color: var(--danger);
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          font-size: 14px;
          padding: 11px 16px;
          border-radius: 10px;
          cursor: pointer;
        }
        .tck-cart-clear:disabled { opacity: 0.5; cursor: not-allowed; }
        .tck-cart-checkout {
          background: var(--ink);
          color: #fff;
          border: none;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 14.5px;
          padding: 12px 20px;
          border-radius: 10px;
          cursor: pointer;
        }
        .tck-cart-checkout:hover { background: var(--accent); }
        .tck-cart-checkout:disabled { opacity: 0.5; cursor: not-allowed; }

        .tck-cart-loading {
          text-align: center;
          color: var(--muted);
          padding: 60px 0;
          font-family: 'IBM Plex Mono', monospace;
        }
      `}</style>

      <div className="tck-cart-wrap">
        <button type="button" className="tck-cart-back" onClick={() => navigate("/")}>
          ← กลับหน้าแรก
        </button>

        <div className="tck-cart-head">
          <h1 className="tck-cart-title">ตะกร้าสินค้า</h1>
          <span className="tck-cart-count">{items.length} รายการ</span>
        </div>

        {error && <div className="tck-cart-error">{error}</div>}

        {loading ? (
          <div className="tck-cart-loading">กำลังโหลด...</div>
        ) : items.length === 0 ? (
          <div className="tck-cart-empty">
            <p>ตะกร้าของคุณยังว่างอยู่</p>
            <button type="button" className="tck-cart-empty-cta" onClick={() => navigate("/")}>
              เลือกซื้อสินค้า →
            </button>
          </div>
        ) : (
          <>
            <div className="tck-cart-list">
              {items.map((item) => {
                const name = item.product_name;

                

                const image = item.image
                  ? `http://localhost:5000${item.image}`
                  : "https://placehold.co/150x150?text=No+Image";

                

                
                const atMaxStock = item.stock != null && item.quantity >= item.stock;

                return (
                  <div className="tck-cart-item" key={item.cart_item_id}>
                    <div className="tck-cart-item-media">
                      <img src={image} alt={name} />
                    </div>

                    <div className="tck-cart-item-info">
                      <h3 className="tck-cart-item-name">{name}</h3>
                      <span className="tck-cart-item-price">
                        ฿{Number(item.price || 0).toLocaleString()} / ชิ้น
                      </span>
                      {item.status !== "ACTIVE" && (
                        <div className="tck-cart-item-stock-warn">
                          สินค้านี้ไม่พร้อมจำหน่ายแล้ว
                        </div>
                      )}
                    </div>

                    <div className="tck-qty">
                      <button
                        type="button"
                        disabled={item.quantity <= 1}
                        onClick={() =>
                          handleQuantityChange(item, item.quantity - 1)
                        }
                      >
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        disabled={atMaxStock}
                        onClick={() =>
                          handleQuantityChange(item, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>

                    <div className="tck-cart-item-subtotal">
                      ฿{Number(item.subtotal || 0).toLocaleString()}
                    </div>

                    <button
                      type="button"
                      className="tck-cart-item-remove"
                      disabled={false}
                      onClick={() => handleRemove(item)}
                      aria-label="ลบสินค้า"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="tck-cart-summary">
              <div>
                <div className="tck-cart-count">ยอดรวม</div>
                <div className="tck-cart-summary-total">
                  ฿{Number(total || 0).toLocaleString()}
                </div>
              </div>

              <div className="tck-cart-summary-actions">
                <button
                  type="button"
                  className="tck-cart-clear"
                  disabled={updatingId === "clear"}
                  onClick={handleClear}
                >
                  ล้างตะกร้า
                </button>
                <button
                  type="button"
                  className="tck-cart-checkout"
                  disabled={items.length === 0}
                  onClick={() => navigate("/checkout")}
                >
                  ดำเนินการชำระเงิน →
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
