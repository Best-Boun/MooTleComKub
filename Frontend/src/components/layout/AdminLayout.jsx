import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function AdminLayout() {
  return (
    <div className="d-flex vh-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-grow-1 d-flex flex-column">
        <Navbar />

        <main className="p-4 bg-light flex-grow-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
