import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

const handleLogin = async (event) => {
  event.preventDefault();
  setSubmitting(true);

  try {
    const res = await login(email, password);
    const loggedInUser = res?.data?.user;
    const from = location.state?.from;

    alert(res.message || 'Đăng nhập thành công');

    if (loggedInUser?.role === 'admin') {
      navigate(from?.startsWith('/admin') ? from : '/admin', { replace: true });
      return;
    }

    navigate(from && from !== '/login' ? from : '/', { replace: true });
  } catch (error) {
    alert(error.message || 'Đăng nhập thất bại');
  } finally {
    setSubmitting(false);
  }
};

  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Đăng nhập</h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Mật khẩu"
          className="w-full p-3 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-red-600 text-white py-3 rounded hover:bg-red-700 transition disabled:opacity-60"
        >
          {submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>
    </div>
  );
}
