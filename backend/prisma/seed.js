require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const bcrypt = require("bcryptjs");

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

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

  await prisma.shippingMethod.upsert({
    where: { code: "standard" },
    update: {
      name: "Giao hàng tiêu chuẩn",
      price: 30000,
      estimatedDays: 3,
      description: "Giao trong 2-4 ngày làm việc",
    },
    create: {
      code: "standard",
      name: "Giao hàng tiêu chuẩn",
      price: 30000,
      estimatedDays: 3,
      description: "Giao trong 2-4 ngày làm việc",
    },
  });

  await prisma.shippingMethod.upsert({
    where: { code: "express" },
    update: {
      name: "Giao nhanh",
      price: 50000,
      estimatedDays: 2,
      description: "Ưu tiên xử lý và giao nhanh",
    },
    create: {
      code: "express",
      name: "Giao nhanh",
      price: 50000,
      estimatedDays: 2,
      description: "Ưu tiên xử lý và giao nhanh",
    },
  });

  await prisma.shippingMethod.upsert({
    where: { code: "same-day" },
    update: {
      name: "Giao trong ngày",
      price: 80000,
      estimatedDays: 1,
      description: "Áp dụng cho nội thành đủ điều kiện",
    },
    create: {
      code: "same-day",
      name: "Giao trong ngày",
      price: 80000,
      estimatedDays: 1,
      description: "Áp dụng cho nội thành đủ điều kiện",
    },
  });

  const paymentMethods = [
    {
      code: "cod",
      name: "Thanh toán khi nhận hàng",
      description: "Khách thanh toán khi nhận hàng",
      isOnline: false,
      isEnabled: true,
    },
    {
      code: "bank_transfer",
      name: "Chuyển khoản ngân hàng (VietQR)",
      description: "Quét mã VietQR bằng app ngân hàng và tự động đối soát qua webhook",
      isOnline: true,
      isEnabled: true,
    },
    {
      code: "payos",
      name: "Thanh toán online qua payOS",
      description: "Tạo link thanh toán payOS, redirect sang checkoutUrl và xác nhận đơn bằng webhook",
      isOnline: true,
      isEnabled: true,
    },
    {
      code: "momo",
      name: "Ví MoMo",
      description: "Chưa kích hoạt trong backend này",
      isOnline: true,
      isEnabled: false,
    },
    {
      code: "zalopay",
      name: "ZaloPay",
      description: "Chưa kích hoạt trong backend này",
      isOnline: true,
      isEnabled: false,
    },
    {
      code: "card",
      name: "Thẻ ngân hàng",
      description: "Chưa kích hoạt trong backend này",
      isOnline: true,
      isEnabled: false,
    },
  ];

  for (const method of paymentMethods) {
    await prisma.paymentMethod.upsert({
      where: { code: method.code },
      update: {
        name: method.name,
        description: method.description,
        isOnline: method.isOnline,
        isEnabled: method.isEnabled,
      },
      create: {
        code: method.code,
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

  const fashionCategory = await prisma.category.upsert({
    where: { slug: "thoi-trang" },
    update: {},
    create: {
      name: "Thời trang",
      slug: "thoi-trang",
    },
  });

  const shoesCategory = await prisma.category.upsert({
    where: { slug: "giay-dep" },
    update: {},
    create: {
      name: "Giày dép",
      slug: "giay-dep",
    },
  });

  await prisma.product.upsert({
    where: { slug: "ao-thun-nam-cotton-premium" },
    update: {},
    create: {
      name: "Áo thun nam cotton premium",
      slug: "ao-thun-nam-cotton-premium",
      description: "Áo thun nam cotton mềm mại",
      price: 299000,
      originalPrice: 399000,
      stock: 120,
      badge: "Sale 25%",
      image: "https://placehold.co/600x800?text=Ao+Thun",
      ratingAvg: 4.6,
      reviewCount: 124,
      isActive: true,
      categoryId: fashionCategory.id,
      images: {
        create: [
          { imageUrl: "https://placehold.co/600x800?text=Ao+Thun+1", sortOrder: 1 },
          { imageUrl: "https://placehold.co/600x800?text=Ao+Thun+2", sortOrder: 2 },
        ],
      },
      colors: {
        create: [{ colorName: "Đen" }, { colorName: "Trắng" }],
      },
      sizes: {
        create: [{ sizeName: "S" }, { sizeName: "M" }, { sizeName: "L" }],
      },
    },
  });

  await prisma.product.upsert({
    where: { slug: "giay-sneaker-basic-trang" },
    update: {},
    create: {
      name: "Giày sneaker basic trắng",
      slug: "giay-sneaker-basic-trang",
      description: "Giày sneaker basic dễ phối đồ",
      price: 699000,
      originalPrice: 899000,
      stock: 50,
      badge: "Best Seller",
      image: "https://placehold.co/600x800?text=Sneaker",
      ratingAvg: 4.8,
      reviewCount: 210,
      isActive: true,
      categoryId: shoesCategory.id,
      images: {
        create: [
          { imageUrl: "https://placehold.co/600x800?text=Sneaker+1", sortOrder: 1 },
          { imageUrl: "https://placehold.co/600x800?text=Sneaker+2", sortOrder: 2 },
        ],
      },
      colors: {
        create: [{ colorName: "Trắng" }, { colorName: "Đen" }],
      },
      sizes: {
        create: [{ sizeName: "39" }, { sizeName: "40" }, { sizeName: "41" }],
      },
    },
  });
  //TEST
  await prisma.shippingMethod.upsert({
  where: { code: "pickup" },
  update: {
    name: "Nhận tại cửa hàng",
    price: 0,
    estimatedDays: 0,
    description: "Dùng để test thanh toán, không tính phí ship",
  },
  create: {
    code: "pickup",
    name: "Nhận tại cửa hàng",
    price: 0,
    estimatedDays: 0,
    description: "Dùng để test thanh toán, không tính phí ship",
  },
});
await prisma.product.upsert({
  where: { slug: "san-pham-test-2000" },
  update: {
    name: "Sản phẩm test 2k",
    description: "Sản phẩm dùng để test payOS 2.000đ",
    price: 2000,
    originalPrice: 2000,
    stock: 999,
    badge: "Test",
    image: "https://placehold.co/600x800?text=Test+2000",
    ratingAvg: 5,
    reviewCount: 0,
    isActive: true,
    categoryId: fashionCategory.id,
  },
  create: {
    name: "Sản phẩm test 2k",
    slug: "san-pham-test-2000",
    description: "Sản phẩm dùng để test payOS 2.000đ",
    price: 2000,
    originalPrice: 2000,
    stock: 999,
    badge: "Test",
    image: "https://placehold.co/600x800?text=Test+2000",
    ratingAvg: 5,
    reviewCount: 0,
    isActive: true,
    categoryId: fashionCategory.id,
    images: {
      create: [{ imageUrl: "https://placehold.co/600x800?text=Test+2000", sortOrder: 1 }],
    },
    colors: {
      create: [{ colorName: "Default" }],
    },
    sizes: {
      create: [{ sizeName: "One Size" }],
    },
  },
});

  console.log("✅ Seed completed");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
