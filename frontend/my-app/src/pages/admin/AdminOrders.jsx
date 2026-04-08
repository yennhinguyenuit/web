import { useEffect, useMemo, useState } from 'react';
import { adminAPI } from '../../services/api';

const statusOptions = [
  { value: 'pending', label: 'Chờ xử lý' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'shipping', label: 'Đang giao' },
  { value: 'delivered', label: 'Đã giao' },
  { value: 'cancelled', label: 'Đã hủy' },
];

const paymentOptions = [
  { value: 'unpaid', label: 'Chưa thanh toán' },
  { value: 'pending', label: 'Đang chờ' },
  { value: 'paid', label: 'Đã thanh toán' },
  { value: 'failed', label: 'Thất bại' },
  { value: 'expired', label: 'Hết hạn' },
  { value: 'refunded', label: 'Đã hoàn tiền' },
];

const statusLabel = Object.fromEntries(statusOptions.map((item) => [item.value, item.label]));
const paymentLabel = Object.fromEntries(paymentOptions.map((item) => [item.value, item.label]));

const statusClass = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  shipping: 'bg-purple-100 text-purple-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
};

const paymentClass = {
  unpaid: 'bg-slate-100 text-slate-700',
  pending: 'bg-amber-100 text-amber-700',
  paid: 'bg-emerald-100 text-emerald-700',
  failed: 'bg-red-100 text-red-700',
  expired: 'bg-orange-100 text-orange-700',
  refunded: 'bg-sky-100 text-sky-700',
};

const formatCurrency = (value) => `${Number(value || 0).toLocaleString()}đ`;
const formatDateTime = (value) => {
  if (!value) return '---';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '---';
  return date.toLocaleString('vi-VN');
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [keyword, setKeyword] = useState('');
  const [savingId, setSavingId] = useState('');

  const loadOrders = async () => {
    try {
      const res = await adminAPI.getOrders();
      setOrders(res.data || []);
      setError('');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Không tải được đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return orders;

    return orders.filter((order) =>
      [order.code, order.customer?.name, order.customer?.email, order.paymentMethod, order.shippingMethod]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(kw))
    );
  }, [orders, keyword]);

  const handleChangeField = (orderId, key, value) => {
    setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, [key]: value } : order)));
  };

  const handleSave = async (order) => {
    setSavingId(order.id);
    try {
      const res = await adminAPI.updateOrderStatus(order.id, {
        status: order.status,
        paymentStatus: order.paymentStatus,
      });
      const updated = res.data;
      setOrders((prev) => prev.map((item) => (item.id === order.id ? updated : item)));
    } catch (err) {
      console.error(err);
      alert(err.message || 'Không thể cập nhật đơn hàng');
    } finally {
      setSavingId('');
    }
  };

  if (loading) {
    return <div className="text-slate-600">Đang tải đơn hàng...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white shadow-sm border border-slate-100 p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý đơn hàng</h1>
          <p className="text-slate-500 mt-1">Cập nhật trạng thái giao hàng, thanh toán và kiểm tra khách mua</p>
        </div>

        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Tìm mã đơn, khách hàng, email..."
          className="border border-slate-300 rounded-xl px-4 py-3 w-full lg:w-80"
        />
      </div>

      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <div key={order.id} className="rounded-2xl bg-white shadow-sm border border-slate-100 p-5 space-y-5">
            <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-800">{order.code}</h3>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusClass[order.status] || 'bg-slate-100 text-slate-700'}`}>
                    {statusLabel[order.status] || order.status}
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${paymentClass[order.paymentStatus] || 'bg-slate-100 text-slate-700'}`}>
                    {paymentLabel[order.paymentStatus] || order.paymentStatus}
                  </span>
                </div>

                <div className="text-sm text-slate-600 space-y-1">
                  <p><span className="font-medium text-slate-700">Khách hàng:</span> {order.customer?.name || 'Không rõ khách hàng'}</p>
                  <p><span className="font-medium text-slate-700">Email:</span> {order.customer?.email || '---'}</p>
                  <p><span className="font-medium text-slate-700">Ngày tạo:</span> {formatDateTime(order.createdAt)}</p>
                  <p><span className="font-medium text-slate-700">Thanh toán:</span> {order.paymentMethod || '---'}</p>
                  <p><span className="font-medium text-slate-700">Vận chuyển:</span> {order.shippingMethod || '---'}</p>
                </div>
              </div>

              <div className="text-left xl:text-right">
                <p className="text-sm text-slate-500">Tổng tiền</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(order.total)}</p>
                <p className="text-sm text-slate-500 mt-1">{order.items?.length || 0} sản phẩm</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-[1fr_1fr_auto] gap-4 items-end">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Trạng thái đơn hàng</span>
                <select
                  value={order.status}
                  onChange={(e) => handleChangeField(order.id, 'status', e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Trạng thái thanh toán</span>
                <select
                  value={order.paymentStatus}
                  onChange={(e) => handleChangeField(order.id, 'paymentStatus', e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3"
                >
                  {paymentOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>

              <button
                onClick={() => handleSave(order)}
                disabled={savingId === order.id}
                className="rounded-xl bg-red-600 text-white px-5 py-3 font-medium hover:bg-red-700 disabled:opacity-60"
              >
                {savingId === order.id ? 'Đang lưu...' : 'Lưu cập nhật'}
              </button>
            </div>

            {order.items?.length ? (
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                <p className="font-semibold text-slate-800 mb-3">Sản phẩm trong đơn</p>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-xl bg-white border border-slate-200 p-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {item.product?.image ? (
                          <img src={item.product.image} alt={item.product?.name || 'product'} className="w-14 h-14 rounded-xl object-cover border shrink-0" />
                        ) : null}
                        <div className="min-w-0">
                          <p className="font-medium text-slate-800 truncate">{item.product?.name || 'Sản phẩm đã xóa'}</p>
                          <p className="text-sm text-slate-500">SL: {item.quantity}</p>
                        </div>
                      </div>

                      <div className="text-sm text-slate-700 font-medium">
                        {formatCurrency(item.price)} / sản phẩm
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ))}
      </div>

      {!filteredOrders.length ? (
        <div className="rounded-2xl bg-white shadow-sm border border-slate-100 p-6 text-slate-500">
          Không có đơn hàng phù hợp.
        </div>
      ) : null}
    </div>
  );
}
