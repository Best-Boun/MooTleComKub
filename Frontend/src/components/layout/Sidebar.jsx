import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const isSuperAdmin = storedUser?.role_id === 3;

  return (
    <div className="bg-dark text-white p-3" style={{ width: "260px" }}>
      <h4 className="text-center mb-4">Summer Admin</h4>

      <div className="nav flex-column">
        <NavLink to="/admin/dashboard" className="nav-link text-white">
          <i className="bi bi-speedometer2 me-2"></i>
          Dashboard
        </NavLink>

        <NavLink to="/admin/categories" className="nav-link text-white">
          <i className="bi bi-grid me-2"></i>
          Categories
        </NavLink>

        <NavLink to="/admin/products" className="nav-link text-white">
          <i className="bi bi-box-seam me-2"></i>
          Products
        </NavLink>

        <NavLink to="/admin/orders" className="nav-link text-white">
          <i className="bi bi-receipt me-2"></i>
          Orders
        </NavLink>

        <NavLink to="/admin/customers" className="nav-link text-white">
          <i className="bi bi-people me-2"></i>
          Customers
        </NavLink>

        {isSuperAdmin && (
          <NavLink to="/admin/reports" className="nav-link text-white">
            <i className="bi bi-bar-chart me-2"></i>
            Reports
          </NavLink>
        )}
      </div>
    </div>
  );
}
