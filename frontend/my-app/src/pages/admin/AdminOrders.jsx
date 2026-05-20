import { useCallback, useEffect, useMemo, useState } from 'react';
import { Eye, Search, X } from 'lucide-react';
import { adminAPI } from '../../services/api';

const ORDER_STATUS_OPTIONS = [
  { value: 'pending', label: 'Chờ xử lý' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'shipping', label: 'Đang giao' },
  { value: 'completed', label: 'Hoàn thành' },
  { value: 'cancelled', label: 'Đã hủy' },
];

const ORDER_STATUS_LABELS = {
  pending: 'Chờ xử lý',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao',
  completed: 'Hoàn thành',
  delivered: 'Đã giao',
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
    { value: 'confirmed', label: 'Đã xác nhận' },
    { value: 'cancelled', label: 'Đã hủy' },
  ],
  confirmed: [
    { value: 'shipping', label: 'Đang giao' },
    { value: 'cancelled', label: 'Đã hủy' },
  ],
  shipping: [{ value: 'completed', label: 'Hoàn thành' }],
  completed: [],
  delivered: [],
  cancelled: [],
};

const formatCurrency = (value) => `${Number(value || 0).toLocaleString('vi-VN')}đ`;
const formatDate = (value) => (value ? new Date(value).toLocaleDateString('vi-VN') : '');
const normalizeStatus = (value) => String(value || '').toLowerCase();
const getResponseData = (res) => res?.data || res || [];
const getOrderId = (order) => order.id || order._id;
const getOrderCode = (order) => order.code || getOrderId(order);
const getCustomerName = (order) =>
  order.customer?.name || order.customerName || order.shippingAddress?.name || 'Khách hàng';
const getCustomerContact = (order) =>
  order.customer?.email || order.customerEmail || order.shippingAddress?.phone || '';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const res = await adminAPI.getOrders();
      const data = getResponseData(res);
      setOrders(Array.isArray(data) ? data : []);
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

  const filteredOrders = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return orders;

    return orders.filter((order) => {
      const orderStatus = normalizeStatus(order.status);
      const paymentStatus = normalizeStatus(order.paymentStatus);

      return [
        getOrderId(order),
        getOrderCode(order),
        getCustomerName(order),
        getCustomerContact(order),
        ORDER_STATUS_LABELS[orderStatus],
        PAYMENT_STATUS_LABELS[paymentStatus],
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword));
    });
  }, [orders, search]);

  const handleChangeStatus = async (id, currentStatus, nextStatus) => {
    if (!nextStatus || nextStatus === currentStatus) return;

    setUpdatingId(id);

    try {
      const res = await adminAPI.updateOrderStatus(id, { status: nextStatus });
      const updatedOrder = res?.data;

      setOrders((prev) =>
        prev.map((order) =>
          getOrderId(order) === id
            ? updatedOrder || { ...order, status: nextStatus }
            : order
        )
      );
    } catch (err) {
      console.error(err);
      alert(err?.message || 'Không thể cập nhật trạng thái');
    } finally {
      setUpdatingId('');
    }
  };

  if (loading) {
    return <div className="text-neutral-500">Đang tải đơn hàng...</div>;
  }

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
        <div className="border-b border-neutral-200 bg-neutral-100 p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm kiếm đơn hàng..."
              className="w-full rounded-lg border border-neutral-300 bg-white py-2 pl-10 pr-4 text-sm text-neutral-950 focus:border-neutral-950 focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left">
            <thead className="bg-neutral-950">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold uppercase text-white">Mã đơn</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase text-white">Ngày đặt</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase text-white">Khách hàng</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase text-white">Tổng tiền</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase text-white">Trạng thái</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase text-white">Thao tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-neutral-100">
              {filteredOrders.map((order) => {
                const id = getOrderId(order);
                const currentStatus = normalizeStatus(order.status);
                const paymentStatus = normalizeStatus(order.paymentStatus);
                const availableOptions = (statusOptionsByCurrent[currentStatus] || [])
                  .filter((option) => !(option.value === 'cancelled' && paymentStatus === 'paid'));

                return (
                  <tr key={id} className="transition hover:bg-neutral-50">
                    <td className="px-6 py-4 text-sm font-medium text-neutral-950">
                      {getOrderCode(order)}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-700">
                      <p className="font-medium text-neutral-950">{getCustomerName(order)}</p>
                      {getCustomerContact(order) ? (
                        <p className="text-xs text-neutral-500">{getCustomerContact(order)}</p>
                      ) : null}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-neutral-950">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={currentStatus}
                        onChange={(event) =>
                          handleChangeStatus(id, currentStatus, event.target.value)
                        }
                        disabled={updatingId === id || availableOptions.length === 0}
                        className="w-[150px] rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-800 focus:border-neutral-950 focus:outline-none disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-500"
                      >
                        {!ORDER_STATUS_OPTIONS.some((option) => option.value === currentStatus) ? (
                          <option value={currentStatus}>
                            {ORDER_STATUS_LABELS[currentStatus] || order.status}
                          </option>
                        ) : null}
                        {ORDER_STATUS_OPTIONS.map((option) => {
                          const canSelect =
                            option.value === currentStatus ||
                            availableOptions.some((item) => item.value === option.value);

                          return (
                            <option key={option.value} value={option.value} disabled={!canSelect}>
                              {option.label}
                            </option>
                          );
                        })}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        aria-label="Xem chi tiết đơn hàng"
                        title="Xem chi tiết"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-700 transition hover:border-neutral-950 hover:bg-neutral-950 hover:text-white"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="p-6 text-center text-neutral-400">Không có đơn hàng phù hợp</div>
        ) : null}
      </div>

      {selectedOrder ? (
        <OrderDetailDialog order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      ) : null}
    </div>
  );
}

function OrderDetailDialog({ order, onClose }) {
  const orderStatus = normalizeStatus(order.status);
  const paymentStatus = normalizeStatus(order.paymentStatus);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-neutral-950">Chi tiết đơn hàng</h2>
            <p className="text-sm text-neutral-500">{getOrderCode(order)}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-950"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <InfoRow label="Khách hàng" value={getCustomerName(order)} />
            <InfoRow label="Liên hệ" value={getCustomerContact(order) || 'Chưa cập nhật'} />
            <InfoRow label="Ngày đặt" value={formatDate(order.createdAt)} />
            <InfoRow label="Tổng tiền" value={formatCurrency(order.total)} strong />
            <InfoRow
              label="Trạng thái đơn"
              value={ORDER_STATUS_LABELS[orderStatus] || order.status || 'Không rõ'}
            />
            <InfoRow
              label="Thanh toán"
              value={PAYMENT_STATUS_LABELS[paymentStatus] || order.paymentStatus || 'Không rõ'}
            />
            <InfoRow label="Phương thức thanh toán" value={order.paymentMethod || 'Chưa cập nhật'} />
            <InfoRow label="Phương thức giao hàng" value={order.shippingMethod || 'Chưa cập nhật'} />
          </div>

          <div>
            <h3 className="mb-3 font-semibold text-neutral-950">Sản phẩm</h3>
            {order.items?.length ? (
              <div className="divide-y divide-neutral-100 rounded-lg border border-neutral-200">
                {order.items.map((item) => (
                  <div key={item.id || item.product?.id} className="flex gap-3 p-4">
                    <img
                      src={item.product?.image || 'https://via.placeholder.com/64'}
                      alt={item.product?.name || 'Sản phẩm'}
                      className="h-16 w-16 shrink-0 rounded-lg border border-neutral-200 object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-neutral-950">
                        {item.product?.name || 'Sản phẩm'}
                      </p>
                      <p className="text-sm text-neutral-500">
                        Số lượng: {item.quantity || 0}
                        {item.color ? ` · Màu: ${item.color}` : ''}
                        {item.size ? ` · Size: ${item.size}` : ''}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-neutral-950">
                      {formatCurrency(item.price)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-neutral-200 p-4 text-sm text-neutral-500">
                Chưa có thông tin sản phẩm
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, strong = false }) {
  return (
    <div>
      <p className="text-sm text-neutral-500">{label}</p>
      <p className={strong ? 'font-semibold text-neutral-950' : 'text-neutral-800'}>{value}</p>
    </div>
  );
}
