import { Dropdown } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  const handleAdminConsole = () => {
    if (user?.role === "superadmin") {
      navigate("/superadmin/dashboard");
    } else {
      navigate("/admin/dashboard");
    }
  };

  return (
    <nav className="navbar navbar-light bg-white shadow-sm px-4">
      <h4 className="mb-0">Admin Panel</h4>

      <Dropdown align="end">
        <Dropdown.Toggle
          variant="light"
          className="d-flex align-items-center border-0 bg-white"
        >
          <i className="bi bi-person-circle fs-4 me-2"></i>

          <div className="text-start">
            <div className="fw-semibold">{user?.name || "Administrator"}</div>

            <small className="text-muted text-capitalize">{user?.role}</small>
          </div>
        </Dropdown.Toggle>

        <Dropdown.Menu>
          <Dropdown.Item onClick={() => navigate("/profile")}>
            My Account
          </Dropdown.Item>

          {(user?.role === "admin" || user?.role === "superadmin") && (
            <Dropdown.Item onClick={handleAdminConsole}>
              Admin Console
            </Dropdown.Item>
          )}

          <Dropdown.Divider />

          <Dropdown.Item onClick={handleLogout} className="text-danger">
            Logout
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </nav>
  );
}
