import { useEffect, useState } from "react";
import { Tabs, Tab, Table, Button, Modal, Form, Badge } from "react-bootstrap";
import Swal from "sweetalert2";
import superAdminService from "../../services/superAdminService";

const emptyAdminForm = {
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  phone: "",
  status: "ACTIVE",
};

export default function Reports() {
  const [activeTab, setActiveTab] = useState("admins");

  // ---------------- Admin Accounts ----------------
  const [admins, setAdmins] = useState([]);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [editingAdminId, setEditingAdminId] = useState(null);
  const [adminForm, setAdminForm] = useState(emptyAdminForm);

  // ---------------- Roles ----------------
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);

  // ---------------- Users & Role Assignment ----------------
  const [allUsers, setAllUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedRoleId, setSelectedRoleId] = useState("");

  // ---------------- System Logs ----------------
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsPage, setLogsPage] = useState(1);

  // ---------------- System Settings ----------------
  const [settingRows, setSettingRows] = useState([{ key: "", value: "" }]);
  const [settingsLoading, setSettingsLoading] = useState(false);

  const showError = (error, fallback) => {
    Swal.fire({
      icon: "error",
      title: "เกิดข้อผิดพลาด",
      text: error?.response?.data?.message || fallback,
    });
  };

  const showSuccess = (text) => {
    Swal.fire({
      icon: "success",
      title: "สำเร็จ",
      text,
      timer: 1500,
      showConfirmButton: false,
    });
  };

  // ================= Admin Accounts =================
  const loadAdmins = async () => {
    setAdminsLoading(true);
    try {
      const res = await superAdminService.getAdmins();
      setAdmins(res.admins || []);
    } catch (error) {
      showError(error, "โหลดรายชื่อ Admin ไม่สำเร็จ");
    } finally {
      setAdminsLoading(false);
    }
  };

  const openCreateAdmin = () => {
    setEditingAdminId(null);
    setAdminForm(emptyAdminForm);
    setShowAdminModal(true);
  };

  const openEditAdmin = (admin) => {
    setEditingAdminId(admin.user_id);
    setAdminForm({
      first_name: admin.first_name || "",
      last_name: admin.last_name || "",
      email: admin.email || "",
      password: "",
      phone: admin.phone || "",
      status: admin.status || "ACTIVE",
    });
    setShowAdminModal(true);
  };

  const handleSaveAdmin = async (e) => {
    e.preventDefault();

    try {
      if (editingAdminId) {
        await superAdminService.updateAdmin(editingAdminId, {
          first_name: adminForm.first_name,
          last_name: adminForm.last_name,
          email: adminForm.email,
          phone: adminForm.phone,
          status: adminForm.status,
        });
        showSuccess("อัปเดต Admin เรียบร้อยแล้ว");
      } else {
        await superAdminService.createAdmin({
          first_name: adminForm.first_name,
          last_name: adminForm.last_name,
          email: adminForm.email,
          password: adminForm.password,
          phone: adminForm.phone,
        });
        showSuccess("สร้าง Admin เรียบร้อยแล้ว");
      }

      setShowAdminModal(false);
      loadAdmins();
    } catch (error) {
      showError(error, "บันทึกข้อมูล Admin ไม่สำเร็จ");
    }
  };

  const handleDeleteAdmin = async (admin) => {
    const result = await Swal.fire({
      icon: "warning",
      title: `ลบ Admin "${admin.first_name} ${admin.last_name}" ?`,
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
    });

    if (!result.isConfirmed) return;

    try {
      await superAdminService.deleteAdmin(admin.user_id);
      showSuccess("ลบ Admin เรียบร้อยแล้ว");
      loadAdmins();
    } catch (error) {
      showError(error, "ลบ Admin ไม่สำเร็จ");
    }
  };

  // ================= Roles =================
  const loadRoles = async () => {
    setRolesLoading(true);
    try {
      const res = await superAdminService.getRoles();
      setRoles(res.roles || []);
    } catch (error) {
      showError(error, "โหลดรายชื่อ Role ไม่สำเร็จ");
    } finally {
      setRolesLoading(false);
    }
  };

  // ================= Users & Role Assignment =================
  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await superAdminService.getUsersWithRoles();
      setAllUsers(res.users || []);
    } catch (error) {
      showError(error, "โหลดรายชื่อผู้ใช้ไม่สำเร็จ");
    } finally {
      setUsersLoading(false);
    }
  };

  const openEditUserRole = (user) => {
    setEditingUser(user);
    setSelectedRoleId(user.role_id ? String(user.role_id) : "");
    setShowRoleModal(true);
  };

  const handleSaveUserRole = async (e) => {
    e.preventDefault();

    try {
      await superAdminService.updateUserRole(editingUser.user_id, selectedRoleId);
      showSuccess("อัปเดต Role ของผู้ใช้เรียบร้อยแล้ว");
      setShowRoleModal(false);
      loadUsers();
    } catch (error) {
      showError(error, "อัปเดต Role ของผู้ใช้ไม่สำเร็จ");
    }
  };

  // ================= System Logs =================
  const loadLogs = async (page = logsPage) => {
    setLogsLoading(true);
    try {
      const res = await superAdminService.getSystemLogs({ page, limit: 20 });
      setLogs(res.logs || []);
    } catch (error) {
      showError(error, "โหลด System Logs ไม่สำเร็จ");
    } finally {
      setLogsLoading(false);
    }
  };

  // ================= System Settings =================
  const handleSettingRowChange = (index, field, value) => {
    setSettingRows((rows) =>
      rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );
  };

  const addSettingRow = () => {
    setSettingRows((rows) => [...rows, { key: "", value: "" }]);
  };

  const removeSettingRow = (index) => {
    setSettingRows((rows) => rows.filter((_, i) => i !== index));
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();

    const settings = {};
    settingRows.forEach((row) => {
      if (row.key.trim()) {
        settings[row.key.trim()] = row.value;
      }
    });

    if (Object.keys(settings).length === 0) {
      showError(null, "กรุณากรอกอย่างน้อย 1 Setting");
      return;
    }

    setSettingsLoading(true);
    try {
      await superAdminService.updateSystemSettings(settings);
      showSuccess("อัปเดต System Settings เรียบร้อยแล้ว");
    } catch (error) {
      showError(error, "อัปเดต System Settings ไม่สำเร็จ");
    } finally {
      setSettingsLoading(false);
    }
  };

  useEffect(() => {
    // เลื่อนไปทำงานใน microtask ถัดไป เพื่อไม่ให้ setState (loading) เกิดขึ้นแบบ synchronous ใน Effect
    Promise.resolve().then(() => {
      if (activeTab === "admins") loadAdmins();
      if (activeTab === "roles") {
        loadRoles();
        loadUsers();
      }
      if (activeTab === "logs") loadLogs(1);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  return (
    <div>
      <h2 className="mb-4">SuperAdmin - Reports</h2>

      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">
        {/* ============ Admin Accounts ============ */}
        <Tab eventKey="admins" title="Admin Accounts">
          <div className="d-flex justify-content-between align-items-center my-3">
            <Button variant="outline-secondary" onClick={loadAdmins} disabled={adminsLoading}>
              <i className="bi bi-arrow-clockwise me-1"></i>
              Refresh
            </Button>
            <Button variant="primary" onClick={openCreateAdmin}>
              <i className="bi bi-plus-lg me-1"></i>
              New Admin
            </Button>
          </div>

          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-muted">
                    {adminsLoading ? "Loading..." : "No admin accounts"}
                  </td>
                </tr>
              )}
              {admins.map((admin) => (
                <tr key={admin.user_id}>
                  <td>{admin.user_id}</td>
                  <td>
                    {admin.first_name} {admin.last_name}
                  </td>
                  <td>{admin.email}</td>
                  <td>{admin.phone || "-"}</td>
                  <td>
                    <Badge bg={admin.status === "ACTIVE" ? "success" : "secondary"}>
                      {admin.status}
                    </Badge>
                  </td>
                  <td>
                    <Button
                      size="sm"
                      variant="outline-primary"
                      className="me-2"
                      onClick={() => openEditAdmin(admin)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => handleDeleteAdmin(admin)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Tab>

        {/* ============ Roles ============ */}
        <Tab eventKey="roles" title="Roles">
          <div className="d-flex justify-content-end my-3">
            <Button
              variant="outline-secondary"
              onClick={() => {
                loadRoles();
                loadUsers();
              }}
              disabled={usersLoading || rolesLoading}
            >
              <i className="bi bi-arrow-clockwise me-1"></i>
              Refresh
            </Button>
          </div>

          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Current Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-muted">
                    {usersLoading ? "Loading..." : "No users"}
                  </td>
                </tr>
              )}
              {allUsers.map((user) => (
                <tr key={user.user_id}>
                  <td>{user.user_id}</td>
                  <td>
                    {user.first_name} {user.last_name}
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <Badge bg="info">{user.role_name || "-"}</Badge>
                  </td>
                  <td>
                    <Button
                      size="sm"
                      variant="outline-primary"
                      onClick={() => openEditUserRole(user)}
                    >
                      Edit Role
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Tab>

        {/* ============ System Logs ============ */}
        <Tab eventKey="logs" title="System Logs">
          <div className="d-flex justify-content-end my-3">
            <Button
              variant="outline-secondary"
              onClick={() => loadLogs(logsPage)}
              disabled={logsLoading}
            >
              <i className="bi bi-arrow-clockwise me-1"></i>
              Refresh
            </Button>
          </div>

          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Action</th>
                <th>Description</th>
                <th>IP Address</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-muted">
                    {logsLoading ? "Loading..." : "No logs"}
                  </td>
                </tr>
              )}
              {logs.map((log) => (
                <tr key={log.log_id}>
                  <td>{log.log_id}</td>
                  <td>
                    {log.first_name ? `${log.first_name} ${log.last_name}` : "-"}
                  </td>
                  <td>{log.action}</td>
                  <td>{log.description}</td>
                  <td>{log.ip_address || "-"}</td>
                  <td>{new Date(log.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </Table>

          <div className="d-flex justify-content-center gap-2">
            <Button
              size="sm"
              variant="outline-secondary"
              disabled={logsPage <= 1}
              onClick={() => {
                const newPage = logsPage - 1;
                setLogsPage(newPage);
                loadLogs(newPage);
              }}
            >
              Previous
            </Button>
            <span className="align-self-center">Page {logsPage}</span>
            <Button
              size="sm"
              variant="outline-secondary"
              onClick={() => {
                const newPage = logsPage + 1;
                setLogsPage(newPage);
                loadLogs(newPage);
              }}
            >
              Next
            </Button>
          </div>
        </Tab>

        {/* ============ System Settings ============ */}
        <Tab eventKey="settings" title="System Settings">
          <Form onSubmit={handleSaveSettings} className="my-3">
            {settingRows.map((row, index) => (
              <div className="d-flex gap-2 mb-2" key={index}>
                <Form.Control
                  placeholder="Key (e.g. site_name)"
                  value={row.key}
                  onChange={(e) => handleSettingRowChange(index, "key", e.target.value)}
                />
                <Form.Control
                  placeholder="Value"
                  value={row.value}
                  onChange={(e) => handleSettingRowChange(index, "value", e.target.value)}
                />
                <Button
                  variant="outline-danger"
                  onClick={() => removeSettingRow(index)}
                  disabled={settingRows.length === 1}
                >
                  <i className="bi bi-trash"></i>
                </Button>
              </div>
            ))}

            <div className="d-flex justify-content-between">
              <Button variant="outline-secondary" onClick={addSettingRow}>
                <i className="bi bi-plus-lg me-1"></i>
                Add Setting
              </Button>
              <Button type="submit" variant="primary" disabled={settingsLoading}>
                Save Settings
              </Button>
            </div>
          </Form>
        </Tab>
      </Tabs>

      {/* ============ Admin Modal ============ */}
      <Modal show={showAdminModal} onHide={() => setShowAdminModal(false)}>
        <Form onSubmit={handleSaveAdmin}>
          <Modal.Header closeButton>
            <Modal.Title>{editingAdminId ? "Edit Admin" : "New Admin"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                required
                value={adminForm.first_name}
                onChange={(e) =>
                  setAdminForm({ ...adminForm, first_name: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                required
                value={adminForm.last_name}
                onChange={(e) =>
                  setAdminForm({ ...adminForm, last_name: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                required
                value={adminForm.email}
                onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
              />
            </Form.Group>
            {!editingAdminId && (
              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  required
                  minLength={6}
                  value={adminForm.password}
                  onChange={(e) =>
                    setAdminForm({ ...adminForm, password: e.target.value })
                  }
                />
              </Form.Group>
            )}
            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                value={adminForm.phone}
                onChange={(e) => setAdminForm({ ...adminForm, phone: e.target.value })}
              />
            </Form.Group>
            {editingAdminId && (
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={adminForm.status}
                  onChange={(e) =>
                    setAdminForm({ ...adminForm, status: e.target.value })
                  }
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </Form.Select>
              </Form.Group>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAdminModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* ============ Role Modal ============ */}
      <Modal show={showRoleModal} onHide={() => setShowRoleModal(false)}>
        <Form onSubmit={handleSaveUserRole}>
          <Modal.Header closeButton>
            <Modal.Title>Edit User Role</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>User</Form.Label>
              <Form.Control
                plaintext
                readOnly
                value={
                  editingUser
                    ? `${editingUser.first_name} ${editingUser.last_name} (${editingUser.email})`
                    : ""
                }
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Role</Form.Label>
              <Form.Select
                required
                value={selectedRoleId}
                onChange={(e) => setSelectedRoleId(e.target.value)}
              >
                <option value="" disabled>
                  Select a role
                </option>
                {roles.map((role) => (
                  <option key={role.role_id} value={role.role_id}>
                    {role.role_name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowRoleModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
