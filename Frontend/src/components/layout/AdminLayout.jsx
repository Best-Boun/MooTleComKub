import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { PermissionProvider, usePermissions } from "../../context/PermissionContext";

// แปลง path segment (/admin/xxx) เป็น page_key ที่ตรงกับระบบสิทธิ์ฝั่ง Backend
const PAGE_KEY_BY_SEGMENT = {
  dashboard: "dashboard",
  categories: "categories",
  products: "products",
  orders: "orders",
  customers: "customers",
};

function AdminContent() {
  const location = useLocation();
  const { loading, isSuperAdmin, canView } = usePermissions();

  // path รูปแบบ /admin/xxx หรือ /admin/xxx/:id -> เอา segment ที่ 2 มาเทียบ
  const segment = location.pathname.split("/")[2];
  const pageKey = PAGE_KEY_BY_SEGMENT[segment];

  if (loading) {
    return <div className="p-4 text-muted">กำลังโหลด...</div>;
  }

  if (pageKey && !isSuperAdmin && !canView(pageKey)) {
    return (
      <div className="p-4">
        <h4 className="mb-2">ไม่มีสิทธิ์เข้าถึงหน้านี้</h4>
        <p className="text-muted mb-0">
          กรุณาติดต่อ SuperAdmin เพื่อขอสิทธิ์การเข้าถึงหน้านี้
        </p>
      </div>
    );
  }

  return <Outlet />;
}

export default function AdminLayout() {
  return (
    <PermissionProvider>
      <div className="d-flex vh-100">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-grow-1 d-flex flex-column">
          <Navbar />

          <main className="p-4 bg-light flex-grow-1 overflow-auto">
            <AdminContent />
          </main>
        </div>
      </div>
    </PermissionProvider>
  );
}
