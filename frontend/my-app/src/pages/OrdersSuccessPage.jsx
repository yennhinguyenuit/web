import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { orderAPI } from '../services/api';

const fallbackProductImage = 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=300&q=80';

export default function OrderSuccess() {
  const navigate = useNavigate();
  const { state, search } = useLocation();
  const params = new URLSearchParams(search);
  const [order, setOrder] = useState(null);

  const orderId = state?.orderId || params.get('orderId');
  const orderCode = state?.orderCode || params.get('code');

  useEffect(() => {
    if (!orderId) return;

    let ignore = false;
    orderAPI.getOrderById(orderId)
      .then((response) => {
        if (!ignore) setOrder(response?.data || null);
      })
      .catch(console.error);

    return () => {
      ignore = true;
    };
  }, [orderId]);

  if (!orderId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
        <div className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-2xl font-black text-zinc-950">Không tìm thấy đơn hàng</h2>
          <p className="mt-3 text-zinc-600">Bạn có thể kiểm tra lại trong danh sách đơn hàng của mình.</p>
          <button
            type="button"
            onClick={() => navigate('/orders')}
            className="mt-6 rounded-md bg-zinc-950 px-6 py-3 text-sm font-bold text-white hover:bg-zinc-800"
          >
            Xem đơn hàng của tôi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-10">
      <div className="w-full max-w-2xl rounded-lg border border-zinc-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-zinc-950 text-4xl font-black text-white">
          ✓
        </div>

        <p className="mt-6 text-sm font-black uppercase tracking-[0.22em] text-zinc-500">Đặt hàng thành công</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-zinc-950">Cảm ơn bạn đã mua hàng</h1>

        <p className="mx-auto mt-4 max-w-lg text-zinc-600">
          Đơn hàng đã được ghi nhận. Shop sẽ xác nhận, đóng gói và cập nhật trạng thái trong trang chi tiết đơn.
        </p>

        <div className="mx-auto mt-6 max-w-md rounded-lg border border-zinc-200 bg-zinc-50 p-5">
          <p className="text-sm text-zinc-500">Mã đơn hàng</p>
          <p className="mt-1 text-2xl font-black text-zinc-950">#{orderCode || order?.code || orderId}</p>
        </div>

        {order?.items?.length > 0 && (
          <div className="mx-auto mt-6 max-w-lg rounded-lg border border-zinc-200 bg-white p-4 text-left">
            <p className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-zinc-500">Sản phẩm đã đặt</p>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <img
                    src={item.product?.image || item.productImage || fallbackProductImage}
                    onError={(event) => {
                      event.currentTarget.src = fallbackProductImage;
                    }}
                    alt={item.product?.name || item.productName || 'Sản phẩm'}
                    className="h-14 w-14 rounded-md border border-zinc-200 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-bold text-zinc-950">{item.product?.name || item.productName || 'Sản phẩm'}</p>
                    <p className="text-xs text-zinc-500">SL: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => navigate(`/orders/${orderId}`)}
            className="rounded-md bg-zinc-950 px-6 py-3 text-sm font-black uppercase tracking-wide text-white hover:bg-zinc-800"
          >
            Xem đơn hàng
          </button>

          <button
            type="button"
            onClick={() => navigate('/shop')}
            className="rounded-md border border-zinc-300 px-6 py-3 text-sm font-bold text-zinc-950 hover:bg-zinc-100"
          >
            Tiếp tục mua sắm
          </button>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="rounded-md border border-zinc-300 px-6 py-3 text-sm font-bold text-zinc-950 hover:bg-zinc-100"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}
