import { useLocation, useNavigate } from 'react-router-dom';

export default function OrderSuccess() {
  const navigate = useNavigate();
  const { state, search } = useLocation();
  const params = new URLSearchParams(search);

  const orderId = state?.orderId || params.get('orderId');
  const orderCode = state?.orderCode || params.get('code');

  if (!orderId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="bg-white p-10 text-center shadow">
          <h2 className="mb-3 text-xl font-bold">Không tìm thấy đơn hàng</h2>
          <button
            type="button"
            onClick={() => navigate('/orders')}
            className="rounded bg-red-600 px-6 py-2 text-white"
          >
            Xem đơn hàng của tôi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-lg bg-white p-10 text-center shadow">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <span className="text-4xl text-green-600">✓</span>
        </div>

        <h1 className="mb-3 text-2xl font-bold">Đặt hàng thành công!</h1>

        <p className="mb-2 text-gray-600">Cảm ơn bạn đã mua hàng.</p>

        <p className="mb-4">
          Mã đơn hàng của bạn là{' '}
          <span className="font-semibold text-red-600">#{orderCode || orderId}</span>
        </p>

        <p className="mb-6 text-gray-500">
          Chúng tôi sẽ liên hệ và xác nhận đơn hàng sớm nhất.
        </p>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => navigate(`/orders/${orderId}`)}
            className="rounded bg-red-600 px-6 py-3 font-semibold text-white"
          >
            Xem đơn hàng
          </button>

          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/products')}
              className="rounded bg-black px-6 py-2 text-white"
            >
              Tiếp tục mua sắm
            </button>

            <button
              type="button"
              onClick={() => navigate('/')}
              className="rounded border px-6 py-2"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
