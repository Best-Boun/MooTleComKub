import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiShield } from "react-icons/fi";
import Swal from "sweetalert2";
import productService from "../services/productService";
import cartService from "../services/cartService";
import CustomerLayout from "../components/layout/CustomerLayout";
import "../styles/tckTheme.css";

const API_URL = import.meta.env.VITE_API_URL.replace("/api", "");

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  useEffect(() => {
    let isMounted = true;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setNotFound(false);
        setQuantity(1);
        setMessage("");

        const res = await productService.getProductById(id);

        if (!isMounted) return;

        if (!res?.success || !res?.data) {
          setNotFound(true);
          setProduct(null);
          return;
        }

        setProduct(res.data);

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

  const stock = Number(product?.stock || 0);

  const handleQuantityChange = (delta) => {
    setQuantity((prev) => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (stock > 0 && next > stock) return stock;
      return next;
    });
  };

  const handleAddToCart = async () => {
    if (!token) {
      Swal.fire({
        icon: "info",
        title: "กรุณาเข้าสู่ระบบ",
        text: "กรุณาเข้าสู่ระบบก่อนเพิ่มสินค้าลงตะกร้า",
      }).then(() => {
        navigate("/login");
      });
      return;
    }

    setBusy(true);
    setMessage("");
    try {
      await cartService.addItem(product.product_id, quantity);
    } catch (error) {
      console.error(error);
      setMessage(
        error?.response?.data?.message || "เพิ่มสินค้าลงตะกร้าไม่สำเร็จ",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleBuyNow = async () => {
    if (!token) {
      Swal.fire({
        icon: "info",
        title: "กรุณาเข้าสู่ระบบ",
        text: "กรุณาเข้าสู่ระบบก่อนสั่งซื้อสินค้า",
      }).then(() => {
        navigate("/login");
      });
      return;
    }

    setBusy(true);
    setMessage("");
    try {
      await cartService.addItem(product.product_id, quantity);
      navigate("/checkout");
    } catch (error) {
      console.error(error);
      setMessage(
        error?.response?.data?.message || "ไม่สามารถทำการซื้อได้",
      );
      setBusy(false);
    }
  };

  return (
    <CustomerLayout>
    <div className="tck-detail2">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap');

        .tck-detail2 {
          --bg: #F6F7F9;
          --surface: #FFFFFF;
          --ink: #1C1F26;
          --muted: #6B7280;
          --line: #E8E8EC;
          --accent: #E2574C;
          --accent-dark: #B8362D;
          --accent-tint: #FDEDEB;

          background: var(--bg);
          color: var(--ink);
          font-family: 'Inter', sans-serif;
          min-height: 100%;
          padding-bottom: 48px;
        }
        .tckd-mono { font-family: 'IBM Plex Mono', monospace; }

        .tckd-breadcrumb {
          max-width: 1180px;
          margin: 20px auto 16px;
          padding: 0 24px;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: var(--muted);
          flex-wrap: wrap;
        }
        .tckd-breadcrumb button {
          background: none;
          border: none;
          padding: 0;
          font-size: 13px;
          color: var(--accent-dark);
          cursor: pointer;
        }
        .tckd-breadcrumb span.current { color: var(--ink); font-weight: 500; }

        .tckd-wrap {
          max-width: 1180px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .tckd-top {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: 18px;
          padding: 32px;
          display: grid;
          grid-template-columns: 420px 1fr;
          gap: 36px;
        }
        @media (max-width: 800px) {
          .tckd-top { grid-template-columns: 1fr; padding: 20px; }
        }

        .tckd-media {
          border-radius: 14px;
          overflow: hidden;
          background: #F4F4F6;
          aspect-ratio: 4 / 3;
          position: relative;
          border: 1px solid var(--line);
        }
        .tckd-media img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .tckd-stock-tag {
          position: absolute;
          top: 12px;
          left: 12px;
          font-size: 12px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 20px;
          background: rgba(31,158,117,0.12);
          color: #12734F;
        }
        .tckd-stock-tag.out { background: rgba(226,87,76,0.12); color: var(--accent-dark); }

        .tckd-title {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: clamp(22px, 3vw, 30px);
          line-height: 1.25;
          margin: 6px 0 10px;
        }
        .tckd-meta-row {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: var(--muted);
          margin-bottom: 6px;
        }
        .tckd-meta-row a, .tckd-meta-row span.link {
          color: var(--accent-dark);
          font-weight: 600;
        }
        .tckd-price {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 32px;
          color: var(--accent-dark);
          margin: 12px 0 14px;
        }
        .tckd-warranty {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: var(--accent-tint);
          color: var(--accent-dark);
          font-size: 13px;
          padding: 6px 12px;
          border-radius: 20px;
          margin-bottom: 20px;
        }

        .tckd-qty-row {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 18px;
        }
        .tckd-qty-label { font-size: 13.5px; color: var(--muted); }
        .tckd-qty {
          display: flex;
          align-items: center;
          border: 1px solid var(--line);
          border-radius: 10px;
          overflow: hidden;
        }
        .tckd-qty button {
          width: 36px;
          height: 36px;
          border: none;
          background: #F6F7F9;
          font-size: 16px;
          cursor: pointer;
        }
        .tckd-qty button:disabled { opacity: 0.4; cursor: not-allowed; }
        .tckd-qty span {
          width: 44px;
          text-align: center;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 14px;
        }

        .tckd-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 8px;
        }
        .tckd-btn-cart {
          flex: 1;
          min-width: 160px;
          background: var(--accent-tint);
          color: var(--accent-dark);
          border: none;
          font-weight: 600;
          font-size: 14.5px;
          padding: 13px 20px;
          border-radius: 10px;
          cursor: pointer;
        }
        .tckd-btn-cart:hover { background: #FCDEDB; }
        .tckd-btn-buy {
          flex: 1;
          min-width: 160px;
          background: var(--accent);
          color: #fff;
          border: none;
          font-weight: 600;
          font-size: 14.5px;
          padding: 13px 20px;
          border-radius: 10px;
          cursor: pointer;
        }
        .tckd-btn-buy:hover { background: var(--accent-dark); }
        .tckd-actions button:disabled { opacity: 0.6; cursor: not-allowed; }

        .tckd-message {
          font-size: 13px;
          color: var(--accent-dark);
          background: var(--accent-tint);
          padding: 8px 12px;
          border-radius: 8px;
          margin-top: 10px;
        }

        .tckd-info-section {
          margin-top: 28px;
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: 18px;
          padding: 26px 30px;
        }
        .tckd-info-section + .tckd-info-section { margin-top: 20px; }
        .tckd-info-title {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 18px;
          margin: 0 0 16px;
        }
        .tckd-overview-text {
          font-size: 14.5px;
          line-height: 1.8;
          color: var(--ink);
          white-space: pre-line;
        }

        .tckd-spec-table { width: 100%; border-collapse: collapse; }
        .tckd-spec-table tr:nth-child(odd) td { background: #FAFAFB; }
        .tckd-spec-table td {
          padding: 12px 16px;
          font-size: 14px;
          border-bottom: 1px solid var(--line);
        }
        .tckd-spec-table td:first-child {
          color: var(--muted);
          width: 220px;
        }
        .tckd-spec-table td:last-child { font-weight: 500; }

        .tckd-section { margin-top: 36px; }
        .tckd-section-title {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 19px;
          margin: 0 0 16px;
        }
        .tckd-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        @media (max-width: 700px) { .tckd-grid { grid-template-columns: repeat(2, 1fr); } }
        .tckd-card {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: 14px;
          overflow: hidden;
          cursor: pointer;
          transition: box-shadow 0.15s ease, transform 0.15s ease;
        }
        .tckd-card:hover { box-shadow: 0 10px 22px rgba(0,0,0,0.06); transform: translateY(-2px); }
        .tckd-card-media { height: 140px; background: #F4F4F6; position: relative; }
        .tckd-card-media img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .tckd-card-price {
          position: absolute;
          top: 8px;
          right: 8px;
          background: var(--accent);
          color: #fff;
          font-size: 12px;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 6px;
        }
        .tckd-card-body { padding: 12px 14px; }
        .tckd-card-title { font-size: 13.5px; font-weight: 600; margin: 0; }

        .tckd-skel {
          border-radius: 18px;
          height: 420px;
          background: linear-gradient(90deg, #F0F2F6 25%, #F7F8FA 37%, #F0F2F6 63%);
          background-size: 400% 100%;
          animation: tckd-shimmer 1.4s ease infinite;
        }
        @keyframes tckd-shimmer {
          0% { background-position: 100% 50%; }
          100% { background-position: 0 50%; }
        }
        @media (prefers-reduced-motion: reduce) { .tckd-skel { animation: none; } }
      `}</style>

      <div className="tckd-breadcrumb">
        <button type="button" onClick={() => navigate("/")}>
          หน้าหลัก
        </button>
        {product?.category_name && (
          <>
            <span>›</span>
            <span>{product.category_name}</span>
          </>
        )}
        {product?.product_name && (
          <>
            <span>›</span>
            <span className="current">{product.product_name}</span>
          </>
        )}
      </div>

      <div className="tckd-wrap">
        {loading && <div className="tckd-skel" />}

        {!loading && notFound && (
          <div className="tck-empty">
            <div className="tck-empty-title">ไม่พบสินค้านี้</div>
            <div style={{ marginBottom: 16 }}>
              สินค้าอาจถูกลบหรือลิงก์ไม่ถูกต้อง
            </div>
            <button
              type="button"
              className="tckd-btn-buy"
              style={{ maxWidth: 200 }}
              onClick={() => navigate("/")}
            >
              กลับไปหน้าสินค้า →
            </button>
          </div>
        )}

        {!loading && !notFound && product && (
          <>
            <div className="tckd-top">
              <div className="tckd-media">
                <img
                  src={
                    product.image
                      ? `${API_URL}${product.image}`
                      : "https://placehold.co/500x400?text=No+Image"
                  }
                  alt={product.product_name}
                />
                <span className={`tckd-stock-tag${stock > 0 ? "" : " out"}`}>
                  {stock > 0 ? `เหลือ ${stock} ชิ้น` : "สินค้าหมด"}
                </span>
              </div>

              <div>
                <div className="tckd-meta-row">
                  <span>แบรนด์: {product.brand_name || "—"}</span>
                  <span>|</span>
                  <span className="tckd-mono">SKU: {product.sku || "—"}</span>
                </div>

                <h1 className="tckd-title">{product.product_name}</h1>

                <div className="tckd-price">
                  ฿{Number(product.price || 0).toLocaleString()}
                </div>

                <div className="tckd-warranty">
                  <FiShield size={15} />{" "}
                  {product.warranty_provider || "ไม่มีข้อมูลการรับประกัน"}
                </div>

                <div className="tckd-qty-row">
                  <span className="tckd-qty-label">จำนวน</span>
                  <div className="tckd-qty">
                    <button
                      type="button"
                      disabled={quantity <= 1}
                      onClick={() => handleQuantityChange(-1)}
                    >
                      −
                    </button>
                    <span>{quantity}</span>
                    <button
                      type="button"
                      disabled={stock > 0 && quantity >= stock}
                      onClick={() => handleQuantityChange(1)}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="tckd-actions">
                  <button
                    type="button"
                    className="tckd-btn-cart"
                    disabled={busy || stock <= 0}
                    onClick={handleAddToCart}
                  >
                    หยิบใส่ตะกร้า
                  </button>
                  <button
                    type="button"
                    className="tckd-btn-buy"
                    disabled={busy || stock <= 0}
                    onClick={handleBuyNow}
                  >
                    ซื้อสินค้า
                  </button>
                </div>

                {message && <div className="tckd-message">{message}</div>}
              </div>
            </div>

            <div className="tckd-info-section">
              <h2 className="tckd-info-title">ภาพรวม</h2>
              <p className="tckd-overview-text">
                {product.description ||
                  "ยังไม่มีคำอธิบายสินค้าสำหรับรายการนี้"}
              </p>
            </div>

            <div className="tckd-info-section">
              <h2 className="tckd-info-title">คุณสมบัติสินค้า</h2>
              <table className="tckd-spec-table">
                <tbody>
                  <tr>
                    <td>SKU</td>
                    <td className="tckd-mono">{product.sku || "—"}</td>
                  </tr>
                  <tr>
                    <td>การรับประกัน</td>
                    <td>
                      {product.warranty_provider ||
                        "ไม่มีข้อมูลการรับประกัน"}
                    </td>
                  </tr>
                  <tr>
                    <td>สถานะ</td>
                    <td>
                      {product.status === "ACTIVE"
                        ? "พร้อมจำหน่าย"
                        : "ปิดการขายชั่วคราว"}
                    </td>
                  </tr>
                  {Array.isArray(product.specs) &&
                    product.specs.map((s) => (
                      <tr key={s.spec_name}>
                        <td>{s.spec_name}</td>
                        <td>{s.spec_value || "-"}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {related.length > 0 && (
              <div className="tckd-section">
                <h2 className="tckd-section-title">สินค้าในหมวดหมู่เดียวกัน</h2>
                <div className="tckd-grid">
                  {related.map((p) => (
                    <div
                      className="tckd-card"
                      key={p.product_id}
                      onClick={() => navigate(`/products/${p.product_id}`)}
                    >
                      <div className="tckd-card-media">
                        <img
                          src={
                            p.image
                              ? `${API_URL}${p.image}`
                              : "https://placehold.co/300x200?text=No+Image"
                          }
                          alt={p.product_name}
                        />
                        <span className="tckd-card-price">
                          ฿{Number(p.price || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="tckd-card-body">
                        <h3 className="tckd-card-title">{p.product_name}</h3>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
    </CustomerLayout>
  );
}
