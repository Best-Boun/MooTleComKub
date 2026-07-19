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

const PAGE_LABELS = {
  dashboard: "Dashboard",
  categories: "Categories",
  products: "Products",
  orders: "Orders",
  customers: "Customers",
};

export default function Reports() {
  const [activeTab, setActiveTab] = useState("admins");

  // ---------------- Admin Accounts ----------------
  const [admins, setAdmins] = useState([]);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [editingAdminId, setEditingAdminId] = useState(null);
  const [adminForm, setAdminForm] = useState(emptyAdminForm);

  // ---------------- Admin Permissions ----------------
  const [permPages, setPermPages] = useState([]);
  const [permAdmins, setPermAdmins] = useState([]);
  const [permsLoading, setPermsLoading] = useState(false);
  const [savingUserId, setSavingUserId] = useState(null);

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

  // ================= Admin Permissions =================
  const loadPermissions = async () => {
    setPermsLoading(true);
    try {
      const res = await superAdminService.getAdminPermissionsMatrix();
      setPermPages(res.pages || []);
      setPermAdmins(res.admins || []);
    } catch (error) {
      showError(error, "โหลดสิทธิ์การเข้าถึงไม่สำเร็จ");
    } finally {
      setPermsLoading(false);
    }
  };

  // สลับค่า can_view / can_manage ใน state ฝั่ง Frontend เท่านั้น (ยังไม่ยิง API)
  const toggleLocalPermission = (userId, pageKey, field) => {
    setPermAdmins((prev) =>
      prev.map((admin) => {
        if (admin.user_id !== userId) return admin;

        const current = admin.permissions[pageKey] || {
          can_view: 0,
          can_manage: 0,
        };

        let next = { ...current, [field]: current[field] ? 0 : 1 };

        // ปิด "มองเห็น" แล้วต้องปิด "จัดการ" ตามไปด้วย เพราะจัดการได้ต้องมองเห็นก่อน
        if (field === "can_view" && !next.can_view) {
          next.can_manage = 0;
        }

        // เปิด "จัดการ" ต้องเปิด "มองเห็น" ให้อัตโนมัติด้วย
        if (field === "can_manage" && next.can_manage) {
          next.can_view = 1;
        }

        return {
          ...admin,
          permissions: { ...admin.permissions, [pageKey]: next },
        };
      }),
    );
  };

  const handleSavePermissions = async (admin) => {
    setSavingUserId(admin.user_id);
    try {
      const permissions = permPages.map((pageKey) => ({
        page_key: pageKey,
        can_view: admin.permissions[pageKey]?.can_view ? 1 : 0,
        can_manage: admin.permissions[pageKey]?.can_manage ? 1 : 0,
      }));

      await superAdminService.updateAdminPermissions(admin.user_id, permissions);
      showSuccess(`บันทึกสิทธิ์ของ ${admin.first_name} ${admin.last_name} เรียบร้อยแล้ว`);
    } catch (error) {
      showError(error, "บันทึกสิทธิ์ไม่สำเร็จ");
    } finally {
      setSavingUserId(null);
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
      if (activeTab === "permissions") loadPermissions();
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

        {/* ============ Admin Permissions ============ */}
        <Tab eventKey="permissions" title="Admin Permissions">
          <div className="d-flex justify-content-end my-3">
            <Button variant="outline-secondary" onClick={loadPermissions} disabled={permsLoading}>
              <i className="bi bi-arrow-clockwise me-1"></i>
              Refresh
            </Button>
          </div>

          <p className="text-muted">
            กำหนดสิทธิ์การเข้าถึงแต่ละหน้าใน Admin Dashboard ของ Admin แต่ละคน — "มองเห็น"
            คือเปิดหน้าดูข้อมูลได้ ส่วน "จัดการ" คือแก้ไข/เพิ่ม/ลบข้อมูลในหน้านั้นได้
            (ต้องเปิด "มองเห็น" ก่อนจึงจะเปิด "จัดการ" ได้)
          </p>

          {permAdmins.length === 0 && (
            <div className="text-center text-muted py-4">
              {permsLoading ? "Loading..." : "No admin accounts"}
            </div>
          )}

          {permAdmins.map((admin) => (
            <div key={admin.user_id} className="border rounded p-3 mb-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <div className="fw-bold">
                    {admin.first_name} {admin.last_name}
                  </div>
                  <div className="text-muted small">{admin.email}</div>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  disabled={savingUserId === admin.user_id}
                  onClick={() => handleSavePermissions(admin)}
                >
                  {savingUserId === admin.user_id ? "Saving..." : "Save"}
                </Button>
              </div>

              <Table bordered responsive size="sm" className="mb-0">
                <thead>
                  <tr>
                    <th>หน้า</th>
                    <th className="text-center" style={{ width: 100 }}>
                      มองเห็น
                    </th>
                    <th className="text-center" style={{ width: 100 }}>
                      จัดการ
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {permPages.map((pageKey) => {
                    const perm = admin.permissions[pageKey] || {
                      can_view: 0,
                      can_manage: 0,
                    };

                    return (
                      <tr key={pageKey}>
                        <td>{PAGE_LABELS[pageKey] || pageKey}</td>
                        <td className="text-center">
                          <Form.Check
                            type="checkbox"
                            checked={Boolean(perm.can_view)}
                            onChange={() =>
                              toggleLocalPermission(admin.user_id, pageKey, "can_view")
                            }
                          />
                        </td>
                        <td className="text-center">
                          <Form.Check
                            type="checkbox"
                            checked={Boolean(perm.can_manage)}
                            onChange={() =>
                              toggleLocalPermission(admin.user_id, pageKey, "can_manage")
                            }
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          ))}
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
    </div>
  );
}
