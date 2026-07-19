import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { PermissionProvider, usePermissions } from "../../context/PermissionContext";

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

  const segment = location.pathname.split("/")[2];
  const pageKey = PAGE_KEY_BY_SEGMENT[segment];

  if (loading) {
    return <div className="tckad-loading">กำลังโหลด...</div>;
  }

  if (pageKey && !isSuperAdmin && !canView(pageKey)) {
    return (
      <div className="tckad-noaccess">
        <h4>ไม่มีสิทธิ์เข้าถึงหน้านี้</h4>
        <p>กรุณาติดต่อ SuperAdmin เพื่อขอสิทธิ์การเข้าถึงหน้านี้</p>
      </div>
    );
  }

  return <Outlet />;
}

export default function AdminLayout() {
  return (
    <PermissionProvider>
      <div className="tckad-shell">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap');

          .tckad-shell {
            --page-bg: #F6F7F9;
            --surface: #FFFFFF;
            --ink: #1C1F26;
            --muted: #6B7280;
            --line: #E8E8EC;
            --accent: #E2574C;
            --accent-dark: #B8362D;
            --accent-tint: #FDEDEB;
            --accent-ink: #FFFFFF;
            --led: #1F9E75;

            display: flex;
            min-height: 100vh;
            background: var(--page-bg);
            color: var(--ink);
            font-family: 'Inter', sans-serif;
          }
          .tckad-main {
            flex: 1;
            display: flex;
            flex-direction: column;
            min-width: 0;
          }
          .tckad-content {
            flex: 1;
            overflow: auto;
            padding: 28px;
          }
          .tckad-loading, .tckad-noaccess {
            background: var(--surface);
            border: 1px solid var(--line);
            border-radius: 14px;
            padding: 24px;
            color: var(--muted);
          }
          .tckad-noaccess h4 {
            font-family: 'Space Grotesk', sans-serif;
            color: var(--ink);
            margin: 0 0 8px;
          }
        `}</style>

        <Sidebar />

        <div className="tckad-main">
          <Navbar />
          <main className="tckad-content">
            <AdminContent />
          </main>
        </div>
      </div>
    </PermissionProvider>
  );
}