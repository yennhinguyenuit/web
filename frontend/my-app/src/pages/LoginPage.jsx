import { useState } from "react";
import api from "../services/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/auth/login", { email, password });

      localStorage.setItem("token", res.data.data.token);

      alert("Login success");
      window.location.href = "/";
    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-gray-100">
      <form 
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-lg shadow-md w-96"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-red-600 text-white py-3 rounded hover:bg-red-700 transition"
        >
          Login
        </button>
      </form>
    </div>
  );
}