import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Dropdown } from "react-bootstrap";
import Swal from "sweetalert2";
import { FiMenu, FiSearch, FiShoppingCart } from "react-icons/fi";
import productService from "../services/productService";
import categoryService from "../services/categoryService";
import cartService from "../services/cartService";
import Footer from "../components/layout/Footer";
import logo from "../assets/ChatGPT_Image_Jul_19__2026__04_40_50_PM-removebg-preview.png";


const API_URL = "http://localhost:5000";

const SORT_OPTIONS = [
  { value: "newest", label: "ล่าสุด" },
  { value: "price_asc", label: "ราคา: ต่ำ → สูง" },
  { value: "price_desc", label: "ราคา: สูง → ต่ำ" },
  { value: "name_asc", label: "ชื่อ: ก → ฮ" },
];

export default function Homepage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);
  const [cartMessage, setCartMessage] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const cartPopupRef = useRef(null);

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeCategoryIds, setActiveCategoryIds] = useState([]);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [activeBrands, setActiveBrands] = useState([]);
  const [sortBy, setSortBy] = useState("newest");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  const [openSections, setOpenSections] = useState({
    category: true,
    price: true,
    brand: true,
  });
  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

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
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productRes, categoryRes] = await Promise.all([
          productService.getAllProducts(),
          categoryService.getAllCategories(),
        ]);

        setProducts(Array.isArray(productRes?.data) ? productRes.data : []);
        setCategories(Array.isArray(categoryRes?.data) ? categoryRes.data : []);
      } catch (error) {
        console.error(error);
        setProducts([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const loadCartCount = async () => {
      if (!token) return;
      try {
        const res = await cartService.getCart();
        const items = Array.isArray(res?.data?.items)
          ? res.data.items.filter((item) => item && item.cart_item_id)
          : [];
        setCartCount(items.length);
      } catch (error) {
        setCartCount(0);
      }
    };

    loadCartCount();
  }, [token]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (cartPopupRef.current && !cartPopupRef.current.contains(e.target)) {
        setCartOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCartToggle = async () => {
    const willOpen = !cartOpen;

    if (willOpen && !token) {
      Swal.fire({
        icon: "info",
        title: "กรุณาเข้าสู่ระบบ",
        text: "กรุณาเข้าสู่ระบบก่อนเพิ่มสินค้าลงตะกร้า",
      }).then(() => {
        navigate("/login");
      });
      return;
    }

    setCartOpen(willOpen);

    if (!willOpen || !token) return;

    setCartLoading(true);
    try {
      const [cartRes, productsRes] = await Promise.all([
        cartService.getCart(),
        productService.getAllProducts(),
      ]);

      const items = Array.isArray(cartRes?.data?.items)
        ? cartRes.data.items.filter((item) => item && item.cart_item_id)
        : [];

      const productsById = {};
      (Array.isArray(productsRes?.data) ? productsRes.data : []).forEach((p) => {
        productsById[p.product_id] = p;
      });

      const enriched = items.map((item) => ({
        ...item,
        product: productsById[item.product_id],
      }));

      const total = enriched.reduce(
        (sum, item) => sum + Number(item.subtotal ?? item.price * item.quantity ?? 0),
        0,
      );

      setCartItems(enriched);
      setCartTotal(total);
      setCartCount(enriched.length);
    } catch (error) {
      setCartItems([]);
      setCartTotal(0);
    } finally {
      setCartLoading(false);
    }
  };

  const handleGoToCart = () => {
    setCartOpen(false);
    navigate("/cart");
  };

  useEffect(() => {
    setActiveBrands([]);
  }, [activeCategoryIds]);

  const priceBounds = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 0 };
    const prices = products.map((p) => Number(p.price) || 0);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [products]);

  const activeCategoryLabel = useMemo(() => {
    if (activeCategoryIds.length === 0) return "สินค้าทั้งหมด";
    if (activeCategoryIds.length === 1) {
      const cat = categories.find(
        (c) => c.category_id === activeCategoryIds[0],
      );
      return cat?.category_name || "สินค้าทั้งหมด";
    }
    return `สินค้าที่เลือก (${activeCategoryIds.length} หมวดหมู่)`;
  }, [activeCategoryIds, categories]);

  const brands = useMemo(() => {
    const relevant = products.filter(
      (p) =>
        activeCategoryIds.length === 0 ||
        activeCategoryIds.includes(p.category_id),
    );
    return [...new Set(relevant.map((p) => p.brand_name).filter(Boolean))].sort();
  }, [products, activeCategoryIds]);

  const toggleCategory = (categoryId) => {
    setActiveCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  };

  const toggleBrand = (brandName) => {
    setActiveBrands((prev) =>
      prev.includes(brandName)
        ? prev.filter((b) => b !== brandName)
        : [...prev, brandName],
    );
  };

  const handleClearFilters = () => {
    setActiveCategoryIds([]);
    setPriceMin("");
    setPriceMax("");
    setActiveBrands([]);
    setSortBy("newest");
    setInStockOnly(false);
    setSearch("");
  };

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();

    let list = products
      .filter((p) => (p.status ? p.status === "ACTIVE" : true))
      .filter(
        (p) =>
          activeCategoryIds.length === 0 ||
          activeCategoryIds.includes(p.category_id),
      )
      .filter(
        (p) => activeBrands.length === 0 || activeBrands.includes(p.brand_name),
      )
      .filter((p) => !inStockOnly || Number(p.stock) > 0)
      .filter((p) => {
        const price = Number(p.price) || 0;
        const matchMin = priceMin === "" || price >= Number(priceMin);
        const matchMax = priceMax === "" || price <= Number(priceMax);
        return matchMin && matchMax;
      })
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
        list = [...list].sort((a, b) => Number(b.product_id) - Number(a.product_id));
    }

    return list;
  }, [products, activeCategoryIds, priceMin, priceMax, activeBrands, sortBy, inStockOnly, search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategoryIds, priceMin, priceMax, activeBrands, sortBy, inStockOnly, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / productsPerPage),
  );

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * productsPerPage;
    return filteredProducts.slice(start, start + productsPerPage);
  }, [filteredProducts, currentPage]);

  const handleAddToCart = async (product) => {
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

    setAddingId(product.product_id);
    setCartMessage("");
    try {
      await cartService.addItem(product.product_id, 1);
      setCartCount((prev) => prev + 1);
    } catch (error) {
      console.error(error);
      const msg =
        error?.response?.data?.message || "เพิ่มสินค้าลงตะกร้าไม่สำเร็จ";
      setCartMessage(msg);
    } finally {
      setAddingId(null);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="tck-home2">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap');

        .tck-home2 {
          --page-bg: #F6F7F9;
          --surface: #FFFFFF;
          --ink: #1C1F26;
          --muted: #6B7280;
          --line: #E8E8EC;
          --accent: #E2574C;
          --accent-dark: #B8362D;
          --accent-tint: #FDEDEB;
          --accent-ink: #FFFFFF;
          --led: #1F9E75;

          background: var(--page-bg);
          color: var(--ink);
          font-family: 'Inter', sans-serif;
          min-height: 100%;
        }
        .tck2-mono { font-family: 'IBM Plex Mono', monospace; }

        /* Top utility bar */
        .tck2-utility {
          background: var(--ink);
          color: #D8DAE0;
          font-size: 12.5px;
        }
        .tck2-utility-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 6px 24px;
          display: flex;
          justify-content: flex-end;
          gap: 20px;
        }
        .tck2-utility-inner button {
          background: none;
          border: none;
          color: inherit;
          font-size: inherit;
          cursor: pointer;
        }
        .tck2-utility-inner button:hover { color: #fff; }

        /* Main navbar */
        .tck2-navbar {
          background: var(--surface);
          border-bottom: 1px solid var(--line);
        }
        .tck2-navbar-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 14px 24px;
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .tck2-hamburger {
          display: none;
          background: none;
          border: 1px solid var(--line);
          border-radius: 8px;
          width: 38px;
          height: 38px;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 18px;
          flex-shrink: 0;
        }
        .tck2-logo {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 22px;
          color: var(--ink);
          background: none;
          border: none;
          cursor: pointer;
          flex-shrink: 0;
        }
        .tck2-logo span { color: var(--accent); }
        .tck2-search {
          flex: 1;
          display: flex;
          max-width: 560px;
        }
        .tck2-search input {
          flex: 1;
          border: 1px solid var(--line);
          border-right: none;
          border-radius: 10px 0 0 10px;
          padding: 10px 14px;
          font-size: 14px;
          outline: none;
        }
        .tck2-search input:focus { border-color: var(--accent); }
        .tck2-search button {
          border: none;
          background: var(--accent);
          color: var(--accent-ink);
          padding: 0 18px;
          border-radius: 0 10px 10px 0;
          cursor: pointer;
          font-size: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .tck2-search button:hover { background: var(--accent-dark); }
        .tck2-nav-spacer { margin-left: auto; }
        .tck2-nav-actions {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .tck2-login-btn {
          border: none;
          background: var(--accent);
          color: #fff;
          font-weight: 600;
          font-size: 14px;
          padding: 9px 18px;
          border-radius: 10px;
          cursor: pointer;
          white-space: nowrap;
        }
        .tck2-login-btn:hover { background: var(--accent-dark); }
        .tck2-cart-btn {
          position: relative;
          border: 1px solid var(--line);
          background: transparent;
          border-radius: 10px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 18px;
        }
        .tck2-cart-btn:hover { border-color: var(--accent); }

        .tck2-cart-wrap { position: relative; }
        .tck2-cart-popup {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          width: 320px;
          background: #fff;
          border: 1px solid var(--line);
          border-radius: 14px;
          box-shadow: 0 16px 32px rgba(16,19,26,0.12);
          padding: 14px;
          z-index: 50;
        }
        .tck2-cart-empty {
          padding: 20px 4px;
          text-align: center;
          color: var(--muted);
          font-size: 13.5px;
        }
        .tck2-cart-empty button {
          margin-top: 10px;
          background: var(--accent);
          color: #fff;
          border: none;
          font-size: 13px;
          font-weight: 600;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
        }
        .tck2-cart-item {
          display: flex;
          gap: 10px;
          padding: 8px 2px;
          border-bottom: 1px solid var(--line);
        }
        .tck2-cart-item:last-of-type { border-bottom: none; }
        .tck2-cart-item-media {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          overflow: hidden;
          background: #F4F4F6;
          flex-shrink: 0;
        }
        .tck2-cart-item-media img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .tck2-cart-item-info { flex: 1; min-width: 0; }
        .tck2-cart-item-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--ink);
          margin: 0 0 3px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .tck2-cart-item-meta { font-size: 11.5px; color: var(--muted); }
        .tck2-cart-item-price {
          font-size: 13px;
          font-weight: 600;
          color: var(--accent-dark);
          flex-shrink: 0;
        }
        .tck2-cart-more {
          font-size: 12px;
          color: var(--muted);
          text-align: center;
          padding: 6px 0 2px;
        }
        .tck2-cart-summary {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 2px 12px;
          border-top: 1px solid var(--line);
          margin-top: 6px;
          font-size: 13px;
        }
        .tck2-cart-summary-total { font-weight: 700; font-size: 15px; color: var(--ink); }
        .tck2-cart-goto {
          width: 100%;
          background: var(--accent);
          color: #fff;
          border: none;
          font-weight: 600;
          font-size: 14px;
          padding: 11px;
          border-radius: 10px;
          cursor: pointer;
        }
        .tck2-cart-goto:hover { background: var(--accent-dark); }
        .tck2-cart-loading {
          padding: 20px 4px;
          text-align: center;
          color: var(--muted);
          font-size: 13px;
        }
        .tck2-cart-badge {
          position: absolute;
          top: -6px;
          right: -6px;
          background: var(--accent);
          color: #fff;
          font-size: 11px;
          font-weight: 600;
          min-width: 18px;
          height: 18px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
        }

        /* Layout: sidebar + main */
        .tck2-layout {
          max-width: 1280px;
          margin: 0 auto;
          padding: 24px 24px 0;
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 24px;
          align-items: start;
        }
        @media (max-width: 900px) {
          .tck2-layout { grid-template-columns: 1fr; }
          .tck2-sidebar { display: none; }
          .tck2-sidebar.open { display: block; }
          .tck2-hamburger { display: flex; }
          .tck2-search { display: none; }
        }

        .tck2-sidebar {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: 14px;
          padding: 18px;
          position: sticky;
          top: 16px;
        }
        .tck2-breadcrumb {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--muted);
          margin-bottom: 14px;
        }
        .tck2-breadcrumb button {
          background: none;
          border: none;
          padding: 0;
          font-size: 12px;
          color: var(--accent-dark);
          cursor: pointer;
        }
        .tck2-instock-toggle {
          padding-bottom: 12px;
          margin-bottom: 12px;
          border-bottom: 1px solid var(--line);
        }
        .tck2-accordion { border-bottom: 1px solid var(--line); }
        .tck2-accordion:last-of-type { border-bottom: none; }
        .tck2-accordion-head {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: none;
          border: none;
          padding: 12px 2px;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 14px;
          color: var(--ink);
          cursor: pointer;
        }
        .tck2-accordion-head span {
          font-size: 16px;
          color: var(--muted);
        }
        .tck2-accordion-body {
          max-height: 220px;
          overflow-y: auto;
          padding-bottom: 14px;
        }
        .tck2-sidebar-head {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 14px;
          margin-bottom: 12px;
        }
        .tck2-cat-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 7px 4px;
          font-size: 13.5px;
          cursor: pointer;
          border-radius: 6px;
          color: var(--ink);
        }
        .tck2-cat-item:hover { background: var(--accent-tint); }
        .tck2-cat-item.active { color: var(--accent-dark); font-weight: 600; }
        .tck2-cat-item input { accent-color: var(--accent); }
        .tck2-sidebar-divider {
          border: none;
          border-top: 1px solid var(--line);
          margin: 16px 0;
        }
        .tck2-range-slider {
          position: relative;
          height: 32px;
          margin-bottom: 10px;
        }
        .tck2-range-slider input[type="range"] {
          position: absolute;
          top: 12px;
          left: 0;
          width: 100%;
          margin: 0;
          background: none;
          pointer-events: none;
          -webkit-appearance: none;
          appearance: none;
        }
        .tck2-range-slider input[type="range"]::-webkit-slider-thumb {
          pointer-events: auto;
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--accent);
          border: 2px solid #fff;
          box-shadow: 0 0 0 1px var(--accent);
          cursor: pointer;
        }
        .tck2-range-slider input[type="range"]::-moz-range-thumb {
          pointer-events: auto;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--accent);
          border: 2px solid #fff;
          box-shadow: 0 0 0 1px var(--accent);
          cursor: pointer;
        }
        .tck2-range-slider input[type="range"]::-webkit-slider-runnable-track {
          height: 4px;
          background: transparent;
        }
        .tck2-range-track-base {
          position: absolute;
          top: 14px;
          left: 0;
          right: 0;
          height: 4px;
          background: var(--line);
          border-radius: 2px;
        }
        .tck2-range-track {
          position: absolute;
          top: 14px;
          height: 4px;
          background: var(--accent);
          border-radius: 2px;
        }
        .tck2-price-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .tck2-price-row input {
          width: 100%;
          border: 1px solid var(--line);
          border-radius: 8px;
          padding: 7px 8px;
          font-size: 13px;
        }
        .tck2-select {
          width: 100%;
          border: 1px solid var(--line);
          border-radius: 8px;
          padding: 8px;
          font-size: 13px;
          background: #fff;
          color: var(--ink);
          cursor: pointer;
        }
        .tck2-price-hint {
          font-size: 11.5px;
          color: var(--muted);
          margin-top: 6px;
        }
        .tck2-clear-filter {
          margin-top: 14px;
          width: 100%;
          background: transparent;
          border: 1px solid var(--line);
          border-radius: 8px;
          padding: 8px;
          font-size: 12.5px;
          color: var(--muted);
          cursor: pointer;
        }
        .tck2-clear-filter:hover { border-color: var(--accent); color: var(--accent-dark); }

        /* Hero */
        .tck2-hero {
          background: linear-gradient(120deg, var(--accent) 0%, var(--accent-dark) 100%);
          color: #fff;
          border-radius: 18px;
          padding: 40px 40px 32px;
          position: relative;
          overflow: hidden;
        }
        .tck2-hero-eyebrow {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          opacity: 0.85;
          margin-bottom: 10px;
        }
        .tck2-hero-title {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: clamp(26px, 4vw, 40px);
          line-height: 1.1;
          margin: 0 0 10px;
        }
        .tck2-hero-sub {
          font-size: 15px;
          opacity: 0.92;
          margin: 0 0 22px;
          max-width: 460px;
        }
        .tck2-hero-cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #fff;
          color: var(--accent-dark);
          border: none;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 14.5px;
          padding: 12px 20px;
          border-radius: 10px;
          cursor: pointer;
        }
        .tck2-hero-cta:hover { background: #FFF1EF; }

        .tck2-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 10px 24px;
          margin-top: 22px;
        }
        .tck2-badge {
          display: flex;
          align-items: center;
          gap: 7px;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
        }
        .tck2-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #fff;
        }

        /* Sections */
        .tck2-section { margin: 36px 0 0; }
        .tck2-section-head {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 16px;
        }
        .tck2-section-title {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 20px;
          margin: 0;
        }
        .tck2-section-tag {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
          color: var(--muted);
        }
        .tck2-section-right {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
        }
        .tck2-sort-select {
          border: 1px solid var(--line);
          border-radius: 8px;
          padding: 7px 10px;
          font-size: 13px;
          background: #fff;
          color: var(--ink);
          cursor: pointer;
        }

        .tck2-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        @media (max-width: 700px) {
          .tck2-grid { grid-template-columns: repeat(2, 1fr); }
        }

        .tck2-card {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: 14px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: box-shadow 0.15s ease, transform 0.15s ease;
        }
        .tck2-card:hover {
          box-shadow: 0 10px 22px rgba(0,0,0,0.06);
          transform: translateY(-2px);
        }
        .tck2-card-media {
          position: relative;
          height: 150px;
          background: #F4F4F6;
        }
        .tck2-card-media img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .tck2-sold-overlay {
  position: absolute;
  inset: 0;

  display: flex;
  justify-content: center;
  align-items: center;

  background: rgba(255,255,255,.35);
  backdrop-filter: blur(2px);
}

.tck2-sold-overlay::before,
.tck2-sold-overlay::after{
  content:"";
  position:absolute;

  width:170%;
  height:3px;

  background:rgba(255,255,255,.8);
}

.tck2-sold-overlay::before{
  transform:rotate(45deg);
}

.tck2-sold-overlay::after{
  transform:rotate(-45deg);
}

.tck2-sold-overlay span{
  z-index:10;

  background:rgba(0,0,0,.55);

  color:#fff;

  padding:8px 18px;

  border-radius:999px;

  font-size:18px;
  font-weight:700;
  letter-spacing:2px;
}

        .tck2-brand-tag {
          position: absolute;
          top: 8px;
          left: 8px;
          background: rgba(28,31,38,0.75);
          color: #fff;
          font-size: 10.5px;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 6px;
        }
        .tck2-stock-tag {
          position: absolute;
          top: 8px;
          right: 8px;
          font-size: 10.5px;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 20px;
          background: rgba(31,158,117,0.12);
          color: #12734F;
        }
        .tck2-stock-tag.out { background: rgba(226,87,76,0.12); color: var(--accent-dark); }
        .tck2-card-body {
          padding: 12px 14px 14px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .tck2-card-eyebrow {
          font-size: 11px;
          color: var(--muted);
          margin-bottom: 4px;
        }
        .tck2-card-title {
          font-size: 14px;
          font-weight: 600;
          margin: 0 0 8px;
          line-height: 1.3;
          min-height: 36px;
        }
        .tck2-card-price {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 17px;
          color: var(--accent-dark);
          margin-bottom: 10px;
        }
        .tck2-card-actions {
          margin-top: auto;
          display: flex;
          gap: 6px;
        }
        .tck2-card-link {
          flex: 1;
          background: transparent;
          border: 1px solid var(--line);
          color: var(--ink);
          font-size: 12.5px;
          padding: 8px 6px;
          border-radius: 8px;
          cursor: pointer;
        }
        .tck2-card-link:hover { border-color: var(--accent); color: var(--accent-dark); }
        .tck2-add-cart {
          flex: 1;
          background: var(--accent);
          border: none;
          color: #fff;
          font-size: 12.5px;
          font-weight: 600;
          padding: 8px 6px;
          border-radius: 8px;
          cursor: pointer;
        }
        .tck2-add-cart:hover { background: var(--accent-dark); }
        .tck2-add-cart:disabled { opacity: 0.6; cursor: not-allowed; }

        .tck2-empty {
          background: var(--surface);
          border: 1px dashed var(--line);
          border-radius: 14px;
          padding: 40px 20px;
          text-align: center;
          color: var(--muted);
          grid-column: 1 / -1;
        }

        .tck2-pagination {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 6px;
          margin-top: 22px;
        }
        .tck2-pagination button {
          border: 1px solid var(--line);
          background: var(--surface);
          color: var(--ink);
          font-size: 13px;
          padding: 8px 12px;
          border-radius: 8px;
          cursor: pointer;
        }
        .tck2-pagination button:hover { border-color: var(--accent); color: var(--accent-dark); }
        .tck2-pagination button.active {
          background: var(--accent);
          border-color: var(--accent);
          color: #fff;
        }
        .tck2-pagination button:disabled { opacity: 0.4; cursor: not-allowed; }

        .tck2-cart-msg {
          max-width: 1280px;
          margin: 12px auto 0;
          padding: 0 24px;
        }
        .tck2-cart-msg span {
          display: inline-block;
          background: var(--accent-tint);
          color: var(--accent-dark);
          font-size: 13px;
          padding: 8px 14px;
          border-radius: 8px;
        }

        /* Why choose */
        .tck2-spec-list {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: 14px;
          padding: 4px 20px;
        }
        .tck2-spec-row {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 0;
        }
        .tck2-spec-row + .tck2-spec-row { border-top: 1px solid var(--line); }
        .tck2-spec-mark {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          color: var(--accent-dark);
          border: 1px solid var(--line);
          border-radius: 6px;
          padding: 3px 6px;
          flex-shrink: 0;
        }
        .tck2-spec-text { font-size: 14px; }
        .tck2-spec-text b { font-weight: 600; }

        /* Footer */
        .tck-footer { margin-top: 48px; background: var(--surface); border-top: 1px solid var(--line); }
        .tck-footer-perks {
          max-width: 1280px;
          margin: 0 auto;
          padding: 22px 24px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          border-bottom: 1px solid var(--line);
        }
        @media (max-width: 800px) { .tck-footer-perks { grid-template-columns: repeat(2, 1fr); } }
        .tck-perk { display: flex; align-items: center; gap: 10px; }
        .tck-perk-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-dark);
          flex-shrink: 0;
        }
        .tck-perk-title { font-size: 13px; font-weight: 600; }
        .tck-perk-sub { font-size: 11.5px; color: var(--muted); }
        .tck-footer-main {
          max-width: 1280px;
          margin: 0 auto;
          padding: 28px 24px;
          display: grid;
          grid-template-columns: 1.4fr 1fr 1fr 1fr;
          gap: 24px;
        }
        @media (max-width: 800px) { .tck-footer-main { grid-template-columns: 1fr 1fr; } }
        .tck-footer-logo {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 18px;
          color: var(--accent-dark);
          margin-bottom: 8px;
        }
        .tck-footer-brand p { font-size: 13px; color: var(--muted); }
        .tck-footer-head { font-size: 13px; font-weight: 600; margin-bottom: 10px; }
        .tck-footer-col a {
          display: block;
          font-size: 13px;
          color: var(--muted);
          text-decoration: none;
          margin-bottom: 8px;
        }
        .tck-footer-col a:hover { color: var(--accent-dark); }
        .tck-footer-social { display: flex; gap: 10px; }
        .tck-footer-social span {
          border: 1px solid var(--line);
          border-radius: 8px;
          padding: 5px 10px;
          font-size: 11.5px;
          color: var(--muted);
        }
        .tck-footer-bottom {
          text-align: center;
          font-size: 12px;
          color: var(--muted);
          padding: 14px 24px;
          border-top: 1px solid var(--line);
        }

        @media (prefers-reduced-motion: reduce) {
          .tck2-card, .tck2-hero-cta, .tck2-add-cart { transition: none; }
        }
      `}</style>

      <div className="tck2-utility">
        <div className="tck2-utility-inner">
          <span>ส่งฟรีทั่วไทยเมื่อช้อปครบ 2,000.-</span>
          <button type="button" onClick={() => navigate("/orders")}>
            ติดตามคำสั่งซื้อ
          </button>
        </div>
      </div>

      <div className="tck2-navbar">
        <div className="tck2-navbar-inner">
          <button
            type="button"
            className="tck2-hamburger"
            onClick={() => setMobileNavOpen((prev) => !prev)}
            aria-label="เปิดเมนูหมวดหมู่"
          >
            <FiMenu size={18} />
          </button>

        <button
  type="button"
  className="tck2-logo"
  onClick={() => navigate("/")}
>
  <img
    src={logo}
    alt="MOOTLECOMKUB"
    style={{
      width: "100px",
      height: "100px",
      objectFit: "contain",
    }}
  />
</button>

          <form className="tck2-search" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="ค้นหาสินค้าที่ต้องการ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" aria-label="ค้นหา">
              <FiSearch size={17} />
            </button>
          </form>

          <div className="tck2-nav-spacer" />

          <div className="tck2-nav-actions">
            {token ? (
              <Dropdown align="end">
                <Dropdown.Toggle
                  variant="light"
                  className="border-0 bg-transparent"
                >
                  {user?.first_name || "บัญชีของฉัน"}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => navigate("/my-account")}>
                    บัญชีของฉัน
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => navigate("/orders")}>
                    คำสั่งซื้อของฉัน
                  </Dropdown.Item>
                  {(user?.role_id === 2 || user?.role_id === 3) && (
                    <Dropdown.Item onClick={() => navigate("/admin/dashboard")}>
                      Admin Console
                    </Dropdown.Item>
                  )}
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout} className="text-danger">
                    ออกจากระบบ
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <button
                type="button"
                className="tck2-login-btn"
                onClick={() => navigate("/login")}
              >
                เข้าสู่ระบบ
              </button>
            )}

            <div className="tck2-cart-wrap" ref={cartPopupRef}>
              <button
                type="button"
                className="tck2-cart-btn"
                onClick={handleCartToggle}
                aria-label="ตะกร้าสินค้า"
              >
                <FiShoppingCart size={18} />
                {cartCount > 0 && (
                  <span className="tck2-cart-badge">{cartCount}</span>
                )}
              </button>

              {cartOpen && (
                <div className="tck2-cart-popup">
                  {cartLoading ? (
                    <div className="tck2-cart-loading">กำลังโหลด...</div>
                  ) : cartItems.length === 0 ? (
                    <div className="tck2-cart-empty">
                      <div>ตะกร้าของคุณยังว่างอยู่</div>
                      <button type="button" onClick={() => setCartOpen(false)}>
                        เลือกซื้อสินค้า
                      </button>
                    </div>
                  ) : (
                    <>
                      {cartItems.slice(0, 3).map((item) => {
                        const name =
                          item.product?.product_name || `สินค้า #${item.product_id}`;
                        const image = item.product?.image
                          ? `${API_URL}${item.product.image}`
                          : "https://placehold.co/100x100?text=No+Image";

                        return (
                          <div className="tck2-cart-item" key={item.cart_item_id}>
                            <div className="tck2-cart-item-media">
                              <img src={image} alt={name} />
                            </div>
                            <div className="tck2-cart-item-info">
                              <div className="tck2-cart-item-name">{name}</div>
                              <div className="tck2-cart-item-meta">
                                จำนวน: {item.quantity}
                              </div>
                            </div>
                            <div className="tck2-cart-item-price">
                              ฿{Number(item.subtotal || 0).toLocaleString()}
                            </div>
                          </div>
                        );
                      })}

                      {cartItems.length > 3 && (
                        <div className="tck2-cart-more">
                          และอีก {cartItems.length - 3} รายการ
                        </div>
                      )}

                      <div className="tck2-cart-summary">
                        <span>{cartItems.length} ชิ้น</span>
                        <span className="tck2-cart-summary-total">
                          ยอดรวมสุทธิ: ฿{Number(cartTotal || 0).toLocaleString()}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="tck2-cart-goto"
                        onClick={handleGoToCart}
                      >
                        ไปที่ตะกร้า
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {cartMessage && (
        <div className="tck2-cart-msg">
          <span>{cartMessage}</span>
        </div>
      )}

      <div className="tck2-layout">
        <aside className={`tck2-sidebar ${mobileNavOpen ? "open" : ""}`}>
          <div className="tck2-breadcrumb">
            <button type="button" onClick={() => navigate("/")}>
              หน้าหลัก
            </button>
            <span>›</span>
            <span>{activeCategoryLabel}</span>
          </div>

          <label className="tck2-cat-item tck2-instock-toggle">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
            />
            แสดงสินค้าพร้อมขาย
          </label>

          <div className="tck2-accordion">
            <button
              type="button"
              className="tck2-accordion-head"
              onClick={() => toggleSection("category")}
            >
              หมวดหมู่สินค้า
              <span>{openSections.category ? "−" : "+"}</span>
            </button>

            {openSections.category && (
              <div className="tck2-accordion-body">
                <label className="tck2-cat-item">
                  <input
                    type="checkbox"
                    checked={activeCategoryIds.length === 0}
                    onChange={() => setActiveCategoryIds([])}
                  />
                  สินค้าทั้งหมด
                </label>

                {categories.map((c) => (
                  <label
                    key={c.category_id}
                    className={`tck2-cat-item ${
                      activeCategoryIds.includes(c.category_id) ? "active" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={activeCategoryIds.includes(c.category_id)}
                      onChange={() => toggleCategory(c.category_id)}
                    />
                    {c.category_name}
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="tck2-accordion">
            <button
              type="button"
              className="tck2-accordion-head"
              onClick={() => toggleSection("price")}
            >
              ช่วงราคา
              <span>{openSections.price ? "−" : "+"}</span>
            </button>

            {openSections.price && (
              <div className="tck2-accordion-body">
                <div className="tck2-range-slider">
                  <div className="tck2-range-track-base" />
                  <div
                    className="tck2-range-track"
                    style={{
                      left: `${
                        priceBounds.max > 0
                          ? ((Number(priceMin || priceBounds.min) -
                              priceBounds.min) /
                              (priceBounds.max - priceBounds.min || 1)) *
                            100
                          : 0
                      }%`,
                      right: `${
                        priceBounds.max > 0
                          ? 100 -
                            ((Number(priceMax || priceBounds.max) -
                              priceBounds.min) /
                              (priceBounds.max - priceBounds.min || 1)) *
                              100
                          : 0
                      }%`,
                    }}
                  />
                  <input
                    type="range"
                    min={priceBounds.min}
                    max={priceBounds.max}
                    value={priceMin === "" ? priceBounds.min : priceMin}
                    onChange={(e) => {
                      const val = Math.min(
                        Number(e.target.value),
                        priceMax === "" ? priceBounds.max : Number(priceMax),
                      );
                      setPriceMin(val);
                    }}
                  />
                  <input
                    type="range"
                    min={priceBounds.min}
                    max={priceBounds.max}
                    value={priceMax === "" ? priceBounds.max : priceMax}
                    onChange={(e) => {
                      const val = Math.max(
                        Number(e.target.value),
                        priceMin === "" ? priceBounds.min : Number(priceMin),
                      );
                      setPriceMax(val);
                    }}
                  />
                </div>

                <div className="tck2-price-row">
                  <input
                    type="number"
                    placeholder="ต่ำสุด"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                  />
                  <span>-</span>
                  <input
                    type="number"
                    placeholder="สูงสุด"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                  />
                </div>
                <div className="tck2-price-hint">
                  ฿{priceBounds.min.toLocaleString()} - ฿
                  {priceBounds.max.toLocaleString()}
                </div>
              </div>
            )}
          </div>

          <div className="tck2-accordion">
            <button
              type="button"
              className="tck2-accordion-head"
              onClick={() => toggleSection("brand")}
            >
              แบรนด์
              <span>{openSections.brand ? "−" : "+"}</span>
            </button>

            {openSections.brand && (
              <div className="tck2-accordion-body">
                {brands.length === 0 && (
                  <div className="tck2-price-hint">ไม่มีแบรนด์ในหมวดนี้</div>
                )}
                {brands.map((b) => (
                  <label key={b} className="tck2-cat-item">
                    <input
                      type="checkbox"
                      checked={activeBrands.includes(b)}
                      onChange={() => toggleBrand(b)}
                    />
                    {b}
                  </label>
                ))}
              </div>
            )}
          </div>

          {(activeCategoryIds.length > 0 ||
            priceMin ||
            priceMax ||
            activeBrands.length > 0 ||
            sortBy !== "newest" ||
            inStockOnly ||
            search) && (
            <button
              type="button"
              className="tck2-clear-filter"
              onClick={handleClearFilters}
            >
              ลบการกรองสินค้าที่เลือก
            </button>
          )}
        </aside>

        <main>
          <section className="tck2-hero">
            <div className="tck2-hero-eyebrow">
              TLECOMKUB / COMPUTER SETS &amp; NOTEBOOKS
            </div>
            <h1 className="tck2-hero-title">
              ทุกสินค้าที่ใช่ ประกันใจได้ 100%
            </h1>
            <p className="tck2-hero-sub">
              คอมพิวเตอร์ตั้งโต๊ะและโน้ตบุ๊กของแท้ พร้อมประกันตามใจ
            </p>

            <div className="tck2-badges">
              <span className="tck2-badge">
                <span className="tck2-dot" /> ของแท้ 100%
              </span>
              <span className="tck2-badge">
                <span className="tck2-dot" /> ประกันตามใจ
              </span>
              <span className="tck2-badge">
                <span className="tck2-dot" /> ชำระเงินปลอดภัย
              </span>
              <span className="tck2-badge">
                <span className="tck2-dot" /> จัดส่งไว
              </span>
            </div>
          </section>

          <section className="tck2-section">
            <div className="tck2-section-head">
              <h2 className="tck2-section-title">{activeCategoryLabel}</h2>
              <div className="tck2-section-right">
                <span className="tck2-section-tag tck2-mono">
                  พบสินค้า {filteredProducts.length} รายการ
                </span>
                <select
                  className="tck2-sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      เรียงตาม: {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="tck2-grid">
              {loading && <div className="tck2-empty">กำลังโหลดสินค้า...</div>}

              {!loading && filteredProducts.length === 0 && (
                <div className="tck2-empty">ไม่พบสินค้าตามตัวกรองที่เลือก</div>
              )}

              {!loading &&
                paginatedProducts.map((product) => (
                  <div className="tck2-card" key={product.product_id}>
                    <div className="tck2-card-media">
                      <img
                        src={
                          product.image
                            ? `${API_URL}${product.image}`
                            : "https://placehold.co/300x200?text=No+Image"
                        }
                        alt={product.product_name}
                      />
                      {Number(product.stock) <= 0 && (
                        <div className="tck2-sold-overlay">
                          <span>SOLD OUT</span>
                        </div>
                      )}
                      {product.brand_name && (
                        <span className="tck2-brand-tag">
                          {product.brand_name}
                        </span>
                      )}
                      <span
                        className={`tck2-stock-tag${
                          Number(product.stock) > 0 ? "" : " out"
                        }`}
                      >
                        {Number(product.stock) > 0
                          ? `เหลือ ${product.stock}`
                          : "สินค้าหมด"}
                      </span>
                    </div>
                    <div className="tck2-card-body">
                      <div className="tck2-card-eyebrow">
                        {product.category_name || "ไม่ระบุหมวดหมู่"}
                      </div>
                      <h3 className="tck2-card-title">
                        {product.product_name}
                      </h3>
                      <div className="tck2-card-price">
                        ฿{Number(product.price || 0).toLocaleString()}
                      </div>

                      <div className="tck2-card-actions">
                        <button
                          type="button"
                          className="tck2-card-link"
                          onClick={() =>
                            navigate(`/products/${product.product_id}`)
                          }
                        >
                          ดูรายละเอียด
                        </button>
                        <button
                          type="button"
                          className="tck2-add-cart"
                          disabled={
                            addingId === product.product_id ||
                            Number(product.stock) <= 0
                          }
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

            {!loading && filteredProducts.length > 0 && totalPages > 1 && (
              <div className="tck2-pagination">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  ← ก่อนหน้า
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      type="button"
                      className={page === currentPage ? "active" : ""}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ),
                )}

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                >
                  ถัดไป →
                </button>
              </div>
            )}
          </section>
        </main>
      </div>

      <Footer />
    </div>
  );
}