import { createElement, useCallback, useEffect, useMemo, useState } from "react";
import {
  DollarSign,
  Package,
  RefreshCw,
  ShoppingCart,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { adminAPI, statsAPI } from "../../services/api";

const WEEKDAY_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

const formatCurrency = (value) =>
  `${Number(value || 0).toLocaleString("vi-VN")}đ`;

const formatNumber = (value) => Number(value || 0).toLocaleString("vi-VN");

const formatChartCurrency = (value) => {
  const number = Number(value || 0);

  if (number >= 1000000000) {
    return `${(number / 1000000000).toLocaleString("vi-VN", {
      maximumFractionDigits: 1,
    })} tỷ`;
  }

  if (number >= 1000000) {
    return `${(number / 1000000).toLocaleString("vi-VN", {
      maximumFractionDigits: 1,
    })}tr`;
  }

  return formatNumber(number);
};

const getResponseData = (res, fallback) => res?.data || res || fallback;

const normalizeStatus = (status) => String(status || "").toLowerCase();

const statusMap = {
  pending: {
    label: "Chờ xử lý",
    className: "border-neutral-300 bg-neutral-100 text-neutral-900",
  },
  confirmed: {
    label: "Đã xác nhận",
    className: "border-neutral-300 bg-neutral-100 text-neutral-900",
  },
  paid: {
    label: "Đã thanh toán",
    className: "border-neutral-950 bg-neutral-950 text-white",
  },
  processing: {
    label: "Đang xử lý",
    className: "border-neutral-300 bg-neutral-100 text-neutral-900",
  },
  shipping: {
    label: "Đang vận chuyển",
    className: "border-yellow-200 bg-yellow-50 text-yellow-700",
  },
  delivered: {
    label: "Đã giao",
    className: "border-green-200 bg-green-50 text-green-700",
  },
  completed: {
    label: "Hoàn thành",
    className: "border-green-200 bg-green-50 text-green-700",
  },
  cancelled: {
    label: "Đã hủy",
    className: "border-red-200 bg-red-50 text-red-700",
  },
  canceled: {
    label: "Đã hủy",
    className: "border-red-200 bg-red-50 text-red-700",
  },
};

function StatusBadge({ status }) {
  const item = statusMap[normalizeStatus(status)] || {
    label: status || "Không rõ",
    className: "border-neutral-200 bg-neutral-100 text-neutral-700",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${item.className}`}
    >
      {item.label}
    </span>
  );
}

function StatCard({ title, value, Icon, color }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-6 text-center shadow-sm transition hover:border-neutral-950 hover:shadow-md">
      <div className="mb-4 flex justify-center">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${color}`}
        >
          {createElement(Icon, { className: "h-6 w-6" })}
        </div>
      </div>

      <p className="mb-1 text-sm text-neutral-500">{title}</p>
      <p className="text-2xl font-bold text-neutral-950">{value}</p>
    </div>
  );
}

const normalizeRevenueData = (items) =>
  (Array.isArray(items) ? items : [])
    .map((item, index) => {
      const rawMonth = item.month || item._id || item.id || index + 1;
      const month = String(rawMonth).startsWith("T")
        ? String(rawMonth)
        : `T${rawMonth}`;

      return {
        id: `rev-${rawMonth}`,
        month,
        order: Number(rawMonth) || index,
        revenue: Number(item.revenue || item.total || item.totalRevenue || 0),
      };
    })
    .sort((a, b) => a.order - b.order)
    .slice(-6)
    .map((item) => ({
      id: item.id,
      month: item.month,
      revenue: item.revenue,
    }));

const buildSevenDayOrderData = (orders) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, index) => {
    const dayStart = new Date(today);
    dayStart.setDate(today.getDate() - (6 - index));

    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayStart.getDate() + 1);

    const ordersInDay = orders.filter((order) => {
      if (!order.createdAt) return false;

      const orderDate = new Date(order.createdAt);
      return orderDate >= dayStart && orderDate < dayEnd;
    }).length;

    return {
      id: dayStart.toLocaleDateString("en-CA"),
      day: WEEKDAY_LABELS[dayStart.getDay()],
      orders: ordersInDay,
    };
  });
};

const getOrderProductCount = (order) => {
  if (Number.isFinite(Number(order.totalItems))) {
    return `${Number(order.totalItems)} sản phẩm`;
  }

  if (Number.isFinite(Number(order.itemCount))) {
    return `${Number(order.itemCount)} sản phẩm`;
  }

  if (Array.isArray(order.items) && order.items.length) {
    const totalItems = order.items.reduce(
      (sum, item) => sum + Number(item.quantity || 1),
      0
    );
    return `${totalItems} sản phẩm`;
  }

  if (Array.isArray(order.products) && order.products.length) {
    return `${order.products.length} sản phẩm`;
  }

  return "Chưa rõ";
};

const getProductSold = (product) =>
  Number(product.sold || product.totalSold || product.quantitySold || 0);

export default function AdminDashboard() {
  const [summary, setSummary] = useState({});
  const [dashboard, setDashboard] = useState({});
  const [revenue, setRevenue] = useState([]);
  const [orders, setOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [
        summaryRes,
        dashboardRes,
        revenueRes,
        ordersRes,
        topProductsRes,
      ] =
        await Promise.all([
          statsAPI.getSummary(),
          adminAPI.getDashboard(),
          statsAPI.getRevenue(),
          adminAPI.getOrders(),
          statsAPI.getTopProducts(),
        ]);

      const summaryData = getResponseData(summaryRes, {});
      const dashboardData = getResponseData(dashboardRes, {});
      const revenueData = getResponseData(revenueRes, []);
      const orderData = getResponseData(ordersRes, []);
      const productsData = getResponseData(topProductsRes, []);

      setSummary(summaryData);
      setDashboard(dashboardData);
      setRevenue(normalizeRevenueData(revenueData));
      setOrders(Array.isArray(orderData) ? orderData : []);
      setTopProducts(Array.isArray(productsData) ? productsData : []);
    } catch (err) {
      console.error("LOAD DASHBOARD ERROR:", err);
      setError(err?.message || "Không thể tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const latestOrders = useMemo(() => {
    const source = orders.length
      ? orders
      : dashboard.latestOrders || summary.latestOrders || [];

    return source.slice(0, 5);
  }, [dashboard.latestOrders, orders, summary.latestOrders]);

  const orderData = useMemo(() => buildSevenDayOrderData(orders), [orders]);

  const currentMonthRevenue = useMemo(() => {
    if (!orders.length) {
      return summary.totalRevenue || dashboard.totalRevenue || 0;
    }

    const now = new Date();

    return orders.reduce((total, order) => {
      if (!order.createdAt) return total;

      const orderDate = new Date(order.createdAt);
      const isCurrentMonth =
        orderDate.getMonth() === now.getMonth() &&
        orderDate.getFullYear() === now.getFullYear();
      const isPaidOrder =
        normalizeStatus(order.status) === "completed" ||
        normalizeStatus(order.paymentStatus) === "paid";

      if (!isCurrentMonth || !isPaidOrder) return total;

      return total + Number(order.total || order.totalAmount || 0);
    }, 0);
  }, [dashboard.totalRevenue, orders, summary.totalRevenue]);

  const maxTopProductSold = useMemo(
    () =>
      topProducts.reduce(
        (maxSold, product) => Math.max(maxSold, getProductSold(product)),
        0
      ),
    [topProducts]
  );

  const statCards = [
    {
      title: "Doanh thu tháng này",
      value: formatCurrency(currentMonthRevenue),
      Icon: DollarSign,
      color: "bg-neutral-950 text-white",
    },
    {
      title: "Đơn hàng",
      value: formatNumber(orders.length || summary.totalOrders || dashboard.totalOrders),
      Icon: ShoppingCart,
      color: "bg-neutral-950 text-white",
    },
    {
      title: "Khách hàng",
      value: formatNumber(summary.totalUsers || dashboard.totalUsers),
      Icon: Users,
      color: "bg-neutral-950 text-white",
    },
    {
      title: "Sản phẩm",
      value: formatNumber(dashboard.totalProducts || summary.totalProducts),
      Icon: Package,
      color: "bg-neutral-950 text-white",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-36 animate-pulse rounded-lg border border-neutral-200 bg-neutral-100"
            />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="h-[360px] animate-pulse rounded-lg border border-neutral-200 bg-neutral-100" />
          <div className="h-[360px] animate-pulse rounded-lg border border-neutral-200 bg-neutral-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <button
          onClick={loadData}
          className="flex w-fit items-center gap-2 rounded-lg border border-red-600 bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:border-red-700 hover:bg-red-700"
        >
          <RefreshCw className="h-4 w-4" />
          Làm mới
        </button>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-200 bg-neutral-100 px-6 py-4">
            <h2 className="text-lg font-semibold text-neutral-950">
              Doanh thu 6 tháng
            </h2>
          </div>

          {revenue.length ? (
            <div className="h-[360px] p-6 pb-10">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenue} margin={{ top: 8, right: 16, left: 8, bottom: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis
                    dataKey="month"
                    stroke="#737373"
                    tickLine={false}
                    tickMargin={12}
                    height={42}
                  />
                  <YAxis
                    stroke="#737373"
                    tickFormatter={formatChartCurrency}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value) => [formatCurrency(value), "Doanh thu"]}
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderColor: "#d4d4d4",
                      borderRadius: 8,
                      color: "#111827",
                    }}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="#050505"
                    barSize={22}
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-[360px] items-center justify-center text-sm text-neutral-500">
              Không có dữ liệu doanh thu
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-200 bg-neutral-100 px-6 py-4">
            <h2 className="text-lg font-semibold text-neutral-950">
              Đơn hàng 7 ngày
            </h2>
          </div>

          <div className="h-[360px] p-6 pb-10">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={orderData} margin={{ top: 8, right: 16, left: 8, bottom: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis
                  dataKey="day"
                  stroke="#737373"
                  tickLine={false}
                  tickMargin={12}
                  height={42}
                />
                <YAxis allowDecimals={false} stroke="#737373" tickLine={false} />
                <Tooltip
                  formatter={(value) => [value, "Đơn hàng"]}
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderColor: "#d4d4d4",
                    borderRadius: 8,
                    color: "#111827",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="#DC2626"
                  strokeWidth={3}
                  dot={{ fill: "#DC2626", r: 4 }}
                  activeDot={{ fill: "#DC2626", r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-neutral-200 bg-neutral-100 p-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-950 text-white">
              <Package className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-neutral-950">
              Sản phẩm bán chạy
            </h2>
          </div>

          {topProducts.length ? (
            <div className="divide-y divide-neutral-100">
              {topProducts.map((product, index) => {
                const sold = getProductSold(product);
                const percent = maxTopProductSold
                  ? Math.max((sold / maxTopProductSold) * 100, 8)
                  : 0;

                return (
                  <div
                    key={product.id || product._id || index}
                    className="px-6 py-4 transition hover:bg-neutral-50"
                  >
                    <div className="mb-3 flex items-center justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-950 text-sm font-semibold text-white">
                          #{index + 1}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-neutral-950">
                            {product.name || product.productName || "Sản phẩm"}
                          </p>
                          <p className="text-sm text-neutral-500">
                            {formatNumber(sold)} đã bán
                          </p>
                        </div>
                      </div>

                      <span className="shrink-0 text-sm font-semibold text-neutral-950">
                        {formatNumber(sold)}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
                      <div
                        className="h-full rounded-full bg-neutral-950"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 text-sm text-neutral-400">
              Không có dữ liệu sản phẩm
            </div>
          )}
      </div>

      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
        <div className="border-b border-neutral-200 bg-neutral-100 p-6">
          <h2 className="text-lg font-semibold text-neutral-950">
            Đơn hàng gần đây
          </h2>
        </div>

        {latestOrders.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead className="bg-neutral-950">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold uppercase text-white">
                    Mã đơn
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase text-white">
                    Khách hàng
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase text-white">
                    Sản phẩm
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase text-white">
                    Tổng tiền
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase text-white">
                    Trạng thái
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-100">
                {latestOrders.map((order, index) => (
                  <tr
                    key={order.id || order._id || order.code || index}
                    className="transition hover:bg-neutral-50"
                  >
                    <td className="px-6 py-4 text-sm font-semibold text-neutral-950">
                      {order.code || order.orderCode || `ORD-${index + 1}`}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-700">
                      {order.customerName ||
                        order.user?.name ||
                        order.customer?.name ||
                        "Khách hàng"}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-700">
                      {getOrderProductCount(order)}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-neutral-950">
                      {formatCurrency(order.total || order.totalAmount)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-sm text-neutral-400">Không có đơn hàng</div>
        )}
      </div>
    </div>
  );
}
