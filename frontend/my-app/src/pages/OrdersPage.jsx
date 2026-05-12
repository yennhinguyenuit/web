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
    <div className="mx-auto max-w-4xl p-6 md:p-10">
      <h1 className="mb-6 text-3xl font-bold">Đơn hàng của tôi</h1>

      <div className="mb-6 flex gap-2 border-b pb-2">
        {tabs.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={`rounded px-4 py-2 text-sm ${
              tab === item.key ? 'bg-red-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {item.label} ({groupedOrders[item.key]?.length || 0})
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-500">Đang tải đơn hàng...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : visibleOrders.length === 0 ? (
        <p className="text-gray-500">Không có đơn hàng trong mục này.</p>
      ) : (
        <div className="space-y-4">
          {visibleOrders.map((order) => (
            <article key={order.id} className="bg-white p-4 shadow">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-red-600">#{order.code}</p>
                  <p className="text-sm text-gray-500">Ngày đặt: {formatDate(order.createdAt)}</p>
                  <p className="text-sm text-gray-500">
                    {order.itemCount || order.items?.length || 0} sản phẩm
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(order.total)}</p>
                  <p className="text-sm text-gray-500">
                    {PAYMENT_STATUS_LABELS[normalizeStatus(order.paymentStatus)] || order.paymentStatus}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <span className="rounded-full bg-red-100 px-3 py-1 text-sm text-red-700">
                  {ORDER_STATUS_LABELS[normalizeStatus(order.status)] || order.status}
                </span>

                <Link to={`/orders/${order.id}`} className="text-sm font-medium text-blue-600">
                  Xem chi tiết
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
