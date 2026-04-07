import { useState } from "react"
import api from "../services/api"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleRegister = async (e) => {
    e.preventDefault()

    try {
      await api.post("/auth/register", { email, password })
      alert("Register success")
      window.location.href = "/login"
    } catch (err) {
      alert("Register failed")
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-gray-100">
      <form 
        onSubmit={handleRegister}
        className="bg-white p-8 rounded shadow w-96"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">Register</h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-4 border rounded"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-4 border rounded"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <button className="w-full bg-red-600 text-white py-3 rounded">
          Register
        </button>
      </form>
    </div>
  )
}