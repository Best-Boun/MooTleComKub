import { useNavigate, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { label: "Home", path: "/" },
  { label: "Products", path: "/products" },
  { label: "Cart", path: "/cart" },
  { label: "Orders", path: "/orders" },
  { label: "Warranty", path: "/warranty" },
  { label: "My Account", path: "/my-account" },
];

export default function CustomerNavbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    sessionStorage.removeItem("token");
    navigate("/login");
  };

  if (!token) return null;

  const isActive = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
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
          {NAV_ITEMS.map((item) => (
            <button
              key={item.path}
              type="button"
              className={`tck-nav-link${isActive(item.path) ? " active" : ""}`}
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="tck-nav-spacer" />

        <button type="button" className="tck-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}
