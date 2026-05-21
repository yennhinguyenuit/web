import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '../services/api';

const ORDER_STATUS_LABELS = {
  pending: 'Chờ xử lý',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
};

const PAYMENT_STATUS_LABELS = {
  unpaid: 'Chưa thanh toán',
  pending: 'Đang chờ',
  paid: 'Đã thanh toán',
  failed: 'Thất bại',
  expired: 'Hết hạn',
  refunded: 'Đã hoàn tiền',
  cancelled: 'Đã hủy',
};

const tabs = [
  { key: 'processing', label: 'Đang xử lý' },
  { key: 'completed', label: 'Hoàn thành' },
  { key: 'cancelled', label: 'Đã hủy' },
];

const formatCurrency = (value) => `${Number(value || 0).toLocaleString('vi-VN')}đ`;
const formatDate = (value) => (value ? new Date(value).toLocaleDateString('vi-VN') : '');
const normalizeStatus = (value) => String(value || '').toLowerCase();
const fallbackProductImage = 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=300&q=80';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState('processing');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    const loadOrders = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await orderAPI.getOrders();
        if (!ignore) setOrders(Array.isArray(res?.data) ? res.data : []);
      } catch (err) {
        console.error(err);
        if (!ignore) setError(err?.message || 'Không thể tải đơn hàng');
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadOrders();
    return () => {
      ignore = true;
    };
  }, []);

  const groupedOrders = useMemo(() => ({
    processing: orders.filter((order) => (
      ['pending', 'confirmed', 'shipping'].includes(normalizeStatus(order.status))
    )),
    completed: orders.filter((order) => normalizeStatus(order.status) === 'completed'),
    cancelled: orders.filter((order) => normalizeStatus(order.status) === 'cancelled'),
  }), [orders]);

  const visibleOrders = groupedOrders[tab] || [];

  return (
    <div className="min-h-screen bg-zinc-50">
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-zinc-500">Tài khoản</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-zinc-950">Đơn hàng của tôi</h1>
          <p className="mt-3 max-w-2xl text-zinc-600">
            Theo dõi trạng thái xử lý, thanh toán và lịch sử các đơn hàng đã đặt.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap gap-2">
          {tabs.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className={`rounded-full px-5 py-2 text-sm font-bold transition ${
                tab === item.key ? 'bg-zinc-950 text-white' : 'border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100'
              }`}
            >
              {item.label} ({groupedOrders[item.key]?.length || 0})
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-36 animate-pulse rounded-lg bg-white shadow-sm" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-lg border border-zinc-300 bg-white p-6 text-zinc-700">{error}</div>
        ) : visibleOrders.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-10 text-center">
            <h2 className="text-xl font-black text-zinc-950">Chưa có đơn hàng trong mục này</h2>
            <p className="mt-2 text-zinc-600">Khi có đơn hàng phù hợp, chúng sẽ xuất hiện tại đây.</p>
            <Link to="/shop" className="mt-5 inline-flex rounded-md bg-zinc-950 px-5 py-3 text-sm font-bold text-white hover:bg-zinc-800">
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {visibleOrders.map((order) => (
              <article key={order.id} className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Mã đơn</p>
                    <p className="mt-1 text-xl font-black text-zinc-950">#{order.code}</p>
                    <p className="mt-2 text-sm text-zinc-500">Ngày đặt: {formatDate(order.createdAt)}</p>
                    <p className="text-sm text-zinc-500">{order.itemCount || order.items?.length || 0} sản phẩm</p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Tổng tiền</p>
                    <p className="mt-1 text-xl font-black text-zinc-950">{formatCurrency(order.total)}</p>
                    <p className="mt-2 text-sm text-zinc-500">
                      {PAYMENT_STATUS_LABELS[normalizeStatus(order.paymentStatus)] || order.paymentStatus}
                    </p>
                  </div>
                </div>

                {order.items?.length > 0 && (
                  <div className="mt-5 grid gap-3 border-t border-zinc-200 pt-4">
                    {order.items.slice(0, 3).map((item) => (
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
                        <p className="text-sm font-bold text-zinc-950">{formatCurrency(Number(item.price || item.unitPrice || 0) * Number(item.quantity || 0))}</p>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <p className="text-sm font-semibold text-zinc-500">+{order.items.length - 3} sản phẩm khác</p>
                    )}
                  </div>
                )}

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 pt-4">
                  <span className="rounded-full border border-zinc-300 bg-zinc-100 px-3 py-1 text-sm font-bold text-zinc-700">
                    {ORDER_STATUS_LABELS[normalizeStatus(order.status)] || order.status}
                  </span>

                  <Link to={`/orders/${order.id}`} className="rounded-md bg-zinc-950 px-4 py-2 text-sm font-bold text-white hover:bg-zinc-800">
                    Xem chi tiết
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
