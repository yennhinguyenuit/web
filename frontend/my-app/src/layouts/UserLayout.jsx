import { useEffect, useState } from "react"
import Header from "../components/Header"
import Footer from "../components/Footer"
import ChatBot from "../components/chatbot"
import api from "../services/api"

function UserLayout({ children }) {
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

  return (
    <>
      <Header user={user} cartCount={cartCount} />

      <main className="min-h-[80vh]">
        {children}
      </main>

      {/* 🔥 QUAN TRỌNG */}
      <Footer />
      <ChatBot />
    </>
  )
}

export default UserLayout