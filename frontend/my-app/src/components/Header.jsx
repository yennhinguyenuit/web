import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import api from "../services/api"

function Header() {
  const [user, setUser] = useState(null)
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return

    api.get("/auth/me")
      .then(res => {
        if (res.data.success) setUser(res.data.data)
      })

    api.get("/cart")
      .then(res => {
        if (res.data.success) {
          const total = res.data.data.items.reduce((s, i) => s + i.quantity, 0)
          setCartCount(total)
        }
      })
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    window.location.reload()
  }

  return (
    <header className="bg-red-600 text-white px-8 py-4 flex justify-between items-center shadow">

      {/* LOGO */}
      <Link to="/" className="text-xl font-bold">
        LUXE STORE
      </Link>

      {/* NAV MENU */}
      <nav className="flex gap-6 font-medium">
        <Link to="/">Home</Link>
        <Link to="/products">Shop</Link>
        <Link to="/about">About</Link>
        <Link to="/blog">Blog</Link>
        {user && <Link to="/account">Account</Link>}
      </nav>

      {/* RIGHT */}
      <div className="flex items-center gap-4">

        {/* SEARCH */}
        <input
          placeholder="Search..."
          className="px-3 py-1 rounded text-black w-48 outline-none"
        />

        {/* USER */}
        {user ? (
          <>
            <span>Hi, {user.email}</span>
            <button
              onClick={handleLogout}
              className="bg-white text-red-600 px-3 py-1 rounded"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="bg-white text-red-600 px-3 py-1 rounded">
              Login
            </Link>
            <Link to="/register" className="bg-white text-red-600 px-3 py-1 rounded">
              Register
            </Link>
          </>
        )}

        {/* CART */}
        <Link to="/cart">
          <div className="bg-white text-red-600 px-3 py-1 rounded">
            🛒 ({cartCount})
          </div>
        </Link>

      </div>
    </header>
  )
}

export default Header