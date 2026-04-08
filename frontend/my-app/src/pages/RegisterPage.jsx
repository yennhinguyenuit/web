import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleRegister = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const res = await register({ name, email, phone, password });
      alert(res.message || 'Đăng ký thành công');
      navigate('/login');
    } catch (error) {
      alert(error.message || 'Đăng ký thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-gray-100">
      <form onSubmit={handleRegister} className="bg-white p-8 rounded shadow w-96 space-y-4">
        <h1 className="text-2xl font-bold text-center">Đăng ký</h1>

        <input
          type="text"
          placeholder="Họ tên"
          className="w-full p-3 border rounded"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 border rounded"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Số điện thoại (không bắt buộc)"
          className="w-full p-3 border rounded"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
        />

        <input
          type="password"
          placeholder="Mật khẩu"
          className="w-full p-3 border rounded"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        <button disabled={submitting} className="w-full bg-red-600 text-white py-3 rounded disabled:opacity-60">
          {submitting ? 'Đang đăng ký...' : 'Đăng ký'}
        </button>
      </form>
    </div>
  );
}
