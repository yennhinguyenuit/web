require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.role.upsert({
    where: { name: "admin" },
    update: {},
    create: { name: "admin" },
  });

  await prisma.role.upsert({
    where: { name: "user" },
    update: {},
    create: { name: "user" },
  });

  await prisma.shippingMethod.upsert({
    where: { code: "standard" },
    update: {},
    create: {
      code: "standard",
      name: "Giao hàng tiêu chuẩn",
      price: 30000,
      estimatedDays: 3,
      description: "Giao trong 3-5 ngày",
    },
  });

  await prisma.shippingMethod.upsert({
    where: { code: "express" },
    update: {},
    create: {
      code: "express",
      name: "Giao hàng nhanh",
      price: 50000,
      estimatedDays: 2,
      description: "Giao trong 1-2 ngày",
    },
  });

  await prisma.shippingMethod.upsert({
    where: { code: "same-day" },
    update: {},
    create: {
      code: "same-day",
      name: "Giao trong ngày",
      price: 80000,
      estimatedDays: 1,
      description: "Giao trong ngày tại nội thành",
    },
  });

  await prisma.paymentMethod.upsert({
    where: { code: "cod" },
    update: {},
    create: {
      code: "cod",
      name: "Thanh toán khi nhận hàng",
      description: "Khách hàng trả tiền mặt khi nhận hàng",
    },
  });

  await prisma.paymentMethod.upsert({
    where: { code: "momo" },
    update: {},
    create: {
      code: "momo",
      name: "Ví MoMo",
      description: "Thanh toán qua ví MoMo",
    },
  });

  await prisma.paymentMethod.upsert({
    where: { code: "zalopay" },
    update: {},
    create: {
      code: "zalopay",
      name: "ZaloPay",
      description: "Thanh toán qua ZaloPay",
    },
  });

  await prisma.paymentMethod.upsert({
    where: { code: "card" },
    update: {},
    create: {
      code: "card",
      name: "Thẻ ngân hàng",
      description: "Thanh toán bằng thẻ ATM/Visa/MasterCard",
    },
  });

  await prisma.paymentMethod.upsert({
    where: { code: "qr" },
    update: {},
    create: {
      code: "qr",
      name: "QR Banking",
      description: "Thanh toán bằng mã QR",
    },
  });
    const fashionCategory = await prisma.category.upsert({
    where: { slug: "thoi-trang" },
    update: {
      name: "Thời trang",
      description: "Quần áo và phụ kiện thời trang",
    },
    create: {
      name: "Thời trang",
      slug: "thoi-trang",
      description: "Quần áo và phụ kiện thời trang",
    },
  });

  const shoesCategory = await prisma.category.upsert({
    where: { slug: "giay-dep" },
    update: {
      name: "Giày dép",
      description: "Giày thể thao, sandal, dép",
    },
    create: {
      name: "Giày dép",
      slug: "giay-dep",
      description: "Giày thể thao, sandal, dép",
    },
  });

  const accessoriesCategory = await prisma.category.upsert({
    where: { slug: "phu-kien" },
    update: {
      name: "Phụ kiện",
      description: "Túi xách, nón, thắt lưng, ví",
    },
    create: {
      name: "Phụ kiện",
      slug: "phu-kien",
      description: "Túi xách, nón, thắt lưng, ví",
    },
  });
  await prisma.product.upsert({
  where: { slug: "ao-thun-nam-cotton-premium" },
  update: {},
  create: {
    name: "Áo thun nam cotton premium",
    slug: "ao-thun-nam-cotton-premium",
    description: "Áo thun nam cotton mềm mại",
    price: "299000",
    originalPrice: "399000",
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
      create: [
        { colorName: "Đen" },
        { colorName: "Trắng" },
      ],
    },
    sizes: {
      create: [
        { sizeName: "S" },
        { sizeName: "M" },
        { sizeName: "L" },
      ],
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
    price: "699000",
    originalPrice: "899000",
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
      create: [
        { colorName: "Trắng" },
        { colorName: "Đen" },
      ],
    },
    sizes: {
      create: [
        { sizeName: "39" },
        { sizeName: "40" },
        { sizeName: "41" },
      ],
    },
  },
});

  console.log("Seed data inserted successfully");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });