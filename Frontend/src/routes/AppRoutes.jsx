import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Homepage from "../pages/Homepage";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ProductsPage from "../pages/Products";
import ProductDetail from "../pages/ProductDetail";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";
import MyOrders from "../pages/Orders";
import OrderDetail from "../pages/OrderDetail"; // ของลูกค้า
import Warranty from "../pages/Warranty";
import WarrantyDetail from "../pages/WarrantyDetail";
import WarrantyClaimNew from "../pages/WarrantyClaimNew";
import WarrantyClaims from "../pages/WarrantyClaims";
import WarrantyClaimDetail from "../pages/WarrantyClaimDetail";
import MyAccount from "../pages/MyAccount";

// Admin Pages
import Dashboard from "../pages/admin/Dashboard";
import Categories from "../pages/admin/Categories";
import Products from "../pages/admin/Products";
import Orders from "../pages/admin/Orders";
import Customers from "../pages/admin/Customers";
import Reports from "../pages/admin/Reports";
import AdminWarrantyClaims from "../pages/admin/WarrantyClaims";
import CustomerDetail from "../pages/admin/CustomerDetail";
import AdminOrderDetail from "../pages/admin/OrderDetail";  // ของแอดมิน
import AdminWarrantyClaimDetail from "../pages/admin/WarrantyClaimDetail";

import PrivateRoute from "./PrivateRoute";
import AdminLayout from "../components/layout/AdminLayout";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Homepage />
            </PrivateRoute>
          }
        />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/products"
          element={
            <PrivateRoute>
              <ProductsPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/products/:id"
          element={
            <PrivateRoute>
              <ProductDetail />
            </PrivateRoute>
          }
        />

        <Route
          path="/cart"
          element={
            <PrivateRoute>
              <Cart />
            </PrivateRoute>
          }
        />

        <Route
          path="/checkout"
          element={
            <PrivateRoute>
              <Checkout />
            </PrivateRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <PrivateRoute>
              <MyOrders />
            </PrivateRoute>
          }
        />

        <Route
          path="/orders/:id"
          element={
            <PrivateRoute>
              <OrderDetail />
            </PrivateRoute>
          }
        />

        <Route
          path="/warranty"
          element={
            <PrivateRoute>
              <Warranty />
            </PrivateRoute>
          }
        />

        <Route
          path="/warranty/:id"
          element={
            <PrivateRoute>
              <WarrantyDetail />
            </PrivateRoute>
          }
        />

        <Route
          path="/warranty-claims/new"
          element={
            <PrivateRoute>
              <WarrantyClaimNew />
            </PrivateRoute>
          }
        />

        <Route
          path="/warranty-claims"
          element={
            <PrivateRoute>
              <WarrantyClaims />
            </PrivateRoute>
          }
        />

        <Route
          path="/warranty-claims/:id"
          element={
            <PrivateRoute>
              <WarrantyClaimDetail />
            </PrivateRoute>
          }
        />

        <Route
          path="/my-account"
          element={
            <PrivateRoute>
              <MyAccount />
            </PrivateRoute>
          }
        />

        {/* ================= ADMIN ================= */}

        <Route
          path="/admin"
          element={
            <PrivateRoute allowedRoles={[2, 3]}>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="categories" element={<Categories />} />
          <Route path="products" element={<Products />} />

          {/* Orders */}
          <Route path="orders" element={<Orders />} />
          <Route path="orders/:id" element={<AdminOrderDetail />} />

          {/* Warranty */}
          <Route path="warranty-claims" element={<AdminWarrantyClaims />} />
          <Route
            path="warranty-claims/:id"
            element={<AdminWarrantyClaimDetail />}
          />

          {/* Customers */}
          <Route path="customers" element={<Customers />} />
          <Route path="customers/:id" element={<CustomerDetail />} />

          {/* Reports */}
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
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
