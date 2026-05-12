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
const fallbackProductImage = 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=300&q=80';

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const orderStatus = normalizeStatus(order?.status);
  const paymentStatus = normalizeStatus(order?.paymentStatus);
  const paymentCode = useMemo(() => normalizeStatus(order?.paymentMethod?.code), [order?.paymentMethod?.code]);

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

        if (nextStatus === 'paid' && intervalId) clearInterval(intervalId);
      } catch {
        // Provider polling can fail intermittently while the transaction is settling.
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

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 px-4 py-10">
        <div className="mx-auto max-w-6xl space-y-4">
          <div className="h-36 animate-pulse rounded-lg bg-white" />
          <div className="h-64 animate-pulse rounded-lg bg-white" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl p-8">
        <p className="text-zinc-600">Không tìm thấy đơn hàng.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <Link to="/orders" className="text-sm font-semibold text-zinc-600 hover:text-black">← Quay lại danh sách đơn</Link>
          <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-zinc-500">Chi tiết đơn hàng</p>
              <h1 className="mt-2 text-4xl font-black tracking-tight text-zinc-950">#{order.code}</h1>
              <p className="mt-2 text-zinc-500">Ngày đặt: {formatDateTime(order.createdAt)}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={orderStatus} labels={ORDER_STATUS_LABELS} />
              <StatusBadge status={paymentStatus} labels={PAYMENT_STATUS_LABELS} />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
        <div className="space-y-6">
          <Card title="Tiến trình đơn hàng">
            {orderStatus === 'cancelled' ? (
              <Notice>Đơn hàng đã được hủy.</Notice>
            ) : (
              <OrderTimeline status={order.status} />
            )}
          </Card>

          {isOnlinePayment && (
            <Card title={`Thanh toán ${order.paymentMethod?.name || ''}`} action={<StatusBadge status={paymentStatus} labels={PAYMENT_STATUS_LABELS} />}>
              {paymentStatus === 'paid' ? (
                <Notice>Đơn hàng đã được thanh toán.</Notice>
              ) : orderStatus === 'cancelled' ? (
                <Notice>Thanh toán đã dừng vì đơn hàng đã hủy.</Notice>
              ) : paymentLoading ? (
                <p className="animate-pulse text-sm text-zinc-500">Đang tạo thông tin thanh toán...</p>
              ) : payment ? (
                <PaymentAction payment={payment} isBankTransfer={isBankTransfer} isPayOS={isPayOS} onRefresh={refreshPaymentStatus} />
              ) : (
                <Notice>Chưa tạo được thông tin thanh toán. Vui lòng thử lại.</Notice>
              )}
            </Card>
          )}

          <Card title="Sản phẩm">
            <div className="divide-y divide-zinc-200">
              {order.items?.map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="flex min-w-0 gap-4">
                    <img
                      src={item.product?.image || item.productImage || fallbackProductImage}
                      onError={(event) => {
                        event.currentTarget.src = fallbackProductImage;
                      }}
                      alt={item.product?.name || item.productName || 'Sản phẩm'}
                      className="h-20 w-20 rounded-md border border-zinc-200 object-cover"
                    />

                    <div className="min-w-0">
                      <p className="font-bold text-zinc-950">{item.product?.name || item.productName || 'Sản phẩm'}</p>
                      {(item.color || item.size) && (
                        <p className="mt-1 text-sm text-zinc-500">
                          {[item.color && `Màu: ${item.color}`, item.size && `Size: ${item.size}`]
                            .filter(Boolean)
                            .join(' / ')}
                        </p>
                      )}
                      <p className="mt-1 text-sm text-zinc-500">Số lượng: {item.quantity}</p>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="font-bold text-zinc-950">{formatCurrency(item.price || item.unitPrice)}</p>
                    <p className="mt-1 text-sm text-zinc-500">{formatCurrency(item.subTotal)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-32 lg:self-start">
          <Card title="Người nhận">
            <div className="space-y-2 text-sm text-zinc-600">
              <p className="font-bold text-zinc-950">{order.address?.name}</p>
              <p>{order.address?.phone}</p>
              <p>
                {[
                  order.address?.address,
                  order.address?.ward,
                  order.address?.district,
                  order.address?.city,
                ].filter(Boolean).join(', ')}
              </p>
            </div>
          </Card>

          <Card title="Vận chuyển">
            <div className="space-y-2 text-sm text-zinc-600">
              <p className="font-bold text-zinc-950">{order.shippingMethod?.name || 'Chưa có phương thức vận chuyển'}</p>
              {order.shippingMethod?.estimatedDays && <p>Dự kiến: {order.shippingMethod.estimatedDays} ngày</p>}
              {order.trackingNumber && <p>Mã vận đơn: {order.trackingNumber}</p>}
            </div>
          </Card>

          <Card title="Tổng kết">
            <div className="space-y-3 text-sm">
              <SummaryRow label="Tạm tính" value={order.subtotal} />
              <SummaryRow label="Phí vận chuyển" value={order.shippingFee} />
              <SummaryRow label="Giảm giá" value={-Number(order.discount || 0)} />
              <div className="flex justify-between border-t border-zinc-200 pt-4 text-lg font-black text-zinc-950">
                <span>Thành tiền</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </Card>

          <div className="grid gap-3">
            {canCancel && (
              <button
                type="button"
                onClick={handleCancel}
                disabled={cancelling}
                className="rounded-md border border-zinc-300 bg-white px-4 py-3 text-sm font-bold text-zinc-950 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:text-zinc-400"
              >
                {cancelling ? 'Đang hủy...' : 'Hủy đơn hàng'}
              </button>
            )}

            <Link className="rounded-md bg-zinc-950 px-4 py-3 text-center text-sm font-bold text-white hover:bg-zinc-800" to="/contact">
              Liên hệ Shop
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

function PaymentAction({ payment, isBankTransfer, isPayOS, onRefresh }) {
  if (isBankTransfer && payment?.qr) {
    return (
      <div className="space-y-4">
        {payment.qr?.imageUrl && (
          <div className="flex flex-col items-center rounded-lg border border-zinc-200 bg-zinc-50 p-5">
            <img alt="Bank Transfer QR" className="h-64 w-64 rounded-md border border-zinc-300 bg-white" src={payment.qr.imageUrl} />
            {payment.qr?.expiresAt && <p className="mt-3 text-xs text-zinc-500">HSD: {formatDateTime(payment.qr.expiresAt)}</p>}
          </div>
        )}

        <PaymentInfo payment={payment} />
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
      <div className="space-y-4">
        {qrData && (
          <div className="flex justify-center rounded-lg border border-zinc-200 bg-zinc-50 p-5">
            <img alt="PayOS QR" className="h-56 w-56 rounded-md border border-zinc-300 bg-white" src={imgSrc} />
          </div>
        )}

        <a href={checkoutUrl} target="_blank" rel="noreferrer" className="block rounded-md bg-zinc-950 px-4 py-3 text-center text-sm font-black uppercase tracking-wide text-white hover:bg-zinc-800">
          Mở trang thanh toán PayOS
        </a>

        <RefreshButton onRefresh={onRefresh} />
      </div>
    );
  }

  return <Notice>Không tạo được thông tin thanh toán.</Notice>;
}

function PaymentInfo({ payment }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
      <p className="font-black text-zinc-950">Thông tin chuyển khoản</p>
      {payment.bankAccount?.accountName && <p className="mt-2"><strong>Tên tài khoản:</strong> {payment.bankAccount.accountName}</p>}
      {payment.bankAccount?.accountNo && <p><strong>Số tài khoản:</strong> {payment.bankAccount.accountNo}</p>}
      {payment.bankAccount?.transferContent && <p><strong>Nội dung:</strong> {payment.bankAccount.transferContent}</p>}
      <p><strong>Số tiền:</strong> {formatCurrency(payment.amount)}</p>
    </div>
  );
}

function RefreshButton({ onRefresh }) {
  return (
    <button type="button" onClick={onRefresh} className="w-full rounded-md border border-zinc-300 px-4 py-3 text-center text-sm font-bold text-zinc-950 hover:bg-zinc-100">
      Kiểm tra trạng thái
    </button>
  );
}

function Card({ title, action, children }) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-black text-zinc-950">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Notice({ children }) {
  return <p className="rounded-md border border-zinc-300 bg-zinc-100 p-3 text-sm font-medium text-zinc-700">{children}</p>;
}

function StatusBadge({ status, labels }) {
  return (
    <span className="rounded-full border border-zinc-300 bg-zinc-100 px-3 py-1 text-sm font-bold text-zinc-700">
      {labels[status] || status || 'Không rõ'}
    </span>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex justify-between text-zinc-600">
      <span>{label}</span>
      <span className="font-bold text-zinc-950">{formatCurrency(value)}</span>
    </div>
  );
}
