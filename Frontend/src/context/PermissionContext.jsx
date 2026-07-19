import { createContext, useContext, useEffect, useState } from "react";
import permissionService from "../services/permissionService";

const PermissionContext = createContext(null);

export const ADMIN_PAGES = [
  { key: "dashboard", label: "Dashboard" },
  { key: "categories", label: "Categories" },
  { key: "products", label: "Products" },
  { key: "orders", label: "Orders" },
  { key: "customers", label: "Customers" },
];

const getStoredUser = () => {
  const raw =
    localStorage.getItem("user") || sessionStorage.getItem("user") || null;

  return raw ? JSON.parse(raw) : null;
};

export function PermissionProvider({ children }) {
  const storedUser = getStoredUser();
  const isSuperAdmin = storedUser?.role_id === 3;

  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(!isSuperAdmin);

  useEffect(() => {
    if (isSuperAdmin) {
      setLoading(false);
      return;
    }

    let mounted = true;

    permissionService
      .getMyPermissions()
      .then((res) => {
        if (mounted) setPermissions(res.permissions || {});
      })
      .catch(() => {
        if (mounted) setPermissions({});
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canView = (pageKey) =>
    isSuperAdmin || Boolean(permissions[pageKey]?.can_view);

  const canManage = (pageKey) =>
    isSuperAdmin || Boolean(permissions[pageKey]?.can_manage);

  return (
    <PermissionContext.Provider
      value={{ loading, isSuperAdmin, permissions, canView, canManage }}
    >
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions() {
  const ctx = useContext(PermissionContext);

  if (!ctx) {
    throw new Error("usePermissions must be used within a PermissionProvider");
  }

  return ctx;
}
