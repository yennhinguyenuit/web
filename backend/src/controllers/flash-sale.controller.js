const prisma = require("../config/prisma");

const HOLIDAY_CAMPAIGNS = [
  { key: "black-friday", name: "Black Friday", month: 11, day: 29, discountPercent: 25 },
  { key: "11-11", name: "11.11 Sale", month: 11, day: 11, discountPercent: 20 },
  { key: "12-12", name: "12.12 Sale", month: 12, day: 12, discountPercent: 20 },
  { key: "noel", name: "Noel Sale", month: 12, day: 25, discountPercent: 18 },
];

const mapFlashSale = (flashSale) => {
  if (!flashSale) return null;

  const now = new Date();
  const startAt = new Date(flashSale.startAt);
  const endAt = new Date(flashSale.endAt);
  const status = !flashSale.isActive
    ? "inactive"
    : startAt > now
      ? "scheduled"
      : endAt < now
        ? "ended"
        : "running";

  return {
    id: flashSale.id,
    name: flashSale.name,
    discount_percent: Number(flashSale.discountPercent),
    start_date: flashSale.startAt,
    end_date: flashSale.endAt,
    isActive: flashSale.isActive,
    status,
    products: (flashSale.items || []).map((item) => item.product),
    productIds: (flashSale.items || []).map((item) => item.productId),
    productCount: (flashSale.items || []).length,
    flashSaleItems: (flashSale.items || []).map((item) => ({
      id: item.id,
      product: item.product,
    })),
  };
};

const getFlashSales = async (req, res) => {
  try {
    const flashSales = await prisma.flashSale.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        startAt: "desc",
      },
    });

    return res.json({
      success: true,
      data: flashSales.map(mapFlashSale),
    });
  } catch (error) {
    console.error("getFlashSales error:", error);
    return res.status(500).json({ success: false, message: "Khong the tai danh sach flash sale" });
  }
};

const getActiveFlashSale = async (req, res) => {
  try {
    const now = new Date();
    const activeFlashSale = await prisma.flashSale.findFirst({
      where: {
        isActive: true,
        startAt: { lte: now },
        endAt: { gte: now },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        startAt: "desc",
      },
    });

    return res.json({
      success: true,
      data: mapFlashSale(activeFlashSale),
    });
  } catch (error) {
    console.error("getActiveFlashSale error:", error);
    return res.status(500).json({ success: false, message: "Không thể tải flash sale" });
  }
};

const createFlashSale = async (req, res) => {
  try {
    const { name, discount_percent, start_date, end_date, productIds = [] } = req.body;
    if (!name || !discount_percent || !start_date || !end_date) {
      return res.status(400).json({ success: false, message: "Thiếu dữ liệu flash sale" });
    }

    const discountPercent = Number(discount_percent);
    const startAt = new Date(start_date);
    const endAt = new Date(end_date);
    if (Number.isNaN(discountPercent) || discountPercent <= 0 || discountPercent > 100) {
      return res.status(400).json({ success: false, message: "discount_percent không hợp lệ" });
    }
    if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime()) || startAt >= endAt) {
      return res.status(400).json({ success: false, message: "Thời gian flash sale không hợp lệ" });
    }

    const uniqueProductIds = [...new Set(
      (Array.isArray(productIds) ? productIds : [])
        .map((productId) => String(productId || "").trim())
        .filter(Boolean)
    )];

    if (uniqueProductIds.length === 0) {
      return res.status(400).json({ success: false, message: "Vui long chon it nhat 1 san pham" });
    }

    const validProducts = await prisma.product.findMany({
      where: {
        id: { in: uniqueProductIds },
        isActive: true,
        isDeleted: false,
      },
      select: { id: true },
    });

    if (validProducts.length !== uniqueProductIds.length) {
      return res.status(400).json({ success: false, message: "Danh sach san pham flash sale khong hop le" });
    }

    const flashSale = await prisma.$transaction(async (tx) => {
      await tx.flashSale.updateMany({
        where: {
          isActive: true,
          startAt: { lte: endAt },
          endAt: { gte: startAt },
        },
        data: { isActive: false },
      });

      return tx.flashSale.create({
        data: {
          name: String(name).trim(),
          discountPercent,
          startAt,
          endAt,
          isActive: true,
          items: {
            create: uniqueProductIds.map((productId) => ({
              productId,
            })),
          },
        },
        include: {
          items: {
            include: { product: true },
          },
        },
      });
    });

    return res.status(201).json({ success: true, data: mapFlashSale(flashSale) });
  } catch (error) {
    console.error("createFlashSale error:", error);
    return res.status(500).json({ success: false, message: "Không thể tạo flash sale" });
  }
};

const deleteFlashSale = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.flashSale.delete({ where: { id } });
    return res.json({ success: true });
  } catch (error) {
    console.error("deleteFlashSale error:", error);
    return res.status(500).json({ success: false, message: "Không thể xóa flash sale" });
  }
};

const ensureHolidayFlashSale = async () => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  const holiday = HOLIDAY_CAMPAIGNS.find((item) => item.month === month && item.day === day);
  if (!holiday) return;

  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const dayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  const existed = await prisma.flashSale.findFirst({
    where: {
      name: holiday.name,
      startAt: { gte: dayStart, lte: dayEnd },
    },
    select: { id: true },
  });

  if (existed) return;

  const products = await prisma.product.findMany({
    where: { isActive: true, isDeleted: false },
    take: 12,
    select: { id: true },
  });
  if (!products.length) return;

  await prisma.flashSale.create({
    data: {
      name: holiday.name,
      discountPercent: holiday.discountPercent,
      startAt: dayStart,
      endAt: dayEnd,
      isActive: true,
      items: {
        create: products.map((product) => ({ productId: product.id })),
      },
    },
  });
};

const startHolidayFlashSaleCron = () => {
  const interval = 60 * 1000;
  ensureHolidayFlashSale().catch((error) => {
    console.error("flash sale holiday init error:", error);
  });

  setInterval(() => {
    ensureHolidayFlashSale().catch((error) => {
      console.error("flash sale holiday cron error:", error);
    });
  }, interval);
};

module.exports = {
  getFlashSales,
  getActiveFlashSale,
  createFlashSale,
  deleteFlashSale,
  startHolidayFlashSaleCron,
};
