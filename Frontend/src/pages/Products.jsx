import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import productService from "../services/productService";
import categoryService from "../services/categoryService";
import CustomerNavbar from "../components/layout/CustomerNavbar";
import "../styles/tckTheme.css";

const SORT_OPTIONS = [
  { value: "newest", label: "ล่าสุด" },
  { value: "price_asc", label: "ราคา: ต่ำ → สูง" },
  { value: "price_desc", label: "ราคา: สูง → ต่ำ" },
  { value: "name_asc", label: "ชื่อ: ก → ฮ" },
];

export default function Products() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [inStockOnly, setInStockOnly] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setErrorMsg("");

        const [productRes, categoryRes] = await Promise.all([
          productService.getAllProducts(),
          categoryService.getAllCategories(),
        ]);

        setProducts(Array.isArray(productRes?.data) ? productRes.data : []);
        setCategories(Array.isArray(categoryRes?.data) ? categoryRes.data : []);
      } catch (error) {
        console.error(error);
        setErrorMsg("โหลดข้อมูลสินค้าไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
        setProducts([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleReset = () => {
    setSearch("");
    setCategoryId("");
    setSortBy("newest");
    setInStockOnly(false);
  };

  const visibleProducts = useMemo(() => {
    const q = search.trim().toLowerCase();

    let list = products
      // ซ่อนสินค้าที่ปิดการขายจากฝั่งลูกค้า
      .filter((p) => (p.status ? p.status === "ACTIVE" : true))
      .filter((p) => !categoryId || String(p.category_id) === categoryId)
      .filter((p) => !inStockOnly || Number(p.stock) > 0)
      .filter((p) => {
        if (!q) return true;
        return (
          (p.product_name || "").toLowerCase().includes(q) ||
          (p.brand_name || "").toLowerCase().includes(q) ||
          (p.sku || "").toLowerCase().includes(q)
        );
      });

    switch (sortBy) {
      case "price_asc":
        list = [...list].sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
        break;
      case "price_desc":
        list = [...list].sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
        break;
      case "name_asc":
        list = [...list].sort((a, b) =>
          (a.product_name || "").localeCompare(b.product_name || "", "th"),
        );
        break;
      default:
        // newest -> เรียงตาม product_id มากไปน้อย (ตามที่ backend ส่งมาอยู่แล้ว)
        list = [...list].sort((a, b) => Number(b.product_id) - Number(a.product_id));
    }

    return list;
  }, [products, search, categoryId, sortBy, inStockOnly]);

  return (
    <div className="tck-home">
      <CustomerNavbar />

      <style>{`
        .tck-filter-bar {
          max-width: 1100px;
          margin: 0 auto;
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: 16px;
          padding: 18px 20px;
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          align-items: center;
        }
        .tck-filter-search {
          flex: 1 1 220px;
          display: flex;
          align-items: center;
          gap: 8px;
          border: 1px solid var(--line);
          border-radius: 10px;
          padding: 10px 12px;
          background: #F9FAFC;
        }
        .tck-filter-search input {
          border: none;
          background: transparent;
          outline: none;
          font-size: 14px;
          width: 100%;
          color: var(--ink);
          font-family: 'Inter', sans-serif;
        }
        .tck-filter-select {
          border: 1px solid var(--line);
          border-radius: 10px;
          padding: 10px 12px;
          font-size: 14px;
          background: #F9FAFC;
          color: var(--ink);
          font-family: 'Inter', sans-serif;
          cursor: pointer;
        }
        .tck-filter-check {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 13.5px;
          color: var(--muted);
          font-family: 'IBM Plex Mono', monospace;
          cursor: pointer;
          user-select: none;
        }
        .tck-filter-check input {
          accent-color: var(--accent);
          width: 15px;
          height: 15px;
          cursor: pointer;
        }
        .tck-filter-reset {
          margin-left: auto;
          border: 1px solid var(--line);
          background: transparent;
          color: var(--muted);
          font-size: 13.5px;
          padding: 10px 14px;
          border-radius: 10px;
          cursor: pointer;
        }
        .tck-filter-reset:hover { border-color: #C0392B; color: #C0392B; }

        .tck-skeleton-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
        }
        @media (max-width: 900px) { .tck-skeleton-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 520px) { .tck-skeleton-grid { grid-template-columns: 1fr; } }
        .tck-skeleton-card {
          height: 280px;
          border-radius: 16px;
          background: linear-gradient(90deg, #F0F2F6 25%, #F7F8FA 37%, #F0F2F6 63%);
          background-size: 400% 100%;
          animation: tck-shimmer 1.4s ease infinite;
        }
        @keyframes tck-shimmer {
          0% { background-position: 100% 50%; }
          100% { background-position: 0 50%; }
        }
        @media (prefers-reduced-motion: reduce) {
          .tck-skeleton-card { animation: none; }
        }
      `}</style>

      <section className="tck-hero" style={{ padding: "32px 44px" }}>
        <div className="tck-eyebrow">TLECOMKUB / CATALOG</div>
        <h1 className="tck-title" style={{ fontSize: "clamp(26px, 4vw, 38px)" }}>
          สินค้าทั้งหมด
        </h1>
        <p className="tck-sub" style={{ marginBottom: 0 }}>
          ค้นหาและกรองคอมพิวเตอร์ตั้งโต๊ะ โน้ตบุ๊ก และอุปกรณ์เสริมที่ใช่สำหรับคุณ
        </p>
      </section>

      <section className="tck-section" style={{ marginTop: 24 }}>
        <div className="tck-filter-bar">
          <div className="tck-filter-search">
            <span aria-hidden="true">🔍</span>
            <input
              type="text"
              placeholder="ค้นหาชื่อสินค้า, แบรนด์ หรือ SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="tck-filter-select"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">ทุกหมวดหมู่</option>
            {categories.map((c) => (
              <option key={c.category_id} value={String(c.category_id)}>
                {c.category_name}
              </option>
            ))}
          </select>

          <select
            className="tck-filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <label className="tck-filter-check">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
            />
            มีสินค้าเท่านั้น
          </label>

          <button type="button" className="tck-filter-reset" onClick={handleReset}>
            ล้างตัวกรอง
          </button>
        </div>
      </section>

      <section className="tck-section">
        <div className="tck-section-head">
          <h2 className="tck-section-title">รายการสินค้า</h2>
          <span className="tck-section-tag tck-mono">
            {loading ? "LOADING…" : `${visibleProducts.length} / ${products.length} ITEMS`}
          </span>
        </div>

        {loading && (
          <div className="tck-skeleton-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div className="tck-skeleton-card" key={i} />
            ))}
          </div>
        )}

        {!loading && errorMsg && (
          <div className="tck-empty">
            <div className="tck-empty-title">เกิดข้อผิดพลาด</div>
            <div>{errorMsg}</div>
          </div>
        )}

        {!loading && !errorMsg && visibleProducts.length === 0 && (
          <div className="tck-empty">
            <div className="tck-empty-title">ไม่พบสินค้าที่ตรงกับตัวกรอง</div>
            <div>ลองเปลี่ยนคำค้นหาหรือล้างตัวกรองดูอีกครั้ง</div>
          </div>
        )}

        {!loading && !errorMsg && visibleProducts.length > 0 && (
          <div className="tck-grid">
            {visibleProducts.map((product) => {
              const stock = Number(product.stock || 0);
              return (
                <div className="tck-card" key={product.product_id}>
                  <div className="tck-card-media">
                    <img
                      src={product.image || "https://placehold.co/300x200?text=No+Image"}
                      alt={product.product_name}
                    />
                    <span className={`tck-stock-tag${stock > 0 ? "" : " out"}`}>
                      {stock > 0 ? `เหลือ ${stock} ชิ้น` : "สินค้าหมด"}
                    </span>
                    <span className="tck-price-tag">
                      ฿{Number(product.price || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="tck-card-body">
                    <div className="tck-card-eyebrow">
                      {product.brand_name || "—"} · {product.category_name || "ไม่ระบุหมวดหมู่"}
                    </div>
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
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
