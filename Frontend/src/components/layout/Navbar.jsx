import { Dropdown } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const user =
    JSON.parse(localStorage.getItem("user")) ||
    JSON.parse(sessionStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <nav className="navbar navbar-light bg-white shadow-sm px-4">
      <h4 className="mb-0">Admin Panel</h4>

      <Dropdown align="end">
        <Dropdown.Toggle
          variant="light"
          className="border-0 bg-white d-flex align-items-center shadow-none"
        >
          <i className="bi bi-person-circle fs-3 me-2"></i>

          <div className="text-start">
            <div className="fw-bold">
              {user?.first_name} {user?.last_name}
            </div>

            <small className="text-muted">
              {user?.role_id === 3 ? "Super Administrator" : "Administrator"}
            </small>
          </div>
        </Dropdown.Toggle>

        <Dropdown.Menu align="end">
          <Dropdown.Item onClick={() => navigate("/my-account")}>
            <i className="bi bi-person me-2"></i>
            My Account
          </Dropdown.Item>

          <Dropdown.Divider />

          <Dropdown.Item onClick={handleLogout} className="text-danger">
            <i className="bi bi-box-arrow-right me-2"></i>
            Logout
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </nav>
  );
}
