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
    if (orderId) intervalId = setInterval(loadStatus, 5000);

    return () => {
      ignore = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, [orderId]);

  const checkoutUrl = status?.payment?.checkout?.url;
  const paymentStatus = normalizeStatus(status?.paymentStatus);
  const isPaid = paymentStatus === 'paid';

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center shadow-sm">
          <div className={`mx-auto grid h-20 w-20 place-items-center rounded-full border text-3xl font-black ${
            isPaid ? 'border-zinc-950 bg-zinc-950 text-white' : 'border-zinc-300 bg-zinc-100 text-zinc-700'
          }`}>
            {isPaid ? '✓' : '…'}
          </div>

          <p className="mt-6 text-sm font-black uppercase tracking-[0.22em] text-zinc-500">Thanh toán</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-950">
            {isPaid ? 'Thanh toán thành công' : 'Đang kiểm tra thanh toán'}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-zinc-600">
            Hệ thống sẽ tự cập nhật trạng thái mỗi vài giây. Bạn có thể mở lại cổng thanh toán hoặc xem chi tiết đơn hàng.
          </p>

          {error ? (
            <div className="mt-6 rounded-md border border-zinc-300 bg-zinc-100 p-4 text-sm font-medium text-zinc-700">
              {error}
            </div>
          ) : null}

          {status ? (
            <div className="mt-6 grid gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-5 text-left sm:grid-cols-3">
              <Info label="Mã đơn" value={status.orderCode || 'Chưa có'} />
              <Info label="Trạng thái" value={PAYMENT_STATUS_LABELS[paymentStatus] || status.paymentStatus} />
              <Info label="Phương thức" value={status.paymentMethod?.name || 'Chưa có'} />
            </div>
          ) : (
            !error ? <p className="mt-6 animate-pulse text-sm text-zinc-500">Đang tải trạng thái...</p> : null
          )}

          {status ? (
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {checkoutUrl && !isPaid ? (
                <a href={checkoutUrl} className="rounded-md bg-zinc-950 px-5 py-3 text-sm font-bold text-white hover:bg-zinc-800">
                  Mở lại trang PayOS
                </a>
              ) : null}
              {orderId ? (
                <Link className="rounded-md border border-zinc-300 px-5 py-3 text-sm font-bold text-zinc-950 hover:bg-zinc-100" to={`/orders/${orderId}`}>
                  Xem chi tiết đơn hàng
                </Link>
              ) : null}
              <Link className="rounded-md border border-zinc-300 px-5 py-3 text-sm font-bold text-zinc-950 hover:bg-zinc-100" to="/shop">
                Tiếp tục mua sắm
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">{label}</p>
      <p className="mt-1 font-bold text-zinc-950">{value}</p>
    </div>
  );
}
