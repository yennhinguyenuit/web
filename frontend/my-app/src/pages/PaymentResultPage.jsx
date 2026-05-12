import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { paymentAPI } from '../services/api';

const PAYMENT_STATUS_LABELS = {
  unpaid: 'Chưa thanh toán',
  pending: 'Đang chờ thanh toán',
  paid: 'Đã thanh toán',
  failed: 'Thanh toán thất bại',
  expired: 'Đã hết hạn',
  refunded: 'Đã hoàn tiền',
  cancelled: 'Đã hủy',
};

const normalizeStatus = (value) => String(value || '').toLowerCase();

export default function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    let intervalId = null;

    const loadStatus = async () => {
      if (!orderId) {
        setError('Không tìm thấy đơn hàng cần kiểm tra.');
        return;
      }

      try {
        const res = await paymentAPI.getPaymentStatus(orderId);
        if (ignore) return;

        setStatus(res.data);
        setError('');

        if (normalizeStatus(res?.data?.paymentStatus) === 'paid' && intervalId) {
          clearInterval(intervalId);
        }
      } catch (err) {
        if (ignore) return;
        setError(err.message || 'Không thể lấy trạng thái thanh toán');
      }
    };

    loadStatus();

    if (orderId) {
      intervalId = setInterval(loadStatus, 5000);
    }

    return () => {
      ignore = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, [orderId]);

  const checkoutUrl = status?.payment?.checkout?.url;
  const paymentStatus = normalizeStatus(status?.paymentStatus);
  const isPaid = paymentStatus === 'paid';

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-10">
      <h1 className="text-3xl font-bold">Kết quả thanh toán</h1>
      {error ? <p className="text-red-600">{error}</p> : null}

      {status ? (
        <div className="space-y-2 bg-white p-6 shadow">
          <p><strong>Mã đơn:</strong> {status.orderCode}</p>
          <p><strong>Trạng thái:</strong> {PAYMENT_STATUS_LABELS[paymentStatus] || status.paymentStatus}</p>
          <p><strong>Phương thức:</strong> {status.paymentMethod?.name}</p>
        </div>
      ) : (
        !error ? <p>Đang kiểm tra trạng thái...</p> : null
      )}

      {status ? (
        <div className="flex flex-wrap gap-3">
          {checkoutUrl && !isPaid ? (
            <a href={checkoutUrl} className="rounded bg-red-600 px-4 py-2 text-white">
              Mở lại trang PayOS
            </a>
          ) : null}
          {orderId ? (
            <Link className="rounded border px-4 py-2" to={`/orders/${orderId}`}>
              Xem chi tiết đơn hàng
            </Link>
          ) : null}
          <Link className="rounded border px-4 py-2" to="/shop">Tiếp tục mua sắm</Link>
        </div>
      ) : null}
    </div>
  );
}
