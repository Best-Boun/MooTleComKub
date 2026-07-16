import { Dropdown } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function CustomerNavbar() {
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
          <button className="tck-nav-link" onClick={() => navigate("/")}>
            Home
          </button>

          <button
            className="tck-nav-link"
            onClick={() => navigate("/products")}
          >
            Products
          </button>

          <button className="tck-nav-link" onClick={() => navigate("/cart")}>
            Cart
          </button>

          <button className="tck-nav-link" onClick={() => navigate("/orders")}>
            Orders
          </button>


          <button
            className="tck-nav-link"
            onClick={() => navigate("/my-account")}
          >
            My Account
          </button>
        </div>

        <div className="tck-nav-spacer" />

        <Dropdown align="end">
          <Dropdown.Toggle variant="light" className="border-0 bg-transparent">
            {user?.first_name || "Account"}
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item onClick={() => navigate("/my-account")}>
              My Account
            </Dropdown.Item>

            {(user?.role_id === 2 || user?.role_id === 3) && (
              <Dropdown.Item onClick={() => navigate("/admin/dashboard")}>
                Admin Console
              </Dropdown.Item>
            )}

            <Dropdown.Divider />

            <Dropdown.Item className="text-danger" onClick={handleLogout}>
              Logout
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </div>
  );
}
