import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';

import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';

import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';

import ProtectedRoute from './components/ProtectedRoute';

function App() {

  // 🔥 AUTO SYNC CART
  useEffect(() => {
    const syncCart = async () => {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");

      if (!cart.length) return;

      console.log("🔄 Sync cart...");

      for (const item of cart) {
        await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: item.id,
            quantity: item.quantity,
          }),
        });
      }

      localStorage.removeItem("cart");

      alert("🟢 Đã đồng bộ giỏ hàng!");
    };

    window.addEventListener("online", syncCart);

    return () => window.removeEventListener("online", syncCart);
  }, []);

  return (
    <Routes>
      <Route element={<UserLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<ProductsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/cart" element={<CartPage />} />

        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;