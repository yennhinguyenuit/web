require("dotenv").config();

const xlsx = require("xlsx");
const { Client } = require("pg");
const { v4: uuidv4 } = require("uuid");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

const CATEGORY_ID = "cate-1";

function createSlug(name) {
  return name
    ?.toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "") || "no-name";
}

async function run() {
  await client.connect();

  // ✅ đảm bảo có category (không trùng thì thôi)
  await client.query(`
    INSERT INTO "Category" (id, name, slug, "createdAt", "updatedAt")
    VALUES ('cate-1', 'Default Category', 'default-category', NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;
  `);

  const workbook = xlsx.readFile("../frontend/my-app/public/products.xlsx");
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(sheet);

  console.log("👉 Tổng dòng Excel:", data.length);

  let inserted = 0;
  let skipped = 0;

  for (const item of data) {
    try {
      const name = item.name || item.Name || "No name";
      const slug = createSlug(name);
      const image = item.image || item.Image || item.IMAGE || "";

      // ✅ check sản phẩm đã tồn tại chưa (theo slug)
      const exist = await client.query(
        `SELECT id FROM "Product" WHERE slug = $1`,
        [slug]
      );

      if (exist.rows.length > 0) {
        console.log("⏭ Bỏ qua (đã tồn tại):", name);
        skipped++;
        continue;
      }

      // ✅ insert nếu chưa có
      await client.query(
        `INSERT INTO "Product" 
        (id, name, slug, price, image, stock, sku, "categoryId", "isDeleted", "createdAt", "updatedAt", "isActive")
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW(),NOW(),$10)`,
        [
          uuidv4(),
          name,
          slug,
          Number(item.price || item.Price || 0),
          image,
          100,
          item.sku || item.SKU || `SKU-${Date.now()}`,
          CATEGORY_ID,
          false,
          true,
        ]
      );

      console.log("✔ Đã thêm:", name);
      inserted++;

    } catch (err) {
      console.log("❌ Lỗi:", err.message);
    }
  }

  console.log("\n🎯 KẾT QUẢ:");
  console.log("✔ Thêm mới:", inserted);
  console.log("⏭ Bỏ qua:", skipped);

  await client.end();
}

run();