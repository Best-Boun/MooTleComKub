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

const Register = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const { first_name, last_name, email, phone, password, confirmPassword } =
      formData;

    if (!first_name || !last_name || !email || !password || !confirmPassword) {
      return Swal.fire({
        icon: "warning",
        title: "กรุณากรอกข้อมูลให้ครบ",
      });
    }

    if (password.length < 6) {
      return Swal.fire({
        icon: "warning",
        title: "รหัสผ่านต้องมีอย่างน้อย 6 ตัว",
      });
    }

    if (password !== confirmPassword) {
      return Swal.fire({
        icon: "warning",
        title: "Password ไม่ตรงกัน",
      });
    }

    try {
      setLoading(true);

      const res = await authService.register({
        first_name,
        last_name,
        email,
        phone,
        password,
      });

      if (!res.success) {
        throw new Error(res.message);
      }

      await Swal.fire({
        icon: "success",
        title: "สมัครสมาชิกสำเร็จ",
        text: "กรุณาเข้าสู่ระบบ",
      });

      navigate("/login");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Register Failed",
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
        <Col md={7} lg={5}>
          <Card className="shadow-lg border-0 rounded-4">
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <i
                  className="bi bi-person-plus-fill text-primary"
                  style={{ fontSize: "60px" }}
                ></i>

                <h2 className="fw-bold mt-3">Register</h2>

                <p className="text-muted">Create your account</p>
              </div>

              <Form onSubmit={handleRegister}>
                <Row>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>First Name</Form.Label>
                      <Form.Control
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        placeholder="First Name"
                      />
                    </Form.Group>
                  </Col>

                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>Last Name</Form.Label>
                      <Form.Control
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        placeholder="Last Name"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Phone"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>

                  <InputGroup>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Password"
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

                <Form.Group className="mb-4">
                  <Form.Label>Confirm Password</Form.Label>

                  <InputGroup>
                    <Form.Control
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm Password"
                    />

                    <Button
                      type="button"
                      variant="outline-secondary"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? <EyeSlashFill /> : <EyeFill />}
                    </Button>
                  </InputGroup>
                </Form.Group>

                <Button
                  type="submit"
                  className="w-100"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Registering...
                    </>
                  ) : (
                    "Register"
                  )}
                </Button>
              </Form>

              <hr />

              <div className="text-center">
                <small className="text-muted">Already have an account?</small>

                <br />

                <Link to="/login" className="text-decoration-none fw-bold">
                  Login
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;
