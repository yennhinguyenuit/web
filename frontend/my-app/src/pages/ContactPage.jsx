import { useState } from "react";
import api from "../services/api";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", subject: "", message: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/contact", form);
      alert("Gửi thành công");
    } catch {
      alert("Lỗi gửi");
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Liên hệ</h1>

      <form onSubmit={handleSubmit}>
        <input placeholder="Tên"
          onChange={e => setForm({ ...form, name: e.target.value })} /><br />

        <input placeholder="Email"
          onChange={e => setForm({ ...form, email: e.target.value })} /><br />

        <textarea placeholder="Nội dung"
          onChange={e => setForm({ ...form, message: e.target.value })} /><br />

        <button type="submit">Gửi</button>
      </form>
    </div>
  );
}