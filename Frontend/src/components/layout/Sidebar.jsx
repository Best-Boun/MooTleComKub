import { NavLink, Link } from "react-router-dom";
import { usePermissions } from "../../context/PermissionContext";

const MENU_ITEMS = [
  { to: "/admin/dashboard", icon: "bi-speedometer2", label: "Dashboard", pageKey: "dashboard" },
  { to: "/admin/categories", icon: "bi-grid", label: "Categories", pageKey: "categories" },
  { to: "/admin/products", icon: "bi-box-seam", label: "Products", pageKey: "products" },
  { to: "/admin/orders", icon: "bi-receipt", label: "Orders", pageKey: "orders" },
  { to: "/admin/customers", icon: "bi-people", label: "Customers", pageKey: "customers" },
];

export default function Sidebar() {
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const isSuperAdmin = storedUser?.role_id === 3;
  const { canView } = usePermissions();

  return (
    <aside className="tckad-sidebar">
      <style>{`
        .tckad-sidebar {
          width: 260px;
          flex-shrink: 0;
          background: var(--ink);
          color: #D8DAE0;
          display: flex;
          flex-direction: column;
          padding: 20px 14px;
        }
        .tckad-logo {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 20px;
          color: #fff;
          text-align: center;
          margin: 0 0 24px;
        }
        .tckad-logo span { color: var(--accent); }
        .tckad-nav {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
        }
        .tckad-nav-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 10px;
          color: #D8DAE0;
          text-decoration: none;
          font-size: 14px;
          transition: background 0.15s ease, color 0.15s ease;
        }
        .tckad-nav-link:hover {
          background: rgba(255,255,255,0.06);
          color: #fff;
        }
        .tckad-nav-link.active {
          background: var(--accent);
          color: #fff;
          font-weight: 600;
        }
        .tckad-back {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: auto;
          border: 1px solid rgba(255,255,255,0.18);
          color: #D8DAE0;
          text-decoration: none;
          font-size: 13.5px;
          padding: 10px;
          border-radius: 10px;
        }
        .tckad-back:hover {
          border-color: var(--accent);
          color: #fff;
        }
      `}</style>

      <h4 className="tckad-logo">Summer <span>Admin</span></h4>

      <nav className="tckad-nav">
        {MENU_ITEMS.map(
          (item) =>
            (isSuperAdmin || canView(item.pageKey)) && (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `tckad-nav-link${isActive ? " active" : ""}`}
              >
                <i className={`bi ${item.icon}`}></i>
                {item.label}
              </NavLink>
            ),
        )}

        {isSuperAdmin && (
          <NavLink
            to="/admin/reports"
            className={({ isActive }) => `tckad-nav-link${isActive ? " active" : ""}`}
          >
            <i className="bi bi-bar-chart"></i>
            Reports
          </NavLink>
        )}
      </nav>

      <Link to="/" className="tckad-back">
        <i className="bi bi-arrow-left"></i>
        Back to Store
      </Link>
    </aside>
  );
}