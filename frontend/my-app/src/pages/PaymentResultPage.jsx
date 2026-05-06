import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { paymentAPI } from '../services/api';

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
        setError('Khong tim thay don hang can kiem tra.');
        return;
      }

      try {
        const res = await paymentAPI.getPaymentStatus(orderId);
        if (ignore) return;

        setStatus(res.data);
        setError('');

        if (res?.data?.paymentStatus === 'paid' && intervalId) {
          clearInterval(intervalId);
        }
      } catch (err) {
        if (ignore) return;
        setError(err.message || 'Khong the lay trang thai thanh toan');
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
  const isPaid = status?.paymentStatus === 'paid';

  return (
    <div className="max-w-2xl mx-auto p-10 space-y-4">
      <h1 className="text-3xl font-bold">Ket qua thanh toan</h1>
      {error ? <p className="text-red-600">{error}</p> : null}
      {status ? (
        <div className="bg-white rounded shadow p-6 space-y-2">
          <p><strong>Ma don:</strong> {status.orderCode}</p>
          <p><strong>Trang thai:</strong> {isPaid ? 'Da thanh toan' : 'Cho thanh toan'}</p>
          <p><strong>Phuong thuc:</strong> {status.paymentMethod?.name}</p>
        </div>
      ) : (
        !error ? <p>Dang kiem tra trang thai...</p> : null
      )}

      {status ? (
        <div className="flex flex-wrap gap-3">
          {checkoutUrl && !isPaid ? (
            <a href={checkoutUrl} className="px-4 py-2 bg-red-600 text-white rounded">
              Mo lai trang PayOS
            </a>
          ) : null}
          {orderId ? <Link className="px-4 py-2 border rounded" to={`/orders/${orderId}`}>Xem chi tiet don hang</Link> : null}
          <Link className="px-4 py-2 border rounded" to="/shop">Tiep tuc mua sam</Link>
        </div>
      ) : null}
    </div>
  );
}
