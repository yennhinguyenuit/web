import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { paymentAPI } from '../services/api';

export default function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStatus = async () => {
      if (!orderId) {
        setError('Không tìm thấy đơn hàng cần kiểm tra.');
        return;
      }

      try {
        const res = await paymentAPI.getPaymentStatus(orderId);
        setStatus(res.data);
      } catch (err) {
        setError(err.message || 'Không thể lấy trạng thái thanh toán');
      }
    };

    loadStatus();
  }, [orderId]);

  const checkoutUrl = status?.payment?.checkout?.url;
  const isPaid = status?.paymentStatus === 'paid';

  return (
    <div className="max-w-2xl mx-auto p-10 space-y-4">
      <h1 className="text-3xl font-bold">Kết quả thanh toán</h1>
      {error ? <p className="text-red-600">{error}</p> : null}
      {status ? (
        <div className="bg-white rounded shadow p-6 space-y-2">
          <p><strong>Mã đơn:</strong> {status.orderCode}</p>
          <p><strong>Trạng thái:</strong> {isPaid ? 'Đã thanh toán' : 'Chờ thanh toán'}</p>
          <p><strong>Phương thức:</strong> {status.paymentMethod?.name}</p>
        </div>
      ) : (
        !error ? <p>Đang kiểm tra trạng thái...</p> : null
      )}

      {status ? (
        <div className="flex flex-wrap gap-3">
          {checkoutUrl && !isPaid ? (
            <a href={checkoutUrl} className="px-4 py-2 bg-red-600 text-white rounded">
              Mở lại trang PayOS
            </a>
          ) : null}
          {orderId ? <Link className="px-4 py-2 border rounded" to={`/orders/${orderId}`}>Xem chi tiết đơn hàng</Link> : null}
          <Link className="px-4 py-2 border rounded" to="/shop">Tiếp tục mua sắm</Link>
        </div>
      ) : null}
    </div>
  );
}
