import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Homepage from "../pages/Homepage";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ProductsPage from "../pages/Products";
import ProductDetail from "../pages/ProductDetail";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";
import MyOrders from "../pages/Orders";
import OrderDetail from "../pages/OrderDetail";

import Dashboard from "../pages/admin/Dashboard";
import Categories from "../pages/admin/Categories";
import Products from "../pages/admin/Products";
import Orders from "../pages/admin/Orders";
import Customers from "../pages/admin/Customers";
import Reports from "../pages/admin/Reports";



import PrivateRoute from "./PrivateRoute";
import AdminLayout from "../components/layout/AdminLayout";

const ComingSoon = ({ title }) => (
  <div style={{ padding: "2rem" }}>
    <h1>{title}</h1>
    <p>Coming Soon</p>
  </div>
);

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
              <ComingSoon title="Warranty" />
            </PrivateRoute>
          }
        />
        <Route
          path="/warranty/:id"
          element={
            <PrivateRoute>
              <ComingSoon title="Warranty Detail" />
            </PrivateRoute>
          }
        />
        <Route
          path="/warranty-claims"
          element={
            <PrivateRoute>
              <ComingSoon title="Warranty Claims" />
            </PrivateRoute>
          }
        />
        <Route
          path="/warranty-claims/:id"
          element={
            <PrivateRoute>
              <ComingSoon title="Warranty Claim Detail" />
            </PrivateRoute>
          }
        />
        <Route
          path="/my-account"
          element={
            <PrivateRoute>
              <ComingSoon title="My Account" />
            </PrivateRoute>
          }
        />

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
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}
