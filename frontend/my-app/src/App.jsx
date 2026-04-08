import { Routes, Route } from 'react-router-dom';
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';

import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import AccountPage from './pages/AccountPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import PaymentResultPage from './pages/PaymentResultPage';
import WishlistPage from './pages/WishlistPage';
import ContactPage from './pages/ContactPage';
import ReviewsPage from './pages/ReviewsPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminReports from './pages/admin/AdminReports';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route element={<UserLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/shop" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/reviews" element={<ReviewsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route
          path="/checkout"
          element={(
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/wishlist"
          element={(
            <ProtectedRoute>
              <WishlistPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/account"
          element={(
            <ProtectedRoute>
              <AccountPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/orders"
          element={(
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/orders/:id"
          element={(
            <ProtectedRoute>
              <OrderDetailPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/payment/result"
          element={(
            <ProtectedRoute>
              <PaymentResultPage />
            </ProtectedRoute>
          )}
        />
      </Route>

      <Route
        path="/admin"
        element={(
          <ProtectedRoute roles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        )}
      >
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="reports" element={<AdminReports />} />
      </Route>
    </Routes>
  );
}

export default App;
