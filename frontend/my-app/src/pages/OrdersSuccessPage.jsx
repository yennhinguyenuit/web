import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function OrderSuccess() {
  const navigate = useNavigate();
  const { state, search } = useLocation();

  // 🔥 LẤY DATA từ 2 nguồn (state + URL)
  const params = new URLSearchParams(search);

  const orderId = state?.orderId || params.get('orderId');
  const orderCode = state?.orderCode || params.get('code');

  // ❌ KHÔNG redirect ngay nữa → để fallback UI
  useEffect(() => {
    if (!orderId) {
      console.warn('❌ Không có orderId');
    }
  }, [orderId]);

  // ❌ Nếu không có data → show message (KHÔNG redirect)
  if (!orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-10 rounded shadow text-center">
          <h2 className="text-xl font-bold mb-3">Không tìm thấy đơn hàng</h2>
          <button
            onClick={() => navigate('/orders')}
            className="bg-red-600 text-white px-6 py-2 rounded"
          >
            Xem đơn hàng của tôi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-10 rounded shadow text-center max-w-lg w-full">

        {/* ICON */}
        <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center bg-green-100 rounded-full">
          <span className="text-green-600 text-4xl">✓</span>
        </div>

        {/* TITLE */}
        <h1 className="text-2xl font-bold mb-3">
          Đặt hàng thành công!
        </h1>

        <p className="text-gray-600 mb-2">
          Cảm ơn bạn đã mua hàng.
        </p>

        <p className="mb-4">
          Mã đơn hàng của bạn là{' '}
          <span className="font-semibold text-red-600">
            #{orderCode || orderId}
          </span>
        </p>

        <p className="text-gray-500 mb-6">
          Chúng tôi sẽ liên hệ và xác nhận đơn hàng sớm nhất.
        </p>

        {/* BUTTONS */}
        <div className="flex flex-col gap-3">

          {/* 👉 XEM ĐƠN */}
          <button
            onClick={() => navigate(`/orders/${orderId}`)}
            className="bg-red-600 text-white px-6 py-3 rounded font-semibold"
          >
            Xem đơn hàng
          </button>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('/products')}
              className="bg-black text-white px-6 py-2 rounded"
            >
              Tiếp tục mua sắm
            </button>

            <button
              onClick={() => navigate('/')}
              className="border px-6 py-2 rounded"
            >
              Về trang chủ
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}