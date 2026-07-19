import { NavLink, Link } from "react-router-dom";
import { Button } from "react-bootstrap";
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
    <div
      className="bg-dark text-white p-3 d-flex flex-column"
      style={{
        width: "260px",
        minHeight: "100vh",
      }}
    >
      <h4 className="text-center mb-4">Summer Admin</h4>

      <div className="nav flex-column flex-grow-1">
        {MENU_ITEMS.map(
          (item) =>
            (isSuperAdmin || canView(item.pageKey)) && (
              <NavLink key={item.to} to={item.to} className="nav-link text-white">
                <i className={`bi ${item.icon} me-2`}></i>
                {item.label}
              </NavLink>
            ),
        )}

        {isSuperAdmin && (
          <NavLink to="/admin/reports" className="nav-link text-white">
            <i className="bi bi-bar-chart me-2"></i>
            Reports
          </NavLink>
        )}
      </div>

      {/* Back to Store */}

      <div className="mt-auto">
        <Link to="/" className="text-decoration-none">
          <Button variant="outline-light" className="w-100">
            <i className="bi bi-arrow-left me-2"></i>
            Back to Store
          </Button>
        </Link>
      </div>
    </div>
  );
}
