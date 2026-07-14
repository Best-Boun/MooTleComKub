import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Homepage from "../pages/Homepage";
import Login from "../pages/Login";
import Register from "../pages/Register";

import Dashboard from "../pages/admin/Dashboard";
import Categories from "../pages/admin/Categories";
import Products from "../pages/admin/Products";
import Orders from "../pages/admin/Orders";
import Customers from "../pages/admin/Customers";
import Reports from "../pages/admin/Reports";


import PrivateRoute from "./PrivateRoute";
import AdminLayout from "../components/layout/AdminLayout";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="categories" element={<Categories />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders />} />
          <Route path="customers" element={<Customers />} />
          <Route
            path="reports"
            element={
              <PrivateRoute allowedRoles={[3]}>
                <Reports />
              </PrivateRoute>
            }
          />
        </Route>

        {/* Default */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
