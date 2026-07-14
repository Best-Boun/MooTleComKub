import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import productService from "../services/productService";
import CustomerNavbar from "../components/layout/CustomerNavbar";
import "../styles/tckTheme.css";

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

  return (
    <div className="tck-home">
      <CustomerNavbar />

      <section className="tck-hero">
        <div className="tck-eyebrow">TLECOMKUB / COMPUTER SETS &amp; NOTEBOOKS</div>
        <h1 className="tck-title">
          ทุกสเปกที่ใช่
          <br />
          ในราคาที่คุ้ม
        </h1>
        <p className="tck-sub">คอมพิวเตอร์ตั้งโต๊ะและโน้ตบุ๊กของแท้ พร้อมประกันศูนย์</p>
        <button type="button" className="tck-cta" onClick={() => navigate("/products")}>
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
          <span className="tck-section-tag tck-mono">FEATURED — {products.length} ITEMS</span>
        </div>

        <div className="tck-grid">
          {products.map((product) => (
            <div className="tck-card" key={product.product_id}>
              <div className="tck-card-media">
                <img
                  src={product.image || "https://placehold.co/300x200?text=No+Image"}
                  alt={product.product_name}
                />
                <span className="tck-price-tag">
                  ฿{Number(product.price || 0).toLocaleString()}
                </span>
              </div>
              <div className="tck-card-body">
                <h3 className="tck-card-title">{product.product_name}</h3>
                <button
                  type="button"
                  className="tck-card-link"
                  onClick={() => navigate(`/products/${product.product_id}`)}
                >
                  ดูรายละเอียด →
                </button>
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
              <b>สินค้าของแท้</b> — นำเข้าและจัดจำหน่ายโดยตัวแทนที่ได้รับการรับรอง
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
