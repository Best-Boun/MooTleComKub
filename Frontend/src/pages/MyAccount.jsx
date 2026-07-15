import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import authService from "../services/authService";
import customerService from "../services/customerService";
import addressService from "../services/addressService";
import CustomerNavbar from "../components/layout/CustomerNavbar";
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

export default function MyAccount() {
  // Profile section
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({ first_name: "", last_name: "", phone: "" });
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
        err.response?.data?.message || err.message || "ไม่สามารถโหลดข้อมูลโปรไฟล์ได้ กรุณาลองใหม่อีกครั้ง",
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
        err.response?.data?.message || err.message || "บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
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
        err.response?.data?.message || "ตั้งเป็นที่อยู่เริ่มต้นไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
      );
    } finally {
      setBusyAddressId(null);
    }
  };

  return (
    <div className="tck-home">
      <CustomerNavbar />

      <style>{`
        .tck-account-head {
          max-width: 1100px;
          margin: 0 auto 20px;
        }
        .tck-account-wrap {
          max-width: 1100px;
          margin: 0 auto;
        }
        .tck-account-panel {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: 16px;
          padding: 22px;
          margin-bottom: 18px;
        }
        .tck-account-panel-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }
        .tck-account-panel-title {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 17px;
          margin: 0;
        }

        .tck-account-form {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .tck-account-form label {
          font-size: 12.5px;
          color: var(--muted);
          margin-bottom: 4px;
          display: block;
        }
        .tck-account-form input {
          width: 100%;
          border: 1px solid var(--line);
          border-radius: 8px;
          padding: 10px 12px;
          font-size: 14px;
          font-family: 'Inter', sans-serif;
          color: var(--ink);
          background: #F9FAFC;
        }
        .tck-account-form input:disabled {
          color: var(--muted);
          cursor: not-allowed;
        }
        .tck-account-form .full-row { grid-column: 1 / -1; }
        .tck-account-form-actions {
          grid-column: 1 / -1;
          display: flex;
          gap: 10px;
          margin-top: 4px;
        }

        .tck-addr-toggle {
          border: 1px solid var(--line);
          background: transparent;
          color: var(--accent);
          font-size: 13px;
          padding: 6px 12px;
          border-radius: 8px;
          cursor: pointer;
        }
        .tck-addr-toggle:hover { background: #F6F8FB; }

        .tck-addr-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .tck-addr-card {
          border: 1px solid var(--line);
          border-radius: 12px;
          padding: 14px;
          display: flex;
          gap: 12px;
          align-items: flex-start;
          justify-content: space-between;
          flex-wrap: wrap;
        }
        .tck-addr-name {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 14.5px;
          margin-bottom: 3px;
        }
        .tck-addr-detail {
          font-size: 13.5px;
          color: var(--muted);
          line-height: 1.5;
        }
        .tck-addr-badge {
          display: inline-block;
          margin-left: 8px;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10.5px;
          color: #00895a;
          background: rgba(0, 208, 132, 0.12);
          padding: 2px 7px;
          border-radius: 20px;
          vertical-align: middle;
        }
        .tck-addr-actions {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }
        .tck-addr-action-btn {
          border: 1px solid var(--line);
          background: transparent;
          color: var(--ink);
          font-size: 12.5px;
          padding: 6px 10px;
          border-radius: 8px;
          cursor: pointer;
        }
        .tck-addr-action-btn:hover { border-color: var(--accent); color: var(--accent); }
        .tck-addr-action-btn.danger:hover { border-color: var(--danger); color: var(--danger); }
        .tck-addr-action-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .tck-addr-form {
          margin-top: 14px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .tck-addr-form input {
          border: 1px solid var(--line);
          border-radius: 8px;
          padding: 10px 12px;
          font-size: 14px;
          font-family: 'Inter', sans-serif;
          color: var(--ink);
          background: #F9FAFC;
        }
        .tck-addr-form input.full-row { grid-column: 1 / -1; }
        .tck-addr-form-actions {
          grid-column: 1 / -1;
          display: flex;
          gap: 10px;
          margin-top: 4px;
        }

        .tck-account-error {
          background: #FDEDEC;
          border: 1px solid #F5C6C0;
          color: var(--danger);
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 14px;
          margin-bottom: 16px;
        }
        .tck-account-success {
          background: rgba(0, 208, 132, 0.12);
          border: 1px solid rgba(0, 208, 132, 0.3);
          color: #00895a;
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 14px;
          margin-bottom: 16px;
        }
        .tck-account-loading {
          text-align: center;
          color: var(--muted);
          padding: 30px 0;
          font-family: 'IBM Plex Mono', monospace;
        }
      `}</style>

      <div className="tck-account-head">
        <h1 className="tck-title" style={{ fontSize: "clamp(24px, 3.5vw, 32px)" }}>
          บัญชีของฉัน
        </h1>
        <p className="tck-sub" style={{ margin: 0 }}>
          จัดการข้อมูลส่วนตัวและที่อยู่จัดส่งของคุณ
        </p>
      </div>

      <div className="tck-account-wrap">
        {/* Section 1: Profile */}
        <div className="tck-account-panel">
          <div className="tck-account-panel-head">
            <h2 className="tck-account-panel-title">ข้อมูลส่วนตัว</h2>
          </div>

          {loadingProfile ? (
            <div className="tck-account-loading">กำลังโหลด...</div>
          ) : profileLoadError ? (
            <div className="tck-account-error">{profileLoadError}</div>
          ) : (
            <form className="tck-account-form" onSubmit={handleSaveProfile}>
              {profileError && <div className="tck-account-error full-row">{profileError}</div>}
              {profileSuccess && (
                <div className="tck-account-success full-row">{profileSuccess}</div>
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

              <div className="tck-account-form-actions">
                <button type="submit" className="tck-cta" disabled={savingProfile}>
                  {savingProfile ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Section 2: Addresses */}
        <div className="tck-account-panel">
          <div className="tck-account-panel-head">
            <h2 className="tck-account-panel-title">ที่อยู่จัดส่ง</h2>
            <button
              type="button"
              className="tck-addr-toggle"
              onClick={() => (showAddressForm ? closeAddressForm() : openAddForm())}
            >
              {showAddressForm ? "ยกเลิก" : "+ เพิ่มที่อยู่ใหม่"}
            </button>
          </div>

          {addressActionError && <div className="tck-account-error">{addressActionError}</div>}

          {loadingAddresses ? (
            <div className="tck-account-loading">กำลังโหลด...</div>
          ) : addressLoadError ? (
            <div className="tck-account-error">{addressLoadError}</div>
          ) : (
            <>
              {addresses.length === 0 && !showAddressForm && (
                <div className="tck-addr-detail">
                  ยังไม่มีที่อยู่จัดส่ง กด "+ เพิ่มที่อยู่ใหม่" เพื่อเริ่มต้น
                </div>
              )}

              {addresses.length > 0 && (
                <div className="tck-addr-list">
                  {addresses.map((addr) => {
                    const isBusy = busyAddressId === addr.address_id;

                    return (
                      <div className="tck-addr-card" key={addr.address_id}>
                        <div>
                          <div className="tck-addr-name">
                            {addr.recipient_name}
                            {addr.is_default ? (
                              <span className="tck-addr-badge">ค่าเริ่มต้น</span>
                            ) : null}
                          </div>
                          <div className="tck-addr-detail">
                            {addr.phone}
                            <br />
                            {addr.address_line} {addr.subdistrict} {addr.district}{" "}
                            {addr.province} {addr.postal_code}
                          </div>
                        </div>

                        <div className="tck-addr-actions">
                          {!addr.is_default && (
                            <button
                              type="button"
                              className="tck-addr-action-btn"
                              disabled={isBusy}
                              onClick={() => handleSetDefault(addr)}
                            >
                              ตั้งเป็นค่าเริ่มต้น
                            </button>
                          )}
                          <button
                            type="button"
                            className="tck-addr-action-btn"
                            disabled={isBusy}
                            onClick={() => openEditForm(addr)}
                          >
                            แก้ไข
                          </button>
                          <button
                            type="button"
                            className="tck-addr-action-btn danger"
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
                <form className="tck-addr-form" onSubmit={handleSubmitAddress}>
                  {addressFormError && (
                    <div className="tck-account-error full-row">{addressFormError}</div>
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
                  <div className="tck-addr-form-actions">
                    <button type="submit" className="tck-cta" disabled={savingAddress}>
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
      </div>
    </div>
  );
}
