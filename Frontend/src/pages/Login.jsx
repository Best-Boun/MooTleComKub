import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  InputGroup,
} from "react-bootstrap";
import { EyeFill, EyeSlashFill } from "react-bootstrap-icons";
import Swal from "sweetalert2";

import authService from "../services/authService";

const Login = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!formData.email.trim()) {
      return Swal.fire({
        icon: "warning",
        title: "กรุณากรอก Email",
      });
    }

    if (!formData.password.trim()) {
      return Swal.fire({
        icon: "warning",
        title: "กรุณากรอกรหัสผ่าน",
      });
    }

    try {
      setLoading(true);

      // Login
      const loginRes = await authService.login(formData);

      if (!loginRes.success) {
        throw new Error(loginRes.message);
      }

      const token = loginRes.token;

      if (!token) {
        throw new Error("ไม่พบ Token จาก Server");
      }

      if (rememberMe) {
        localStorage.setItem("token", token);
      } else {
        sessionStorage.setItem("token", token);
      }

      // Profile
      const profileRes = await authService.getProfile();

      const user = profileRes.user;

      localStorage.setItem("user", JSON.stringify(user));

      await Swal.fire({
        icon: "success",
        title: "Login Success",
        text: `Welcome ${user.first_name}`,
        timer: 1200,
        showConfirmButton: false,
      });

      // Redirect
      if (user.role_id === 2 || user.role_id === 3) {
        // Admin / Superadmin
        navigate("/admin/dashboard");
      } else {
        // Customer
        navigate("/pages/homepage");
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text:
          err.response?.data?.message || err.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      fluid
      className="min-vh-100 d-flex justify-content-center align-items-center bg-light"
    >
      <Row className="w-100 justify-content-center">
        <Col md={6} lg={4}>
          <Card className="shadow-lg border-0 rounded-4">
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <i
                  className="bi bi-shield-lock-fill text-primary"
                  style={{ fontSize: "60px" }}
                ></i>

                <h2 className="fw-bold mt-3">Login</h2>

                <p className="text-muted">Sign in to continue</p>
              </div>

              <Form onSubmit={handleLogin}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>

                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="Enter Email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>

                  <InputGroup>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Enter Password"
                      value={formData.password}
                      onChange={handleChange}
                    />

                    <Button
                      type="button"
                      variant="outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeSlashFill /> : <EyeFill />}
                    </Button>
                  </InputGroup>
                </Form.Group>

                <div className="d-flex justify-content-between align-items-center mb-4">
                  <Form.Check
                    type="checkbox"
                    label="Remember Me"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                  />

                  <Link to="/forgot-password" className="text-decoration-none">
                    Forgot Password
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-100"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
              </Form>

              <hr />

              <div className="text-center">
                <small className="text-muted">Don't have an account?</small>

                <br />

                <Link to="/register" className="text-decoration-none fw-bold">
                  Register
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
