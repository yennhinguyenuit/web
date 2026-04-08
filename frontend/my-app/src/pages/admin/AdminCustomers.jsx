import { useEffect, useMemo, useState } from 'react';
import { adminAPI } from '../../services/api';

const formatCurrency = (value) => `${Number(value || 0).toLocaleString()}đ`;
const formatDateTime = (value) => {
  if (!value) return '---';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '---';
  return date.toLocaleString('vi-VN');
};

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminAPI
      .getCustomers()
      .then((res) => {
        setCustomers(res.data || []);
        setError('');
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || 'Không tải được khách hàng');
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredCustomers = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return customers;

    return customers.filter((customer) =>
      [customer.name, customer.email, customer.latestOrderCode]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(kw))
    );
  }, [customers, keyword]);

  if (loading) {
    return <div className="text-slate-600">Đang tải khách hàng...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white shadow-sm border border-slate-100 p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Khách hàng</h1>
          <p className="text-slate-500 mt-1">Theo dõi khách đã mua hàng, tổng đơn và giá trị đơn hàng</p>
        </div>

        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Tìm theo tên, email, mã đơn..."
          className="border border-slate-300 rounded-xl px-4 py-3 w-full lg:w-80"
        />
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredCustomers.map((customer) => (
          <div key={customer.id} className="rounded-2xl bg-white shadow-sm border border-slate-100 p-5 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xl font-bold shrink-0">
                {customer.name?.charAt(0)?.toUpperCase() || customer.email?.charAt(0)?.toUpperCase() || 'U'}
              </div>

              <div className="min-w-0">
                <p className="font-semibold text-slate-800 truncate">{customer.name || 'Chưa có tên'}</p>
                <p className="text-slate-500 text-sm break-all">{customer.email || '---'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-slate-500">Số đơn</p>
                <p className="mt-1 text-lg font-semibold text-slate-800">{customer.orderCount || 0}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-slate-500">Đã thanh toán</p>
                <p className="mt-1 text-lg font-semibold text-slate-800">{customer.paidOrderCount || 0}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 col-span-2">
                <p className="text-slate-500">Tổng chi tiêu</p>
                <p className="mt-1 text-lg font-semibold text-red-600">{formatCurrency(customer.totalSpent)}</p>
              </div>
            </div>

            <div className="space-y-1 text-sm text-slate-600">
              <p>
                <span className="font-medium text-slate-700">Đơn gần nhất:</span>{' '}
                {customer.latestOrderCode || '---'}
              </p>
              <p>
                <span className="font-medium text-slate-700">Lần mua gần nhất:</span>{' '}
                {formatDateTime(customer.lastOrderAt)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {!filteredCustomers.length ? (
        <div className="rounded-2xl bg-white shadow-sm border border-slate-100 p-6 text-slate-500">
          Chưa có khách hàng phù hợp.
        </div>
      ) : null}
    </div>
  );
}
