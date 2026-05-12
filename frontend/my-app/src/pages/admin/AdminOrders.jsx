import { useCallback, useEffect, useMemo, useState } from 'react';
import { adminAPI } from '../../services/api';

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

const statusOptionsByCurrent = {
  pending: [
    { value: 'confirmed', label: 'Xác nhận' },
    { value: 'cancelled', label: 'Hủy đơn' },
  ],
  confirmed: [
    { value: 'shipping', label: 'Giao hàng' },
    { value: 'cancelled', label: 'Hủy đơn' },
  ],
  shipping: [{ value: 'completed', label: 'Hoàn thành' }],
  completed: [],
  cancelled: [],
};

const formatCurrency = (value) => `${Number(value || 0).toLocaleString('vi-VN')}đ`;
const formatDate = (value) => (value ? new Date(value).toLocaleDateString('vi-VN') : '');
const normalizeStatus = (value) => String(value || '').toLowerCase();

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState('');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminAPI.getOrders();
      setOrders(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setError(err?.message || 'Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const summary = useMemo(() => ({
    total: orders.length,
    pending: orders.filter((order) => normalizeStatus(order.status) === 'pending').length,
    shipping: orders.filter((order) => normalizeStatus(order.status) === 'shipping').length,
    completed: orders.filter((order) => normalizeStatus(order.status) === 'completed').length,
  }), [orders]);

  const handleChangeStatus = async (id, status) => {
    if (!status) return;

    setUpdatingId(id);
    try {
      const res = await adminAPI.updateOrderStatus(id, { status });
      const updatedOrder = res?.data;
      setOrders((prev) => prev.map((order) => (order.id === id ? updatedOrder || order : order)));
    } catch (err) {
      console.error(err);
      alert(err?.message || 'Không thể cập nhật trạng thái');
    } finally {
      setUpdatingId('');
    }
  };

  if (loading) {
    return <div className="text-gray-500">Đang tải đơn hàng...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-red-600">Quản lý đơn hàng</h1>
        <p className="text-gray-500">Cập nhật trạng thái đơn hàng theo đúng luồng xử lý.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <SummaryCard label="Tổng đơn" value={summary.total} />
        <SummaryCard label="Chờ xử lý" value={summary.pending} />
        <SummaryCard label="Đang giao" value={summary.shipping} />
        <SummaryCard label="Hoàn thành" value={summary.completed} />
      </div>

      {error ? (
        <div className="rounded border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
      ) : (
        <div className="overflow-hidden rounded border border-red-100 bg-white shadow">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left">
              <thead className="bg-red-500 text-white">
                <tr>
                  <th className="p-4">Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Ngày đặt</th>
                  <th>Tổng tiền</th>
                  <th>Thanh toán</th>
                  <th>Trạng thái</th>
                  <th>Cập nhật</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => {
                  const id = order.id || order._id;
                  const currentStatus = normalizeStatus(order.status);
                  const paymentStatus = normalizeStatus(order.paymentStatus);
                  const availableOptions = (statusOptionsByCurrent[currentStatus] || [])
                    .filter((option) => !(option.value === 'cancelled' && paymentStatus === 'paid'));

                  return (
                    <tr key={id} className="border-t hover:bg-red-50">
                      <td className="p-4 font-medium text-gray-800">{order.code || id}</td>

                      <td className="text-gray-700">
                        <p>{order.customer?.name || order.customerName || 'Khách hàng'}</p>
                        {(order.customer?.email || order.customerEmail) && (
                          <p className="text-xs text-gray-500">
                            {order.customer?.email || order.customerEmail}
                          </p>
                        )}
                      </td>

                      <td className="text-gray-600">{formatDate(order.createdAt)}</td>

                      <td className="font-semibold text-red-600">{formatCurrency(order.total)}</td>

                      <td>
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                          {PAYMENT_STATUS_LABELS[paymentStatus] || order.paymentStatus}
                        </span>
                      </td>

                      <td>
                        <span className="rounded-full bg-red-100 px-3 py-1 text-sm text-red-700">
                          {ORDER_STATUS_LABELS[currentStatus] || order.status}
                        </span>
                      </td>

                      <td>
                        <select
                          value=""
                          onChange={(event) => handleChangeStatus(id, event.target.value)}
                          disabled={updatingId === id || availableOptions.length === 0}
                          className="rounded border border-red-300 px-3 py-2 disabled:cursor-not-allowed disabled:bg-gray-100"
                        >
                          <option value="" disabled>
                            {availableOptions.length ? 'Chọn trạng thái' : 'Không thể chuyển tiếp'}
                          </option>
                          {availableOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {orders.length === 0 && (
            <div className="p-6 text-center text-gray-400">Không có đơn hàng</div>
          )}
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="rounded border bg-white p-4 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-red-600">{value}</p>
    </div>
  );
}
