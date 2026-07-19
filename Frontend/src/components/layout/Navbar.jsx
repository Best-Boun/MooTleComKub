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
    <nav className="tckad-navbar">
      <style>{`
        .tckad-navbar {
          background: var(--surface);
          border-bottom: 1px solid var(--line);
          padding: 12px 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .tckad-navbar h4 {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 18px;
          color: var(--ink);
          margin: 0;
        }
        .tckad-user-toggle {
          border: none !important;
          background: transparent !important;
          box-shadow: none !important;
        }
        .tckad-user-icon {
          font-size: 30px;
          color: var(--accent);
        }
        .tckad-user-name {
          font-weight: 700;
          color: var(--ink);
          font-size: 14px;
        }
        .tckad-user-role {
          color: var(--muted);
          font-size: 12px;
        }
      `}</style>

      <h4>Admin Panel</h4>

      <Dropdown align="end">
        <Dropdown.Toggle
          variant="light"
          className="tckad-user-toggle d-flex align-items-center"
        >
          <i className="bi bi-person-circle tckad-user-icon me-2"></i>
          <div className="text-start">
            <div className="tckad-user-name">
              {user?.first_name} {user?.last_name}
            </div>
            <div className="tckad-user-role">
              {user?.role_id === 3 ? "Super Administrator" : "Administrator"}
            </div>
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