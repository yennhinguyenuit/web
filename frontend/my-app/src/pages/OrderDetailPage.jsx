import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import OrderTimeline from '../components/OrderTimeline';
import { orderAPI, paymentAPI } from '../services/api';

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

const formatCurrency = (value) => `${Number(value || 0).toLocaleString('vi-VN')}đ`;
const formatDateTime = (value) => (value ? new Date(value).toLocaleString('vi-VN') : '');
const normalizeStatus = (value) => String(value || '').toLowerCase();

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const orderStatus = normalizeStatus(order?.status);
  const paymentStatus = normalizeStatus(order?.paymentStatus);
  const paymentCode = useMemo(
    () => normalizeStatus(order?.paymentMethod?.code),
    [order?.paymentMethod?.code]
  );

  const isPayOS = paymentCode === 'payos';
  const isBankTransfer = paymentCode === 'bank_transfer';
  const isOnlinePayment = Boolean(order?.paymentMethod?.isOnline);
  const canCancel = orderStatus === 'pending' && paymentStatus !== 'paid';
  const canCreatePayment = (
    order &&
    isOnlinePayment &&
    paymentStatus !== 'paid' &&
    !['cancelled', 'completed'].includes(orderStatus)
  );

  useEffect(() => {
    let ignore = false;

    const fetchOrder = async () => {
      setLoading(true);
      try {
        const res = await orderAPI.getOrderById(id);
        if (ignore) return;
        setOrder(res.data);
        setPayment(res?.data?.payment || null);
      } catch (err) {
        console.error(err);
        if (!ignore) alert(err?.message || 'Không thể tải đơn hàng');
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchOrder();

    return () => {
      ignore = true;
    };
  }, [id]);

  useEffect(() => {
    if (!canCreatePayment) return undefined;

    let ignore = false;
    let intervalId = null;

    const pollStatus = async () => {
      try {
        const statusRes = await paymentAPI.getPaymentStatus(order.id);
        if (ignore) return;

        setPayment(statusRes?.data?.payment || null);

        const nextStatus = normalizeStatus(statusRes?.data?.paymentStatus);
        if (nextStatus && nextStatus !== paymentStatus) {
          setOrder((prev) => (prev ? { ...prev, paymentStatus: nextStatus } : prev));
        }

        if (nextStatus === 'paid' && intervalId) {
          clearInterval(intervalId);
        }
      } catch {
        // Polling can fail intermittently while the bank/provider is slow.
      }
    };

    const loadOrCreateIntent = async () => {
      setPaymentLoading(true);
      try {
        const intentRes = await paymentAPI.createPaymentIntent(order.id);
        if (!ignore) setPayment(intentRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        if (!ignore) setPaymentLoading(false);
      }
    };

    loadOrCreateIntent().then(pollStatus);
    intervalId = setInterval(pollStatus, 5000);

    return () => {
      ignore = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, [canCreatePayment, order?.id, paymentStatus]);

  const refreshPaymentStatus = async () => {
    try {
      const res = await paymentAPI.getPaymentStatus(order.id);
      setPayment(res?.data?.payment || null);
      const nextStatus = normalizeStatus(res?.data?.paymentStatus);
      if (nextStatus) {
        setOrder((prev) => (prev ? { ...prev, paymentStatus: nextStatus } : prev));
      }
    } catch (err) {
      console.error(err);
      alert(err?.message || 'Không thể kiểm tra trạng thái thanh toán');
    }
  };

  const handleCancel = async () => {
    if (!canCancel) return;
    if (!window.confirm('Bạn chắc chắn muốn hủy đơn hàng này?')) return;

    setCancelling(true);
    try {
      const res = await orderAPI.cancelOrder(id);
      setOrder(res.data);
      setPayment(res?.data?.payment || null);
      alert('Đã hủy đơn hàng');
    } catch (err) {
      console.error(err);
      alert(err?.message || 'Không thể hủy đơn hàng');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <p className="p-10">Đang tải...</p>;

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <p className="text-gray-600">Không tìm thấy đơn hàng.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4">
      <div className="bg-white p-4 shadow">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="font-semibold text-red-600">Đơn hàng #{order.code}</p>
            <p className="text-sm text-gray-500">Ngày đặt: {formatDateTime(order.createdAt)}</p>
          </div>
          <StatusBadge status={orderStatus} labels={ORDER_STATUS_LABELS} />
        </div>
        {orderStatus === 'cancelled' ? (
          <p className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            Đơn hàng đã được hủy.
          </p>
        ) : (
          <OrderTimeline status={order.status} />
        )}
      </div>

      {isOnlinePayment && (
        <div className="bg-white p-4 shadow">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold text-red-600">Thanh toán {order.paymentMethod?.name}</p>
            <StatusBadge status={paymentStatus} labels={PAYMENT_STATUS_LABELS} />
          </div>

          {paymentStatus === 'paid' ? (
            <div className="rounded border border-green-200 bg-green-50 p-3 text-green-700">
              Đơn hàng đã được thanh toán.
            </div>
          ) : orderStatus === 'cancelled' ? (
            <div className="rounded border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
              Thanh toán đã dừng vì đơn hàng đã hủy.
            </div>
          ) : paymentLoading ? (
            <p className="text-sm text-gray-500">Đang tạo thông tin thanh toán...</p>
          ) : payment ? (
            <PaymentAction
              payment={payment}
              isBankTransfer={isBankTransfer}
              isPayOS={isPayOS}
              onRefresh={refreshPaymentStatus}
            />
          ) : (
            <p className="text-sm text-red-600">Chưa tạo được thông tin thanh toán. Vui lòng thử lại.</p>
          )}
        </div>
      )}

      <div className="bg-white p-4 shadow">
        <p className="mb-2 font-semibold">Thông tin vận chuyển</p>
        <p>{order.shippingMethod?.name || 'Chưa có phương thức vận chuyển'}</p>
        {order.shippingMethod?.estimatedDays && (
          <p className="text-sm text-gray-500">Dự kiến: {order.shippingMethod.estimatedDays} ngày</p>
        )}
        {order.trackingNumber && (
          <p className="text-sm text-gray-500">Mã vận đơn: {order.trackingNumber}</p>
        )}
      </div>

      <div className="bg-white p-4 shadow">
        <p className="mb-2 font-semibold">Địa chỉ nhận hàng</p>
        <p>{order.address?.name}</p>
        <p>{order.address?.phone}</p>
        <p>
          {[
            order.address?.address,
            order.address?.ward,
            order.address?.district,
            order.address?.city,
          ]
            .filter(Boolean)
            .join(', ')}
        </p>
      </div>

      <div className="bg-white p-4 shadow">
        <p className="mb-3 font-semibold">Sản phẩm</p>

        {order.items?.map((item) => (
          <div key={item.id} className="flex items-center justify-between border-b py-3">
            <div className="flex items-center gap-3">
              <img
                src={item.product?.image || item.productImage || '/no-image.png'}
                alt={item.product?.name || item.productName || 'Sản phẩm'}
                className="h-16 w-16 rounded object-cover"
              />

              <div>
                <p className="font-medium">{item.product?.name || item.productName || 'Sản phẩm'}</p>
                {(item.color || item.size) && (
                  <p className="text-sm text-gray-500">
                    {[item.color && `Màu: ${item.color}`, item.size && `Size: ${item.size}`]
                      .filter(Boolean)
                      .join(' / ')}
                  </p>
                )}
                <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
              </div>
            </div>

            <div className="text-right">
              <p className="font-medium">{formatCurrency(item.price || item.unitPrice)}</p>
              <p className="text-sm text-gray-500">{formatCurrency(item.subTotal)}</p>
            </div>
          </div>
        ))}

        <div className="mt-4 space-y-1 text-sm">
          <SummaryRow label="Tạm tính" value={order.subtotal} />
          <SummaryRow label="Phí vận chuyển" value={order.shippingFee} />
          <SummaryRow label="Giảm giá" value={-Number(order.discount || 0)} />
          <div className="flex justify-between pt-2 text-base font-bold text-red-600">
            <span>Thành tiền:</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {canCancel && (
          <button
            type="button"
            onClick={handleCancel}
            disabled={cancelling}
            className="rounded border px-4 py-2 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:text-gray-400"
          >
            {cancelling ? 'Đang hủy...' : 'Hủy đơn hàng'}
          </button>
        )}

        <Link className="rounded border px-4 py-2 hover:bg-gray-100" to="/contact">
          Liên hệ Shop
        </Link>
      </div>
    </div>
  );
}

function PaymentAction({ payment, isBankTransfer, isPayOS, onRefresh }) {
  if (isBankTransfer && payment?.qr) {
    return (
      <div className="space-y-3">
        {payment.qr?.imageUrl && (
          <div className="flex flex-col items-center">
            <img
              alt="Bank Transfer QR"
              className="h-64 w-64 rounded border-2 border-red-200"
              src={payment.qr.imageUrl}
            />
            {payment.qr?.expiresAt && (
              <p className="mt-2 text-xs text-gray-500">
                HSD: {formatDateTime(payment.qr.expiresAt)}
              </p>
            )}
          </div>
        )}

        <div className="rounded border border-blue-200 bg-blue-50 p-3 text-sm">
          <p className="font-semibold text-blue-900">Thông tin chuyển khoản:</p>
          {payment.bankAccount?.accountName && (
            <p><strong>Tên tài khoản:</strong> {payment.bankAccount.accountName}</p>
          )}
          {payment.bankAccount?.accountNo && (
            <p><strong>Số tài khoản:</strong> {payment.bankAccount.accountNo}</p>
          )}
          {payment.bankAccount?.transferContent && (
            <p><strong>Nội dung:</strong> {payment.bankAccount.transferContent}</p>
          )}
          <p><strong>Số tiền:</strong> {formatCurrency(payment.amount)}</p>
        </div>

        <RefreshButton onRefresh={onRefresh} />
      </div>
    );
  }

  if (isPayOS && payment?.checkout?.url) {
    const checkoutUrl = payment.checkout.url || '';
    const qrCode = payment.checkout.qrCode || '';
    const qrData = qrCode || checkoutUrl;
    const qrLooksLikeImageUrl = (
      typeof qrCode === 'string' &&
      (qrCode.startsWith('http://') || qrCode.startsWith('https://') || qrCode.startsWith('data:image/'))
    );
    const imgSrc = qrLooksLikeImageUrl
      ? qrCode
      : `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(String(qrData))}`;

    return (
      <div className="space-y-3">
        {qrData && (
          <div className="flex justify-center">
            <img alt="PayOS QR" className="h-56 w-56 rounded border-2 border-red-200" src={imgSrc} />
          </div>
        )}

        <a
          href={checkoutUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-block w-full rounded bg-red-600 px-4 py-2 text-center font-semibold text-white hover:bg-red-700"
        >
          Mở trang thanh toán PayOS
        </a>

        <RefreshButton onRefresh={onRefresh} />
      </div>
    );
  }

  return <p className="text-sm text-red-600">Không tạo được thông tin thanh toán.</p>;
}

function RefreshButton({ onRefresh }) {
  return (
    <button
      type="button"
      onClick={onRefresh}
      className="w-full rounded border border-gray-300 px-4 py-2 text-center hover:bg-gray-50"
    >
      Kiểm tra trạng thái
    </button>
  );
}

function StatusBadge({ status, labels }) {
  return (
    <span className="rounded-full bg-red-100 px-3 py-1 text-sm text-red-700">
      {labels[status] || status || 'Không rõ'}
    </span>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span>{formatCurrency(value)}</span>
    </div>
  );
}
