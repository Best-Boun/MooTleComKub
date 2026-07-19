import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  FiUser,
  FiEdit2,
  FiMapPin,
  FiLogOut,
} from "react-icons/fi";
import authService from "../services/authService";
import customerService from "../services/customerService";
import addressService from "../services/addressService";
import CustomerLayout from "../components/layout/CustomerLayout";
import "../styles/tckTheme.css";

const EMPTY_ADDRESS_FORM = {
  recipient_name: "",
  phone: "",
  address_line: "",
  subdistrict: "",
  district: "",
  province: "",
  postal_code: "",
};

const SECTIONS = [
  { key: "view", label: "ข้อมูลส่วนตัว", icon: FiUser },
  { key: "edit", label: "จัดการข้อมูลส่วนตัว", icon: FiEdit2 },
  { key: "address", label: "จัดการที่อยู่จัดส่ง", icon: FiMapPin },
];

export default function MyAccount() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("view");

  // Profile section
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
  });
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileLoadError, setProfileLoadError] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  // Address section
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [addressLoadError, setAddressLoadError] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState(EMPTY_ADDRESS_FORM);
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressFormError, setAddressFormError] = useState("");
  const [addressActionError, setAddressActionError] = useState("");
  const [busyAddressId, setBusyAddressId] = useState(null);

  const loadProfile = async () => {
    try {
      setLoadingProfile(true);
      setProfileLoadError("");

      const res = await authService.getProfile();

      if (!res?.success || !res?.user) {
        throw new Error(res?.message || "โหลดข้อมูลโปรไฟล์ไม่สำเร็จ");
      }

      setProfile(res.user);
      setProfileForm({
        first_name: res.user.first_name || "",
        last_name: res.user.last_name || "",
        phone: res.user.phone || "",
      });
    } catch (err) {
      console.error(err);
      setProfileLoadError(
        err.response?.data?.message ||
          err.message ||
          "ไม่สามารถโหลดข้อมูลโปรไฟล์ได้ กรุณาลองใหม่อีกครั้ง",
      );
    } finally {
      setLoadingProfile(false);
    }
  };

  const loadAddresses = async () => {
    try {
      setLoadingAddresses(true);
      setAddressLoadError("");

      const res = await addressService.getAddresses();

      setAddresses(Array.isArray(res?.addresses) ? res.addresses : []);
    } catch (err) {
      console.error(err);
      setAddressLoadError("ไม่สามารถโหลดที่อยู่จัดส่งได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    loadProfile();
    loadAddresses();
  }, []);

  const handleProfileFormChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");
    setSavingProfile(true);

    try {
      const res = await customerService.updateCustomer(profile.user_id, {
        first_name: profileForm.first_name,
        last_name: profileForm.last_name,
        phone: profileForm.phone,
        email: profile.email,
      });

      if (!res?.success) {
        throw new Error(res?.message || "บันทึกข้อมูลไม่สำเร็จ");
      }

      setProfile((prev) => ({ ...prev, ...profileForm }));
      setProfileSuccess("บันทึกการเปลี่ยนแปลงสำเร็จ");
    } catch (err) {
      console.error(err);
      setProfileError(
        err.response?.data?.message ||
          err.message ||
          "บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddressFormChange = (e) => {
    const { name, value } = e.target;
    setAddressForm((prev) => ({ ...prev, [name]: value }));
  };

  const openAddForm = () => {
    setEditingAddressId(null);
    setAddressForm(EMPTY_ADDRESS_FORM);
    setAddressFormError("");
    setShowAddressForm(true);
  };

  const openEditForm = (addr) => {
    setEditingAddressId(addr.address_id);
    setAddressForm({
      recipient_name: addr.recipient_name || "",
      phone: addr.phone || "",
      address_line: addr.address_line || "",
      subdistrict: addr.subdistrict || "",
      district: addr.district || "",
      province: addr.province || "",
      postal_code: addr.postal_code || "",
    });
    setAddressFormError("");
    setShowAddressForm(true);
  };

  const closeAddressForm = () => {
    setShowAddressForm(false);
    setEditingAddressId(null);
    setAddressForm(EMPTY_ADDRESS_FORM);
    setAddressFormError("");
  };

  const handleSubmitAddress = async (e) => {
    e.preventDefault();
    setAddressFormError("");
    setSavingAddress(true);

    try {
      if (editingAddressId) {
        await addressService.updateAddress(editingAddressId, addressForm);
      } else {
        await addressService.createAddress(addressForm);
      }

      await loadAddresses();
      closeAddressForm();
    } catch (err) {
      console.error(err);
      setAddressFormError(
        err.response?.data?.message || "บันทึกที่อยู่ไม่สำเร็จ กรุณาตรวจสอบข้อมูล",
      );
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (addr) => {
    const result = await Swal.fire({
      title: "ลบที่อยู่นี้?",
      text: `คุณต้องการลบที่อยู่ของ "${addr.recipient_name}" หรือไม่`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    setAddressActionError("");
    setBusyAddressId(addr.address_id);

    try {
      await addressService.deleteAddress(addr.address_id);
      await loadAddresses();
    } catch (err) {
      console.error(err);
      setAddressActionError(
        err.response?.data?.message || "ลบที่อยู่นี้ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
      );
    } finally {
      setBusyAddressId(null);
    }
  };

  const handleSetDefault = async (addr) => {
    setAddressActionError("");
    setBusyAddressId(addr.address_id);

    try {
      await addressService.setDefaultAddress(addr.address_id);
      await loadAddresses();
    } catch (err) {
      console.error(err);
      setAddressActionError(
        err.response?.data?.message ||
          "ตั้งเป็นที่อยู่เริ่มต้นไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
      );
    } finally {
      setBusyAddressId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    sessionStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <CustomerLayout>
    <div className="tcka">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Inter:wght@400;500;600&display=swap');

        .tcka {
          --bg: #F6F7F9;
          --surface: #FFFFFF;
          --ink: #1C1F26;
          --muted: #6B7280;
          --line: #E8E8EC;
          --accent: #E2574C;
          --accent-dark: #B8362D;
          --accent-tint: #FDEDEB;
          --danger: #D64545;

          background: var(--bg);
          min-height: 100%;
          padding-top: 48px;
          padding-bottom: 48px;
        }

        .tcka-wrap {
          max-width: 1100px;
          margin: 48px auto 0;
          padding: 0 24px;
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 24px;
          align-items: start;
        }
        @media (max-width: 800px) {
          .tcka-wrap { grid-template-columns: 1fr; }
        }

        .tcka-sidebar {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: 16px;
          padding: 10px;
          position: sticky;
          top: 16px;
        }
        .tcka-nav-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          background: none;
          border: none;
          text-align: left;
          padding: 12px 14px;
          border-radius: 10px;
          font-size: 14px;
          color: var(--ink);
          cursor: pointer;
        }
        .tcka-nav-item:hover { background: var(--accent-tint); }
        .tcka-nav-item.active {
          background: var(--accent-tint);
          color: var(--accent-dark);
          font-weight: 600;
        }
        .tcka-nav-item svg { flex-shrink: 0; }
        .tcka-nav-divider {
          border: none;
          border-top: 1px solid var(--line);
          margin: 8px 6px;
        }
        .tcka-nav-item.logout { color: var(--danger); }
        .tcka-nav-item.logout:hover { background: rgba(214,69,69,0.08); }

        .tcka-panel {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: 16px;
          padding: 26px;
        }
        .tcka-panel-title {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 19px;
          margin: 0 0 20px;
        }

        .tcka-view-row {
          display: flex;
          padding: 13px 0;
          font-size: 14px;
          border-bottom: 1px solid var(--line);
        }
        .tcka-view-row:last-child { border-bottom: none; }
        .tcka-view-label { width: 160px; color: var(--muted); flex-shrink: 0; }
        .tcka-view-value { font-weight: 500; }

        .tcka-form {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        .tcka-form label {
          font-size: 12.5px;
          color: var(--muted);
          margin-bottom: 5px;
          display: block;
        }
        .tcka-form input {
          width: 100%;
          border: 1px solid var(--line);
          border-radius: 8px;
          padding: 10px 12px;
          font-size: 14px;
          font-family: 'Inter', sans-serif;
          color: var(--ink);
          background: #F9FAFC;
        }
        .tcka-form input:disabled { color: var(--muted); cursor: not-allowed; }
        .tcka-form .full-row { grid-column: 1 / -1; }
        .tcka-form-actions {
          grid-column: 1 / -1;
          display: flex;
          gap: 10px;
          margin-top: 4px;
        }
        .tcka-btn {
          background: var(--accent);
          color: #fff;
          border: none;
          font-weight: 600;
          font-size: 14px;
          padding: 11px 22px;
          border-radius: 10px;
          cursor: pointer;
        }
        .tcka-btn:hover { background: var(--accent-dark); }
        .tcka-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .tcka-addr-toggle {
          border: 1px solid var(--line);
          background: transparent;
          color: var(--accent-dark);
          font-size: 13px;
          padding: 7px 14px;
          border-radius: 8px;
          cursor: pointer;
        }
        .tcka-addr-toggle:hover { background: var(--accent-tint); }
        .tcka-panel-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .tcka-panel-head .tcka-panel-title { margin: 0; }

        .tcka-addr-list { display: flex; flex-direction: column; gap: 10px; }
        .tcka-addr-card {
          border: 1px solid var(--line);
          border-radius: 12px;
          padding: 16px;
          display: flex;
          gap: 12px;
          align-items: flex-start;
          justify-content: space-between;
          flex-wrap: wrap;
        }
        .tcka-addr-name {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 14.5px;
          margin-bottom: 4px;
        }
        .tcka-addr-detail { font-size: 13.5px; color: var(--muted); line-height: 1.5; }
        .tcka-addr-badge {
          display: inline-block;
          margin-left: 8px;
          font-size: 10.5px;
          font-weight: 600;
          color: var(--accent-dark);
          background: var(--accent-tint);
          padding: 3px 8px;
          border-radius: 20px;
          vertical-align: middle;
        }
        .tcka-addr-actions { display: flex; gap: 8px; flex-shrink: 0; }
        .tcka-addr-action-btn {
          border: 1px solid var(--line);
          background: transparent;
          color: var(--ink);
          font-size: 12.5px;
          padding: 7px 11px;
          border-radius: 8px;
          cursor: pointer;
        }
        .tcka-addr-action-btn:hover { border-color: var(--accent); color: var(--accent-dark); }
        .tcka-addr-action-btn.danger:hover { border-color: var(--danger); color: var(--danger); }
        .tcka-addr-action-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .tcka-addr-form {
          margin-top: 18px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          border-top: 1px solid var(--line);
          padding-top: 18px;
        }
        .tcka-addr-form input {
          border: 1px solid var(--line);
          border-radius: 8px;
          padding: 10px 12px;
          font-size: 14px;
          font-family: 'Inter', sans-serif;
          color: var(--ink);
          background: #F9FAFC;
        }
        .tcka-addr-form input.full-row { grid-column: 1 / -1; }
        .tcka-addr-form-actions {
          grid-column: 1 / -1;
          display: flex;
          gap: 10px;
        }

        .tcka-error {
          background: #FDEDEC;
          border: 1px solid #F5C6C0;
          color: var(--danger);
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 14px;
          margin-bottom: 16px;
        }
        .tcka-success {
          background: rgba(31,158,117,0.1);
          border: 1px solid rgba(31,158,117,0.3);
          color: #12734F;
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 14px;
          margin-bottom: 16px;
        }
        .tcka-loading {
          text-align: center;
          color: var(--muted);
          padding: 30px 0;
          font-size: 14px;
        }
      `}</style>

      <div className="tcka-wrap">
        <aside className="tcka-sidebar">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.key}
                type="button"
                className={`tcka-nav-item ${activeSection === s.key ? "active" : ""}`}
                onClick={() => setActiveSection(s.key)}
              >
                <Icon size={16} />
                {s.label}
              </button>
            );
          })}

          <hr className="tcka-nav-divider" />

          <button
            type="button"
            className="tcka-nav-item logout"
            onClick={handleLogout}
          >
            <FiLogOut size={16} />
            ออกจากระบบ
          </button>
        </aside>

        {activeSection === "view" && (
          <div className="tcka-panel">
            <h2 className="tcka-panel-title">ข้อมูลส่วนตัว</h2>

            {loadingProfile ? (
              <div className="tcka-loading">กำลังโหลด...</div>
            ) : profileLoadError ? (
              <div className="tcka-error">{profileLoadError}</div>
            ) : (
              <div>
                <div className="tcka-view-row">
                  <span className="tcka-view-label">ชื่อ-นามสกุล</span>
                  <span className="tcka-view-value">
                    {profile?.first_name} {profile?.last_name}
                  </span>
                </div>
                <div className="tcka-view-row">
                  <span className="tcka-view-label">อีเมล</span>
                  <span className="tcka-view-value">{profile?.email}</span>
                </div>
                <div className="tcka-view-row">
                  <span className="tcka-view-label">เบอร์โทรศัพท์</span>
                  <span className="tcka-view-value">
                    {profile?.phone || "—"}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {activeSection === "edit" && (
          <div className="tcka-panel">
            <h2 className="tcka-panel-title">จัดการข้อมูลส่วนตัว</h2>

            {loadingProfile ? (
              <div className="tcka-loading">กำลังโหลด...</div>
            ) : profileLoadError ? (
              <div className="tcka-error">{profileLoadError}</div>
            ) : (
              <form className="tcka-form" onSubmit={handleSaveProfile}>
                {profileError && (
                  <div className="tcka-error full-row">{profileError}</div>
                )}
                {profileSuccess && (
                  <div className="tcka-success full-row">{profileSuccess}</div>
                )}

                <div>
                  <label htmlFor="first_name">ชื่อจริง</label>
                  <input
                    id="first_name"
                    name="first_name"
                    value={profileForm.first_name}
                    onChange={handleProfileFormChange}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="last_name">นามสกุล</label>
                  <input
                    id="last_name"
                    name="last_name"
                    value={profileForm.last_name}
                    onChange={handleProfileFormChange}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="phone">เบอร์โทรศัพท์</label>
                  <input
                    id="phone"
                    name="phone"
                    value={profileForm.phone}
                    onChange={handleProfileFormChange}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email">อีเมล (แก้ไขไม่ได้)</label>
                  <input id="email" value={profile?.email || ""} disabled />
                </div>

                <div className="tcka-form-actions">
                  <button type="submit" className="tcka-btn" disabled={savingProfile}>
                    {savingProfile ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {activeSection === "address" && (
          <div className="tcka-panel">
            <div className="tcka-panel-head">
              <h2 className="tcka-panel-title">จัดการที่อยู่จัดส่ง</h2>
              <button
                type="button"
                className="tcka-addr-toggle"
                onClick={() => (showAddressForm ? closeAddressForm() : openAddForm())}
              >
                {showAddressForm ? "ยกเลิก" : "+ เพิ่มที่อยู่ใหม่"}
              </button>
            </div>

            {addressActionError && (
              <div className="tcka-error">{addressActionError}</div>
            )}

            {loadingAddresses ? (
              <div className="tcka-loading">กำลังโหลด...</div>
            ) : addressLoadError ? (
              <div className="tcka-error">{addressLoadError}</div>
            ) : (
              <>
                {addresses.length === 0 && !showAddressForm && (
                  <div className="tcka-addr-detail">
                    ยังไม่มีที่อยู่จัดส่ง กด "+ เพิ่มที่อยู่ใหม่" เพื่อเริ่มต้น
                  </div>
                )}

                {addresses.length > 0 && (
                  <div className="tcka-addr-list">
                    {addresses.map((addr) => {
                      const isBusy = busyAddressId === addr.address_id;

                      return (
                        <div className="tcka-addr-card" key={addr.address_id}>
                          <div>
                            <div className="tcka-addr-name">
                              {addr.recipient_name}
                              {addr.is_default ? (
                                <span className="tcka-addr-badge">ค่าเริ่มต้น</span>
                              ) : null}
                            </div>
                            <div className="tcka-addr-detail">
                              {addr.phone}
                              <br />
                              {addr.address_line} {addr.subdistrict}{" "}
                              {addr.district} {addr.province} {addr.postal_code}
                            </div>
                          </div>

                          <div className="tcka-addr-actions">
                            {!addr.is_default && (
                              <button
                                type="button"
                                className="tcka-addr-action-btn"
                                disabled={isBusy}
                                onClick={() => handleSetDefault(addr)}
                              >
                                ตั้งเป็นค่าเริ่มต้น
                              </button>
                            )}
                            <button
                              type="button"
                              className="tcka-addr-action-btn"
                              disabled={isBusy}
                              onClick={() => openEditForm(addr)}
                            >
                              แก้ไข
                            </button>
                            <button
                              type="button"
                              className="tcka-addr-action-btn danger"
                              disabled={isBusy}
                              onClick={() => handleDeleteAddress(addr)}
                            >
                              ลบ
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {showAddressForm && (
                  <form className="tcka-addr-form" onSubmit={handleSubmitAddress}>
                    {addressFormError && (
                      <div className="tcka-error full-row">{addressFormError}</div>
                    )}
                    <input
                      className="full-row"
                      name="recipient_name"
                      placeholder="ชื่อผู้รับ"
                      value={addressForm.recipient_name}
                      onChange={handleAddressFormChange}
                      required
                    />
                    <input
                      className="full-row"
                      name="phone"
                      placeholder="เบอร์โทรศัพท์"
                      value={addressForm.phone}
                      onChange={handleAddressFormChange}
                      required
                    />
                    <input
                      className="full-row"
                      name="address_line"
                      placeholder="ที่อยู่ (บ้านเลขที่, ถนน)"
                      value={addressForm.address_line}
                      onChange={handleAddressFormChange}
                      required
                    />
                    <input
                      name="subdistrict"
                      placeholder="ตำบล/แขวง"
                      value={addressForm.subdistrict}
                      onChange={handleAddressFormChange}
                      required
                    />
                    <input
                      name="district"
                      placeholder="อำเภอ/เขต"
                      value={addressForm.district}
                      onChange={handleAddressFormChange}
                      required
                    />
                    <input
                      name="province"
                      placeholder="จังหวัด"
                      value={addressForm.province}
                      onChange={handleAddressFormChange}
                      required
                    />
                    <input
                      name="postal_code"
                      placeholder="รหัสไปรษณีย์ (5 หลัก)"
                      value={addressForm.postal_code}
                      onChange={handleAddressFormChange}
                      required
                    />
                    <div className="tcka-addr-form-actions">
                      <button
                        type="submit"
                        className="tcka-btn"
                        disabled={savingAddress}
                      >
                        {savingAddress
                          ? "กำลังบันทึก..."
                          : editingAddressId
                            ? "บันทึกการแก้ไข"
                            : "บันทึกที่อยู่"}
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
    </CustomerLayout>
  );
}
