import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import productService from "../services/productService";
import "../styles/tckTheme.css";
import cartService from "../services/cartService";
import { Dropdown } from "react-bootstrap";

const API_URL = "http://localhost:5000";

function PortRail() {
  // Signature motif: a strip of notches echoing a laptop's side I/O ports
  const notches = [
    { w: 14, r: 3 },
    { w: 22, r: 3 },
    { w: 10, r: 10 },
    { w: 30, r: 3 },
    { w: 14, r: 3 },
    { w: 18, r: 10 },
    { w: 26, r: 3 },
    { w: 12, r: 3 },
  ];
  return (
    <div className="tck-portrail" aria-hidden="true">
      {notches.map((n, i) => (
        <span
          key={i}
          className="tck-notch"
          style={{ width: n.w, borderRadius: n.r }}
        />
      ))}
    </div>
  );
}

export default function Homepage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [addingId, setAddingId] = useState(null);
  const [cartMessage, setCartMessage] = useState("");

  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    sessionStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await productService.getAllProducts();
        const allProducts = Array.isArray(res?.data) ? res.data : [];
        setProducts(allProducts.slice(0, 4));
      } catch (error) {
        console.error(error);
        setProducts([]);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = async (product) => {
    if (!token) {
      navigate("/login");
      return;
    }

    setAddingId(product.product_id);
    setCartMessage("");
    try {
      await cartService.addItem(product.product_id, 1);
      setCartMessage(`เพิ่ม "${product.product_name}" ลงตะกร้าแล้ว`);
    } catch (error) {
      console.error(error);
      const msg = error?.response?.data?.message || "เพิ่มสินค้าลงตะกร้าไม่สำเร็จ";
      setCartMessage(msg);
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="tck-home">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap');

        .tck-home {
          --bg: #EEF1F5;
          --surface: #FFFFFF;
          --ink: #10131A;
          --muted: #626C7A;
          --accent: #2B59FF;
          --accent-ink: #FFFFFF;
          --led: #00D084;
          --line: #D8DEE8;

          background: var(--bg);
          color: var(--ink);
          font-family: 'Inter', sans-serif;
          min-height: 100%;
          padding: 28px 24px 64px;
        }

        .tck-mono {
          font-family: 'IBM Plex Mono', monospace;
        }

        /* Customer Navbar */
        .tck-nav-wrap {
          max-width: 1100px;
          margin: 0 auto 12px;
        }
        .tck-nav {
          display: flex;
          align-items: center;
          gap: 18px;
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: 12px;
          padding: 12px 14px;
        }
        .tck-logo {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 18px;
          margin-right: 4px;
          cursor: pointer;
        }
        .tck-nav-links {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .tck-nav-link {
          border: 1px solid transparent;
          background: transparent;
          color: var(--ink);
          font-size: 14px;
          padding: 7px 10px;
          border-radius: 8px;
          cursor: pointer;
        }
        .tck-nav-link:hover {
          border-color: var(--line);
          background: #F6F8FB;
        }
        .tck-nav-spacer {
          margin-left: auto;
        }

        /* Topbar */
        .tck-topbar {
          display: flex;
          justify-content: flex-end;
          max-width: 1100px;
          margin: 0 auto 8px;
        }
        .tck-logout {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: transparent;
          border: 1px solid var(--line);
          color: var(--muted);
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
          letter-spacing: 0.03em;
          padding: 7px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: border-color 0.15s ease, color 0.15s ease;
        }
        .tck-logout:hover { border-color: #C0392B; color: #C0392B; }
        .tck-logout:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

        /* Hero */
        .tck-hero {
          max-width: 1100px;
          margin: 8px auto 0;
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: 20px;
          padding: 48px 44px 32px;
        }
        .tck-eyebrow {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 10px;
        }
        .tck-title {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: clamp(32px, 5vw, 52px);
          line-height: 1.05;
          margin: 0 0 10px;
          letter-spacing: -0.01em;
        }
        .tck-sub {
          color: var(--muted);
          font-size: 16px;
          margin: 0 0 26px;
        }
        .tck-cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--ink);
          color: #fff;
          border: none;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 15px;
          padding: 13px 22px;
          border-radius: 10px;
          cursor: pointer;
          transition: transform 0.15s ease, background 0.15s ease;
        }
        .tck-cta:hover { background: var(--accent); transform: translateY(-1px); }
        .tck-cta:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }

        .tck-portrail {
          display: flex;
          align-items: center;
          gap: 6px;
          margin: 30px 0 6px;
        }
        .tck-notch {
          height: 8px;
          background: var(--line);
        }

        /* Quick spec badges under hero */
        .tck-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 10px 24px;
          margin-top: 16px;
        }
        .tck-badge {
          display: flex;
          align-items: center;
          gap: 7px;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12.5px;
          color: var(--muted);
        }
        .tck-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--led);
          box-shadow: 0 0 0 3px rgba(0,208,132,0.15);
        }

        /* Sections */
        .tck-section {
          max-width: 1100px;
          margin: 44px auto 0;
        }
        .tck-section-head {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 18px;
        }
        .tck-section-title {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 22px;
          margin: 0;
        }
        .tck-section-tag {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
          color: var(--muted);
          letter-spacing: 0.05em;
        }

        /* Product grid */
        .tck-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
        }
        @media (max-width: 900px) {
          .tck-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 520px) {
          .tck-grid { grid-template-columns: 1fr; }
          .tck-hero { padding: 36px 22px 26px; }
        }

        .tck-card {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: 16px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: box-shadow 0.15s ease, transform 0.15s ease;
        }
        .tck-card:hover {
          box-shadow: 0 10px 24px rgba(16,19,26,0.08);
          transform: translateY(-2px);
        }
        .tck-card-media {
          position: relative;
          height: 170px;
          background: #F4F6F9;
        }
        .tck-card-media img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .tck-price-tag {
          position: absolute;
          top: 10px;
          right: 10px;
          background: var(--ink);
          color: #fff;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12.5px;
          font-weight: 600;
          padding: 5px 9px;
          border-radius: 7px;
          transform: rotate(-2deg);
        }
        .tck-card-body {
          padding: 16px 16px 18px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .tck-card-title {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 15.5px;
          margin: 0 0 14px;
          line-height: 1.3;
        }
        .tck-card-link {
          margin-top: auto;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: transparent;
          border: 1px solid var(--line);
          color: var(--ink);
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          font-size: 13.5px;
          padding: 9px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
        }
        .tck-card-link:hover {
          background: var(--accent);
          border-color: var(--accent);
          color: #fff;
        }
        .tck-card-link:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

        /* Why choose - spec sheet list */
        .tck-spec-list {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: 16px;
          padding: 6px 22px;
        }
        .tck-spec-row {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 0;
        }
        .tck-spec-row + .tck-spec-row {
          border-top: 1px solid var(--line);
        }
        .tck-spec-mark {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          color: var(--accent);
          border: 1px solid var(--line);
          border-radius: 6px;
          padding: 3px 6px;
          flex-shrink: 0;
        }
        .tck-spec-text {
          font-size: 14.5px;
          color: var(--ink);
        }
        .tck-spec-text b { font-weight: 600; }

        @media (prefers-reduced-motion: reduce) {
          .tck-cta, .tck-card, .tck-card-link { transition: none; }
        }
      `}</style>

      {token && (
        <div className="tck-nav-wrap">
          <div className="tck-nav">
            <button
              type="button"
              className="tck-logo tck-nav-link"
              onClick={() => navigate("/")}
            >
              TleComKub
            </button>

            <div className="tck-nav-links">
              <button
                type="button"
                className="tck-nav-link"
                onClick={() => navigate("/")}
              >
                Home
              </button>
              <button
                type="button"
                className="tck-nav-link"
                onClick={() => navigate("/products")}
              >
                Products
              </button>
              <button
                type="button"
                className="tck-nav-link"
                onClick={() => navigate("/cart")}
              >
                Cart
              </button>
              <button
                type="button"
                className="tck-nav-link"
                onClick={() => navigate("/orders")}
              >
                Orders
              </button>
             
              <button
                type="button"
                className="tck-nav-link"
                onClick={() => navigate("/my-account")}
              >
                My Account
              </button>
            </div>

            <div className="tck-nav-spacer" />

            <Dropdown align="end">
              <Dropdown.Toggle variant="light" className="border-0 bg-white">
                {user?.first_name || "Account"}
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item onClick={() => navigate("/my-account")}>
                  My Account
                </Dropdown.Item>

                {(user?.role_id === 2 || user?.role_id === 3) && (
                  <Dropdown.Item onClick={() => navigate("/admin/dashboard")}>
                    Admin Console
                  </Dropdown.Item>
                )}

                <Dropdown.Divider />

                <Dropdown.Item onClick={handleLogout} className="text-danger">
                  Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
      )}

      <section className="tck-hero">
        <div className="tck-eyebrow">
          TLECOMKUB / COMPUTER SETS &amp; NOTEBOOKS
        </div>
        <h1 className="tck-title">
          ทุกสเปกที่ใช่
          <br />
          ในราคาที่คุ้ม
        </h1>
        <p className="tck-sub">
          คอมพิวเตอร์ตั้งโต๊ะและโน้ตบุ๊กของแท้ พร้อมประกันศูนย์
        </p>
        <button
          type="button"
          className="tck-cta"
          onClick={() => navigate("/products")}
        >
          เลือกซื้อสินค้า →
        </button>

        <PortRail />

        <div className="tck-badges">
          <span className="tck-badge">
            <span className="tck-dot" />
            ของแท้ 100%
          </span>
          <span className="tck-badge">
            <span className="tck-dot" />
            ประกันศูนย์
          </span>
          <span className="tck-badge">
            <span className="tck-dot" />
            ชำระเงินปลอดภัย
          </span>
          <span className="tck-badge">
            <span className="tck-dot" />
            จัดส่งไว
          </span>
        </div>
      </section>

      <section className="tck-section">
        <div className="tck-section-head">
          <h2 className="tck-section-title">สินค้าแนะนำ</h2>
          <span className="tck-section-tag tck-mono">
            FEATURED — {products.length} ITEMS
          </span>
        </div>

        <div className="tck-grid">
          {products.map((product) => (
            <div className="tck-card" key={product.product_id}>
              <div className="tck-card-media">
                <img
                  src={
                    product.image
                      ? `${API_URL}${product.image}`
                      : "https://placehold.co/300x200?text=No+Image"
                  }
                  alt={product.product_name}
                />
                <span className="tck-price-tag">
                  ฿{Number(product.price || 0).toLocaleString()}
                </span>
              </div>
              <div className="tck-card-body">
                <h3 className="tck-card-title">{product.product_name}</h3>

                <div className="tck-card-actions">
                  <button
                    type="button"
                    className="tck-card-link"
                    onClick={() => navigate(`/products/${product.product_id}`)}
                  >
                    ดูรายละเอียด →
                  </button>

                  <button
                    type="button"
                    className="tck-add-cart"
                    disabled={addingId === product.product_id}
                    onClick={() => handleAddToCart(product)}
                  >
                    {addingId === product.product_id
                      ? "กำลังเพิ่ม..."
                      : "หยิบใส่ตะกร้า"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="tck-section">
        <div className="tck-section-head">
          <h2 className="tck-section-title">ทำไมต้อง TleComKub</h2>
        </div>

        <div className="tck-spec-list">
          <div className="tck-spec-row">
            <span className="tck-spec-mark tck-mono">GEN</span>
            <span className="tck-spec-text">
              <b>สินค้าของแท้</b> —
              นำเข้าและจัดจำหน่ายโดยตัวแทนที่ได้รับการรับรอง
            </span>
          </div>
          <div className="tck-spec-row">
            <span className="tck-spec-mark tck-mono">WTY</span>
            <span className="tck-spec-text">
              <b>ประกันศูนย์</b> — รับประกันสินค้าตามมาตรฐานผู้ผลิตทุกชิ้น
            </span>
          </div>
          <div className="tck-spec-row">
            <span className="tck-spec-mark tck-mono">SEC</span>
            <span className="tck-spec-text">
              <b>ชำระเงินปลอดภัย</b> — ระบบชำระเงินเข้ารหัสมาตรฐานสากล
            </span>
          </div>
          <div className="tck-spec-row">
            <span className="tck-spec-mark tck-mono">SHP</span>
            <span className="tck-spec-text">
              <b>จัดส่งรวดเร็ว</b> — พร้อมติดตามสถานะพัสดุแบบเรียลไทม์
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
