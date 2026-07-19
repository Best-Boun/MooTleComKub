import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dropdown } from "react-bootstrap";
import Swal from "sweetalert2";
import { FiSearch, FiShoppingCart } from "react-icons/fi";
import cartService from "../../services/cartService";
import productService from "../../services/productService";
import logo from "../../assets/ChatGPT_Image_Jul_19__2026__04_40_50_PM-removebg-preview.png";

const API_URL = "http://localhost:5000";

export default function CustomerNavbar() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const cartPopupRef = useRef(null);

  const user =
    JSON.parse(localStorage.getItem("user")) ||
    JSON.parse(sessionStorage.getItem("user"));

  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    navigate("/login");
  };

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

  useEffect(() => {
    loadCartCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // ปิด popup เมื่อคลิกข้างนอก
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = search.trim();
    navigate(trimmed ? `/?search=${encodeURIComponent(trimmed)}` : "/");
  };

  return (
    <div className="tcknav">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Inter:wght@400;500;600&display=swap');

        .tcknav {
          --accent: #E2574C;
          --accent-dark: #B8362D;
          --accent-tint: #FDEDEB;
          --ink: #1C1F26;
          --line: #E8E8EC;
        }

        .tcknav-utility {
          background: var(--ink);
          color: #D8DAE0;
          font-size: 12.5px;
        }
        .tcknav-utility-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 6px 24px;
          display: flex;
          justify-content: flex-end;
          gap: 20px;
        }
        .tcknav-utility-inner button {
          background: none;
          border: none;
          color: inherit;
          font-size: inherit;
          cursor: pointer;
        }
        .tcknav-utility-inner button:hover { color: #fff; }

        .tcknav-bar {
          background: #FFFFFF;
          border-bottom: 1px solid var(--line);
        }
        .tcknav-bar-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 14px 24px;
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .tcknav-logo {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 22px;
          color: var(--ink);
          background: none;
          border: none;
          cursor: pointer;
          flex-shrink: 0;
        }
        .tcknav-logo span { color: var(--accent); }

        .tcknav-search {
          flex: 1;
          display: flex;
          max-width: 480px;
        }
        .tcknav-search input {
          flex: 1;
          border: 1px solid var(--line);
          border-right: none;
          border-radius: 10px 0 0 10px;
          padding: 9px 14px;
          font-size: 14px;
          outline: none;
        }
        .tcknav-search input:focus { border-color: var(--accent); }
        .tcknav-search button {
          border: none;
          background: var(--accent);
          color: #fff;
          padding: 0 16px;
          border-radius: 0 10px 10px 0;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .tcknav-search button:hover { background: var(--accent-dark); }

        .tcknav-spacer { margin-left: auto; }
        .tcknav-actions { display: flex; align-items: center; gap: 14px; }

        .tcknav-cart-btn {
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
          color: var(--ink);
        }
        .tcknav-cart-btn:hover { border-color: var(--accent); }
        .tcknav-cart-badge {
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

        .tcknav-actions .dropdown-toggle,
        .tcknav-actions .dropdown-toggle:hover,
        .tcknav-actions .dropdown-toggle:focus,
        .tcknav-actions .dropdown-toggle:active,
        .tcknav-actions .btn-light.dropdown-toggle:focus {
          border: none !important;
          box-shadow: none !important;
          outline: none !important;
          background: transparent !important;
        }

        .tcknav-cart-btn:focus {
          outline: none;
          box-shadow: none;
        }

        .tcknav-login-btn {
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
        .tcknav-login-btn:hover { background: var(--accent-dark); }

        .tcknav-cart-wrap { position: relative; }
        .tcknav-cart-popup {
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
        .tcknav-cart-empty {
          padding: 20px 4px;
          text-align: center;
          color: #6B7280;
          font-size: 13.5px;
        }
        .tcknav-cart-empty button {
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
        .tcknav-cart-item {
          display: flex;
          gap: 10px;
          padding: 8px 2px;
          border-bottom: 1px solid var(--line);
        }
        .tcknav-cart-item:last-of-type { border-bottom: none; }
        .tcknav-cart-item-media {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          overflow: hidden;
          background: #F4F4F6;
          flex-shrink: 0;
        }
        .tcknav-cart-item-media img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .tcknav-cart-item-info { flex: 1; min-width: 0; }
        .tcknav-cart-item-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--ink);
          margin: 0 0 3px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .tcknav-cart-item-meta {
          font-size: 11.5px;
          color: #6B7280;
        }
        .tcknav-cart-item-price {
          font-size: 13px;
          font-weight: 600;
          color: var(--accent-dark);
          flex-shrink: 0;
        }
        .tcknav-cart-more {
          font-size: 12px;
          color: #6B7280;
          text-align: center;
          padding: 6px 0 2px;
        }
        .tcknav-cart-summary {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 2px 12px;
          border-top: 1px solid var(--line);
          margin-top: 6px;
          font-size: 13px;
        }
        .tcknav-cart-summary-total {
          font-weight: 700;
          font-size: 15px;
          color: var(--ink);
        }
        .tcknav-cart-goto {
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
        .tcknav-cart-goto:hover { background: var(--accent-dark); }
        .tcknav-cart-loading {
          padding: 20px 4px;
          text-align: center;
          color: #6B7280;
          font-size: 13px;
        }
      `}</style>

      <div className="tcknav-utility">
        <div className="tcknav-utility-inner">
          <span>ส่งฟรีทั่วไทยเมื่อช้อปครบ 2,000.-</span>
          <button type="button" onClick={() => navigate("/orders")}>
            ติดตามคำสั่งซื้อ
          </button>
        </div>
      </div>

      <div className="tcknav-bar">
        <div className="tcknav-bar-inner">
          <button
  type="button"
  className="tcknav-logo"
  onClick={() => navigate("/")}
>
  <img
    src={logo}
    alt="MOOTLECOMKUB"
    style={{
      width: "55px",
      height: "55px",
      objectFit: "contain",
    }}
  />
</button>

          <form className="tcknav-search" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="ค้นหาสินค้าที่ต้องการ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" aria-label="ค้นหา">
              <FiSearch size={16} />
            </button>
          </form>

          <div className="tcknav-spacer" />

          <div className="tcknav-actions">
            {token ? (
              <Dropdown align="end">
                <Dropdown.Toggle variant="light" className="border-0 bg-transparent">
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

                  <Dropdown.Item className="text-danger" onClick={handleLogout}>
                    ออกจากระบบ
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <button
                type="button"
                className="tcknav-login-btn"
                onClick={() => navigate("/login")}
              >
                เข้าสู่ระบบ
              </button>
            )}

            <div className="tcknav-cart-wrap" ref={cartPopupRef}>
              <button
                type="button"
                className="tcknav-cart-btn"
                onClick={handleCartToggle}
                aria-label="ตะกร้าสินค้า"
              >
                <FiShoppingCart size={18} />
                {cartCount > 0 && (
                  <span className="tcknav-cart-badge">{cartCount}</span>
                )}
              </button>

              {cartOpen && (
                <div className="tcknav-cart-popup">
                  {cartLoading ? (
                    <div className="tcknav-cart-loading">กำลังโหลด...</div>
                  ) : cartItems.length === 0 ? (
                    <div className="tcknav-cart-empty">
                      <div>ตะกร้าของคุณยังว่างอยู่</div>
                      <button
                        type="button"
                        onClick={() => {
                          setCartOpen(false);
                          navigate("/");
                        }}
                      >
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
                          <div className="tcknav-cart-item" key={item.cart_item_id}>
                            <div className="tcknav-cart-item-media">
                              <img src={image} alt={name} />
                            </div>
                            <div className="tcknav-cart-item-info">
                              <div className="tcknav-cart-item-name">{name}</div>
                              <div className="tcknav-cart-item-meta">
                                จำนวน: {item.quantity}
                              </div>
                            </div>
                            <div className="tcknav-cart-item-price">
                              ฿{Number(item.subtotal || 0).toLocaleString()}
                            </div>
                          </div>
                        );
                      })}

                      {cartItems.length > 3 && (
                        <div className="tcknav-cart-more">
                          และอีก {cartItems.length - 3} รายการ
                        </div>
                      )}

                      <div className="tcknav-cart-summary">
                        <span>{cartItems.length} ชิ้น</span>
                        <span className="tcknav-cart-summary-total">
                          ยอดรวมสุทธิ: ฿{Number(cartTotal || 0).toLocaleString()}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="tcknav-cart-goto"
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
    </div>
  );
}
