import { Routes, Route } from 'react-router-dom';

import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';

import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import BlogPage from './pages/BlogPage';
import ContactPage from './pages/ContactPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CouponsPage from './pages/admin/CouponsPage';
import FlashSalePage from './pages/admin/FlashSalePage';
import ReviewsPage from './pages/ReviewsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import WishlistPage from './pages/WishlistPage';
import AccountPage from './pages/AccountPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import OrderSuccess from './pages/OrdersSuccessPage';
import PaymentResultPage from './pages/PaymentResultPage';
import FAQPage from './pages/FAQPage';
import SizeGuidePage from './pages/SizeGuidePage';
import ShippingReturnsPage from './pages/ShippingReturnsPage';
import GiftCardsPage from './pages/GiftCardsPage';
import LoyaltyPage from './pages/LoyaltyPage';
import LookbookPage from './pages/LookbookPage';
import StoreLocatorPage from './pages/StoreLocatorPage';
import PartnersPage from './pages/PartnersPage';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCustomers from './pages/admin/AdminCustomers';

import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route element={<UserLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/shop" element={<ProductsPage />} />
        <Route path="/men" element={<ProductsPage initialCategory="nam" pageTitle="Thời trang nam" />} />
        <Route path="/women" element={<ProductsPage initialCategory="nu" pageTitle="Thời trang nữ" />} />
        <Route path="/accessories" element={<ProductsPage initialCategory="phu-kien" pageTitle="Phụ kiện" />} />
        <Route path="/shoes" element={<ProductsPage initialCategory="giay" pageTitle="Giày dép" />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/reviews" element={<ReviewsPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/size-guide" element={<SizeGuidePage />} />
        <Route path="/shipping-returns" element={<ShippingReturnsPage />} />
        <Route path="/gift-cards" element={<GiftCardsPage />} />
        <Route path="/loyalty" element={<LoyaltyPage />} />
        <Route path="/lookbook" element={<LookbookPage />} />
        <Route path="/store-locator" element={<StoreLocatorPage />} />
        <Route path="/partners" element={<PartnersPage />} />
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

        <Route
          path="/wishlist"
          element={
            <ProtectedRoute>
              <WishlistPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <AccountPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute>
              <OrderDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/payment/result"
          element={
            <ProtectedRoute>
              <PaymentResultPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order-success"
          element={
            <ProtectedRoute>
              <OrderSuccess />
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
      >
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="users" element={<AdminCustomers />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="coupons" element={<CouponsPage />} />
        <Route path="flash-sale" element={<FlashSalePage />} />
      </Route>
    </Routes>
  );
}

export default App;
