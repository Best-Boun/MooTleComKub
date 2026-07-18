import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import productService from "../services/productService";
import CustomerNavbar from "../components/layout/CustomerNavbar";
import "../styles/tckTheme.css";

const API_URL = "http://localhost:5000";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setNotFound(false);

        const res = await productService.getProductById(id);

        if (!isMounted) return;

        if (!res?.success || !res?.data) {
          setNotFound(true);
          setProduct(null);
          return;
        }

        setProduct(res.data);
        console.log(res.data);

        // สินค้าที่เกี่ยวข้อง: หมวดหมู่เดียวกัน ไม่รวมตัวมันเอง
        try {
          const allRes = await productService.getAllProducts();
          const all = Array.isArray(allRes?.data) ? allRes.data : [];

          const sameCategory = all
            .filter(
              (p) =>
                p.product_id !== res.data.product_id &&
                p.category_id === res.data.category_id &&
                (p.status ? p.status === "ACTIVE" : true),
            )
            .slice(0, 4);

          if (isMounted) setRelated(sameCategory);
        } catch {
          if (isMounted) setRelated([]);
        }
      } catch (error) {
        console.error(error);
        if (isMounted) setNotFound(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

  return (
    <div className="tck-home">
      <CustomerNavbar />

      <style>{`
        .tck-back {
          max-width: 1100px;
          margin: 0 auto 14px;
          display: flex;
        }
        .tck-back-link {
          border: none;
          background: transparent;
          color: var(--muted);
          font-size: 13.5px;
          cursor: pointer;
          padding: 4px 0;
        }
        .tck-back-link:hover { color: var(--ink); }

        .tck-detail {
          max-width: 1100px;
          margin: 0 auto;
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: 20px;
          padding: 36px;
          display: grid;
          grid-template-columns: 380px 1fr;
          gap: 32px;
        }
        @media (max-width: 800px) {
          .tck-detail { grid-template-columns: 1fr; padding: 24px; }
        }
        .tck-detail-media {
          border-radius: 16px;
          overflow: hidden;
          background: #F4F6F9;
          aspect-ratio: 4 / 3;
          position: relative;
        }
        .tck-detail-media img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .tck-detail-price {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 32px;
          margin: 10px 0 16px;
        }
        .tck-detail-desc {
          color: var(--muted);
          font-size: 14.5px;
          line-height: 1.7;
          margin: 18px 0 22px;
        }
        .tck-detail-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .tck-skel {
          border-radius: 20px;
          height: 420px;
          max-width: 1100px;
          margin: 0 auto;
          background: linear-gradient(90deg, #F0F2F6 25%, #F7F8FA 37%, #F0F2F6 63%);
          background-size: 400% 100%;
          animation: tck-shimmer-detail 1.4s ease infinite;
        }
        @keyframes tck-shimmer-detail {
          0% { background-position: 100% 50%; }
          100% { background-position: 0 50%; }
        }
        @media (prefers-reduced-motion: reduce) { .tck-skel { animation: none; } }
      `}</style>

      <div className="tck-back">
        <button
          type="button"
          className="tck-back-link"
          onClick={() => navigate("/products")}
        >
          ← กลับไปหน้าสินค้าทั้งหมด
        </button>
      </div>

      {loading && <div className="tck-skel" />}

      {!loading && notFound && (
        <div className="tck-empty" style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="tck-empty-title">ไม่พบสินค้านี้</div>
          <div style={{ marginBottom: 16 }}>
            สินค้าอาจถูกลบหรือลิงก์ไม่ถูกต้อง
          </div>
          <button
            type="button"
            className="tck-cta"
            onClick={() => navigate("/products")}
          >
            กลับไปหน้าสินค้า →
          </button>
        </div>
      )}

      {!loading && !notFound && product && (
        <>
          <div className="tck-detail">
            <div className="tck-detail-media">
              <img
                src={
                  product.image
                    ? `${API_URL}${product.image}`
                    : "https://placehold.co/500x400?text=No+Image"
                }
                alt={product.product_name}
              />
              <span
                className={`tck-stock-tag${Number(product.stock) > 0 ? "" : " out"}`}
              >
                {Number(product.stock) > 0
                  ? `เหลือ ${product.stock} ชิ้น`
                  : "สินค้าหมด"}
              </span>
            </div>

            <div>
              <div className="tck-eyebrow">
                {product.category_name || "ไม่ระบุหมวดหมู่"} ·{" "}
                {product.brand_name || "—"}
              </div>
              <h1
                className="tck-title"
                style={{ fontSize: "clamp(24px, 3.5vw, 34px)" }}
              >
                {product.product_name}
              </h1>
              <div className="tck-detail-price">
                ฿{Number(product.price || 0).toLocaleString()}
              </div>

              <p className="tck-detail-desc">
                {product.description || "ยังไม่มีคำอธิบายสินค้าสำหรับรายการนี้"}
              </p>

              <div className="tck-spec-list" style={{ marginBottom: 22 }}>
                <div className="tck-spec-row">
                  <span className="tck-spec-mark tck-mono">SKU</span>
                  <span className="tck-spec-text tck-mono">
                    {product.sku || "—"}
                  </span>
                </div>
                <div className="tck-spec-row">
                  <span className="tck-spec-mark tck-mono">WTY</span>
                  <span className="tck-spec-text">
                    {product.warranty_provider || "ไม่มีข้อมูลการรับประกัน"}
                  </span>
                </div>
                <div className="tck-spec-row">
                  <span className="tck-spec-mark tck-mono">STA</span>
                  <span className="tck-spec-text">
                    {product.status === "ACTIVE"
                      ? "พร้อมจำหน่าย"
                      : "ปิดการขายชั่วคราว"}
                  </span>
                </div>

                {product.cpu && (
                  <div className="tck-spec-row">
                    <span className="tck-spec-mark tck-mono">CPU</span>
                    <span className="tck-spec-text">{product.cpu}</span>
                  </div>
                )}

                {product.gpu && (
                  <div className="tck-spec-row">
                    <span className="tck-spec-mark tck-mono">GPU</span>
                    <span className="tck-spec-text">{product.gpu}</span>
                  </div>
                )}

                {product.ram && (
                  <div className="tck-spec-row">
                    <span className="tck-spec-mark tck-mono">RAM</span>
                    <span className="tck-spec-text">{product.ram}</span>
                  </div>
                )}

                {product.display && (
                  <div className="tck-spec-row">
                    <span className="tck-spec-mark tck-mono">Display</span>
                    <span className="tck-spec-text">{product.display}</span>
                  </div>
                )}

                {product.storage && (
                  <div className="tck-spec-row">
                    <span className="tck-spec-mark tck-mono">Storage</span>
                    <span className="tck-spec-text">{product.storage}</span>
                  </div>
                )}

                {product.mainboard && (
                  <div className="tck-spec-row">
                    <span className="tck-spec-mark tck-mono">MB</span>
                    <span className="tck-spec-text">{product.mainboard}</span>
                  </div>
                )}

                {product.power_supply && (
                  <div className="tck-spec-row">
                    <span className="tck-spec-mark tck-mono">PSU</span>
                    <span className="tck-spec-text">
                      {product.power_supply}
                    </span>
                  </div>
                )}

                {product.case_name && (
                  <div className="tck-spec-row">
                    <span className="tck-spec-mark tck-mono">CASE</span>
                    <span className="tck-spec-text">{product.case_name}</span>
                  </div>
                )}

                {product.cooling && (
                  <div className="tck-spec-row">
                    <span className="tck-spec-mark tck-mono">COOL</span>
                    <span className="tck-spec-text">{product.cooling}</span>
                  </div>
                )}
              </div>

              <div className="tck-detail-actions">
                <button
                  type="button"
                  className="tck-cta"
                  onClick={() => navigate("/products")}
                >
                  เลือกดูสินค้าอื่น →
                </button>
              </div>
            </div>
          </div>

          {related.length > 0 && (
            <section className="tck-section">
              <div className="tck-section-head">
                <h2 className="tck-section-title">สินค้าในหมวดหมู่เดียวกัน</h2>
              </div>
              <div className="tck-grid">
                {related.map((p) => (
                  <div className="tck-card" key={p.product_id}>
                    <div className="tck-card-media">
                      <img
                        src={
                          p.image
                            ? `${API_URL}${p.image}`
                            : "https://placehold.co/300x200?text=No+Image"
                        }
                        alt={p.product_name}
                      />
                      <span className="tck-price-tag">
                        ฿{Number(p.price || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="tck-card-body">
                      <h3 className="tck-card-title">{p.product_name}</h3>
                      <button
                        type="button"
                        className="tck-card-link"
                        onClick={() => navigate(`/products/${p.product_id}`)}
                      >
                        ดูรายละเอียด →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
