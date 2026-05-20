import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, UserPlus } from "lucide-react";
import { adminAPI } from "../../services/api";

const formatCurrency = (value) =>
  `${Number(value || 0).toLocaleString("vi-VN")}đ`;

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("vi-VN") : "Chưa có";

const getCustomerLevel = (totalSpent) =>
  Number(totalSpent || 0) >= 10000000 ? "VIP" : "Thường";

const getInitial = (name, email) =>
  String(name || email || "K").trim().charAt(0).toUpperCase();

const getResponseData = (res) => res?.data?.data || res?.data || res || [];
const normalizeStatus = (value) => String(value || "").toLowerCase();
const isRevenueOrder = (order) => {
  const orderStatus = normalizeStatus(order.status);
  const paymentStatus = normalizeStatus(order.paymentStatus);
  return paymentStatus === "paid" || ["completed", "delivered"].includes(orderStatus);
};

const getCustomerKeys = (customer) =>
  [customer.id, customer._id, customer.email, customer.name]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase());

const getOrderCustomerKeys = (order) =>
  [
    order.customer?.id,
    order.customer?.email,
    order.customer?.name,
    order.customerEmail,
    order.customerName,
    order.user?.id,
    order.user?.email,
    order.user?.name,
  ]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase());

const buildCustomerSpendingMap = (orders) => {
  const totals = new Map();

  orders.filter(isRevenueOrder).forEach((order) => {
    const amount = Number(order.total || order.totalAmount || 0);

    getOrderCustomerKeys(order).forEach((key) => {
      totals.set(key, (totals.get(key) || 0) + amount);
    });
  });

  return totals;
};

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [customersRes, ordersRes] = await Promise.all([
        adminAPI.getCustomers(),
        adminAPI.getOrders(),
      ]);
      const data = getResponseData(customersRes);
      const orders = getResponseData(ordersRes);
      const spendingByCustomer = buildCustomerSpendingMap(Array.isArray(orders) ? orders : []);

      setCustomers(
        Array.isArray(data)
          ? data.map((customer) => {
              const computedTotal = getCustomerKeys(customer).reduce(
                (total, key) => Math.max(total, spendingByCustomer.get(key) || 0),
                0
              );

              return {
                ...customer,
                totalSpent: Math.max(Number(customer.totalSpent || 0), computedTotal),
              };
            })
          : []
      );
    } catch (err) {
      console.error(err);
      setError(err?.message || "Không thể tải danh sách khách hàng");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const filteredCustomers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return customers;

    return customers.filter((customer) =>
      [customer.name, customer.email, customer.latestOrderCode]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))
    );
  }, [customers, search]);

  if (loading) {
    return <div className="text-neutral-500">Đang tải khách hàng...</div>;
  }

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-neutral-200 bg-neutral-100 p-4 md:flex-row md:items-center">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm kiếm khách hàng..."
              className="w-full rounded-lg border border-neutral-300 bg-white py-2 pl-10 pr-4 text-sm text-neutral-950 focus:border-neutral-950 focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={fetchCustomers}
            className="flex w-fit items-center gap-2 rounded-lg bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
          >
            <UserPlus className="h-4 w-4" />
            Làm mới
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left">
            <thead className="bg-neutral-950">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold uppercase text-white">
                  Khách hàng
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase text-white">
                  Liên hệ
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase text-white">
                  Đơn hàng
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase text-white">
                  Tổng chi tiêu
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase text-white">
                  Cấp độ
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase text-white">
                  Gần nhất
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-neutral-100">
              {filteredCustomers.map((customer) => {
                const level = getCustomerLevel(customer.totalSpent);

                return (
                  <tr
                    key={customer.id || customer._id || customer.email}
                    className="transition hover:bg-neutral-50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-950 font-semibold text-white">
                          {getInitial(customer.name, customer.email)}
                        </div>
                        <div>
                          <p className="font-medium text-neutral-950">
                            {customer.name || "Khách hàng"}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {customer.latestOrderCode || "Chưa có mã đơn"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm">
                      <p className="text-neutral-800">{customer.email}</p>
                      <p className="text-neutral-500">
                        {customer.phone || "Chưa cập nhật SĐT"}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-sm text-neutral-700">
                      {customer.orderCount || 0} đơn
                    </td>

                    <td className="px-6 py-4 text-sm font-semibold text-neutral-950">
                      {formatCurrency(customer.totalSpent)}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                          level === "VIP"
                            ? "bg-neutral-950 text-white"
                            : "bg-neutral-100 text-neutral-700"
                        }`}
                      >
                        {level}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {formatDate(customer.lastOrderAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredCustomers.length === 0 ? (
          <div className="p-6 text-center text-neutral-400">
            Không có khách hàng phù hợp
          </div>
        ) : null}
      </div>
    </div>
  );
}
