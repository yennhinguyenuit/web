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

// 📈 DOANH THU THEO NGÀY
const getRevenue = async (req, res) => {
  try {
    const allOrders = await prisma.order.findMany({
      select: {
        total: true,
        createdAt: true,
        status: true,
      },
    });

    const orders = allOrders.filter(
      (o) => o.status?.toLowerCase().trim() === "completed"
    );

    const map = {};

    orders.forEach((o) => {
      const date = o.createdAt.toISOString().split("T")[0];

      if (!map[date]) map[date] = 0;

      map[date] += Number(o.total);
    });

    const data = Object.keys(map).map((date) => ({
      date,
      total: map[date],
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

// 📦 SỐ ĐƠN THEO NGÀY
const getOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      select: {
        createdAt: true,
      },
    });

    const map = {};

    orders.forEach((o) => {
      const date = o.createdAt.toISOString().split("T")[0];

      if (!map[date]) map[date] = 0;

      map[date] += 1;
    });

    const data = Object.keys(map).map((date) => ({
      date,
      total: map[date],
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
        sold: i._sum.quantity,
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