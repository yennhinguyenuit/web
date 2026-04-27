const prisma = require("../config/prisma");

// 🔥 SUMMARY
exports.getSummary = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      select: {
        total: true,
        status: true,
      },
    });

    let totalRevenue = 0;
    let totalOrders = 0;
    let paidOrders = 0;
    let deliveredOrders = 0;

    orders.forEach((o) => {
      totalOrders++;

      if (o.status === "paid") paidOrders++;
      if (o.status === "delivered") deliveredOrders++;

      if (o.status === "delivered") {
        totalRevenue += Number(o.total);
      }
    });

    res.json({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        paidOrders,
        deliveredOrders,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

// 📊 DOANH THU
exports.getRevenue = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        status: "delivered", // chỉ tính đơn hoàn thành
      },
      select: {
        total: true,
        createdAt: true,
      },
    });

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

    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

// 📦 SỐ ĐƠN
exports.getOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      select: { createdAt: true },
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

    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};