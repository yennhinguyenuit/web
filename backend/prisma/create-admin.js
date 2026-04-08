require("dotenv").config();
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminRole = await prisma.role.findUnique({
    where: { name: "admin" },
  });

  if (!adminRole) {
    throw new Error("Không tìm thấy role admin");
  }

  const existingAdmin = await prisma.user.findUnique({
    where: { email: "admin@gmail.com" },
  });

  if (existingAdmin) {
    console.log("Admin đã tồn tại");
    return;
  }

  const hashedPassword = await bcrypt.hash("123456", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@gmail.com",
      phone: "123456",
      passwordHash: hashedPassword,
      roleId: adminRole.id,
    },
  });

  console.log("Tạo admin thành công:", admin.email);
}

main()
  .catch((error) => {
    console.error("Create admin error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });