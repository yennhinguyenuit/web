import { Link } from "react-router-dom"
import "./Header.css"

function Header() {
  return (
    <header className="header">
      <h2 className="logo">LUXE STORE</h2>

      <nav className="nav">
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/blog">Blog</Link>
      </nav>

      <div className="right">
        <input className="search" placeholder="Search..." />

        {/* 👉 THÊM 2 NÚT NÀY */}
        <Link to="/login" className="auth-btn">Login</Link>
        <Link to="/register" className="auth-btn">Register</Link>

        <Link to="/cart">
          <button className="cart">🛒</button>
        </Link>
      </div>
    </header>
  )
}

export default Header