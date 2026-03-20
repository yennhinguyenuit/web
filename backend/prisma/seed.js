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