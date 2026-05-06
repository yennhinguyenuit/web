const prisma = require("../config/prisma");

// 🔥 SUMMARY + LATEST ORDERS + USERS + PENDING
const getSummary = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      select: {
        id: true,
        code: true,
        total: true,
        status: true,
        createdAt: true,
        user: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    let totalRevenue = 0;
    let totalOrders = 0;
    let paidOrders = 0;
    let completedOrders = 0;
    let pendingOrders = 0;

    orders.forEach((o) => {
      totalOrders++;

      const status = o.status?.toLowerCase().trim();

      if (status === "confirmed") paidOrders++;
      if (status === "completed") completedOrders++;
      if (status === "pending") pendingOrders++;

      if (status === "completed") {
        totalRevenue += Number(o.total);
      }
    });

    // 👤 USERS
    const totalUsers = await prisma.user.count();

    // 🧾 LATEST ORDERS
    const latestOrders = orders.slice(0, 5).map((o) => ({
      id: o.id,
      code: o.code,
      total: o.total,
      status: o.status,
      customerName: o.user?.name || "Khách",
    }));

    res.json({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        paidOrders,
        completedOrders,
        pendingOrders, // ✅ thêm
        totalUsers,    // ✅ thêm
        latestOrders,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

// 📈 DOANH THU THEO THÁNG
const getRevenue = async (req, res) => {
  try {
    const completedOrders = await prisma.order.findMany({
      where: {
        status: "completed",
      },
      select: {
        createdAt: true,
        total: true,
      },
    });

    const monthlyMap = new Map();

    completedOrders.forEach((order) => {
      const month = String(order.createdAt.getMonth() + 1);
      monthlyMap.set(month, (monthlyMap.get(month) || 0) + Number(order.total || 0));
    });

    const data = Array.from(monthlyMap.entries())
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([month, revenue]) => ({
        month,
        revenue,
      }));

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

// 📦 TỔNG QUAN ĐƠN HÀNG THEO TRẠNG THÁI
const getOrders = async (req, res) => {
  try {
    const [total, pending, completed, cancelled] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: "pending" } }),
      prisma.order.count({ where: { status: "completed" } }),
      prisma.order.count({ where: { status: "cancelled" } }),
    ]);

    res.json({
      success: true,
      data: {
        total,
        pending,
        completed,
        cancelled,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

// 🔥 TOP PRODUCTS
const getTopProducts = async (req, res) => {
  try {
    const items = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 5,
    });

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: items.map((i) => i.productId),
        },
      },
    });

    const result = items.map((i) => {
      const p = products.find((x) => x.id === i.productId);
      return {
        id: p?.id,
        name: p?.name || "Không tên",
        sold: Number(i._sum.quantity || 0),
      };
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

module.exports = {
  getSummary,
  getRevenue,
  getOrders,
  getTopProducts, // ✅ thêm
};