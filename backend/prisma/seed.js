require("dotenv").config();
const { PrismaClient } = require("../src/generated/prisma");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const excelProducts = require("./excel-products");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });
const sampleProducts = [
  {
    name: "Áo thun nam cotton premium",
    slug: "ao-thun-nam-cotton-premium",
    description: "Áo thun nam cotton mềm mại, thoáng mát, dễ mặc hằng ngày.",
    price: 299000,
    originalPrice: 399000,
    stock: 120,
    badge: "Sale 25%",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900&q=80&fit=crop&sig=sample1",
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900&q=80&fit=crop&sig=sample11",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900&q=80&fit=crop&sig=sample12",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900&q=80&fit=crop&sig=sample13",
    ],
    ratingAvg: 4.6,
    reviewCount: 124,
    categorySlug: "thoi-trang",
    colors: ["Đen", "Trắng", "Xám"],
    sizes: ["S", "M", "L", "XL"],
  },
  {
    name: "Giày sneaker basic trắng",
    slug: "giay-sneaker-basic-trang",
    description: "Giày sneaker basic dễ phối đồ, êm chân và phù hợp đi học, đi làm, đi chơi.",
    price: 699000,
    originalPrice: 899000,
    stock: 50,
    badge: "Best Seller",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&q=80&fit=crop&sig=sample2",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&q=80&fit=crop&sig=sample21",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&q=80&fit=crop&sig=sample22",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&q=80&fit=crop&sig=sample23",
    ],
    ratingAvg: 4.8,
    reviewCount: 210,
    categorySlug: "giay-dep",
    colors: ["Trắng", "Đen", "Kem"],
    sizes: ["39", "40", "41", "42"],
  },
];

const shippingMethods = [
  {
    code: "standard",
    name: "Giao hàng tiêu chuẩn",
    price: 30000,
    estimatedDays: 3,
    description: "Giao trong 2-4 ngày làm việc",
  },
  {
    code: "express",
    name: "Giao nhanh",
    price: 50000,
    estimatedDays: 2,
    description: "Ưu tiên xử lý và giao nhanh",
  },
  {
    code: "same-day",
    name: "Giao trong ngày",
    price: 80000,
    estimatedDays: 1,
    description: "Áp dụng cho khu vực đủ điều kiện",
  },
];

const paymentMethods = [
  {
    code: "payos",
    name: "Thanh toán online qua PayOS",
    description: "Quét QR hoặc thanh toán trực tuyến trên trang PayOS.",
    isOnline: true,
    isEnabled: true,
  },
  {
    code: "cod",
    name: "Thanh toán khi nhận hàng",
    description: "Tạm ẩn",
    isOnline: false,
    isEnabled: false,
  },
  {
    code: "bank_transfer",
    name: "Chuyển khoản ngân hàng",
    description: "Tạm ẩn",
    isOnline: true,
    isEnabled: false,
  },
  {
    code: "momo",
    name: "Ví MoMo",
    description: "Tạm ẩn",
    isOnline: true,
    isEnabled: false,
  },
  {
    code: "zalopay",
    name: "ZaloPay",
    description: "Tạm ẩn",
    isOnline: true,
    isEnabled: false,
  },
  {
    code: "card",
    name: "Thẻ ngân hàng",
    description: "Tạm ẩn",
    isOnline: true,
    isEnabled: false,
  },
];

async function upsertProduct(product, categoryMap) {
  const categoryId = categoryMap[product.categorySlug || "thoi-trang"];

  await prisma.product.upsert({
    where: { slug: product.slug },
    update: {
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice,
      stock: product.stock,
      badge: product.badge,
      image: product.image,
      ratingAvg: product.ratingAvg,
      reviewCount: product.reviewCount,
      isActive: true,
      categoryId,
      images: {
        deleteMany: {},
        create: (product.images || []).map((imageUrl, index) => ({
          imageUrl,
          sortOrder: index + 1,
        })),
      },
      colors: {
        deleteMany: {},
        create: (product.colors || []).map((colorName) => ({ colorName })),
      },
      sizes: {
        deleteMany: {},
        create: (product.sizes || []).map((sizeName) => ({ sizeName })),
      },
    },
    create: {
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice,
      stock: product.stock,
      badge: product.badge,
      image: product.image,
      ratingAvg: product.ratingAvg,
      reviewCount: product.reviewCount,
      isActive: true,
      categoryId,
      images: {
        create: (product.images || []).map((imageUrl, index) => ({
          imageUrl,
          sortOrder: index + 1,
        })),
      },
      colors: {
        create: (product.colors || []).map((colorName) => ({ colorName })),
      },
      sizes: {
        create: (product.sizes || []).map((sizeName) => ({ sizeName })),
      },
    },
  });
}

async function main() {
  const adminRole = await prisma.role.upsert({
    where: { name: "admin" },
    update: {},
    create: { name: "admin" },
  });

  const userRole = await prisma.role.upsert({
    where: { name: "user" },
    update: {},
    create: { name: "user" },
  });

  const passwordHash = await bcrypt.hash("123456", 10);

  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      passwordHash,
      name: "Admin",
      roleId: adminRole.id,
    },
  });

  await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      email: "user@example.com",
      passwordHash,
      name: "Test User",
      roleId: userRole.id,
    },
  });

  for (const method of shippingMethods) {
    const existing = await prisma.shippingMethod.findUnique({
      where: { code: method.code },
      select: { id: true },
    });

    if (!existing) {
      await prisma.shippingMethod.create({ data: method });
      continue;
    }

    await prisma.shippingMethod.updateMany({
      where: { code: method.code },
      data: {
        name: method.name,
        price: method.price,
        estimatedDays: method.estimatedDays,
        description: method.description,
      },
    });
  }

  for (const method of paymentMethods) {
    const existing = await prisma.paymentMethod.findUnique({
      where: { code: method.code },
      select: { id: true },
    });

    if (!existing) {
      await prisma.paymentMethod.create({ data: method });
      continue;
    }

    await prisma.paymentMethod.updateMany({
      where: { code: method.code },
      data: {
        name: method.name,
        description: method.description,
        isOnline: method.isOnline,
        isEnabled: method.isEnabled,
      },
    });
  }

  await prisma.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {
      name: "Giảm 10% cho đơn đầu tiên",
      description: "Giảm tối đa 50.000đ cho đơn từ 300.000đ",
      discountType: "percent",
      discountValue: 10,
      minOrderValue: 300000,
      maxDiscount: 50000,
      usageLimit: 500,
      perUserLimit: 1,
      isActive: true,
      startAt: null,
      endAt: null,
    },
    create: {
      code: "WELCOME10",
      name: "Giảm 10% cho đơn đầu tiên",
      description: "Giảm tối đa 50.000đ cho đơn từ 300.000đ",
      discountType: "percent",
      discountValue: 10,
      minOrderValue: 300000,
      maxDiscount: 50000,
      usageLimit: 500,
      perUserLimit: 1,
      isActive: true,
    },
  });

  const categories = [
    { name: "Thời trang", slug: "thoi-trang" },
    { name: "Giày dép", slug: "giay-dep" },
  ];

  const categoryMap = {};
  for (const category of categories) {
    const created = await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name },
      create: category,
    });
    categoryMap[category.slug] = created.id;
  }


  const allProducts = [...sampleProducts, ...excelProducts];
  for (const product of allProducts) {
    await upsertProduct(product, categoryMap);
  }

  console.log(`✅ Seed completed with ${allProducts.length} products`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
