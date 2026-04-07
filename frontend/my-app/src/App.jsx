import { Routes, Route } from "react-router-dom"
import UserLayout from "./layouts/UserLayout"

import HomePage from "./pages/HomePage"
import AboutPage from "./pages/AboutPage"
import BlogPage from "./pages/BlogPage"
import ProductsPage from "./pages/ProductsPage"
import ProductDetailPage from "./pages/ProductDetailPage"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import CartPage from "./pages/CartPage"
import CheckoutPage from "./pages/CheckoutPage"
import AccountPage from "./pages/AccountPage"

function App() {
  return (
    <UserLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/blog" element={<BlogPage />} />

        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />

        <Route path="/account" element={<AccountPage />} />
      </Routes>
    </UserLayout>
  )
}

export default App