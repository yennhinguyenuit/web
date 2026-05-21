require("dotenv").config();

const path = require("path");
const xlsx = require("xlsx");
const { Client } = require("pg");
const { v4: uuidv4 } = require("uuid");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

const excelPath = path.resolve(__dirname, "../frontend/my-app/public/products.xlsx");

function pick(row, keys, fallback = "") {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== "") {
      return row[key];
    }
  }
  return fallback;
}

function createSlug(value) {
  return String(value || "no-name")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toList(value) {
  if (!value) return [];
  return String(value)
    .split(/[,;|]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

async function ensureCategory(name) {
  const categoryName = String(name || "Default Category").trim();
  const slug = createSlug(categoryName);
  const id = `cate-${slug}`;

  await client.query(
    `INSERT INTO "Category" (id, name, slug, "createdAt", "updatedAt")
     VALUES ($1, $2, $3, NOW(), NOW())
     ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, "updatedAt" = NOW()`,
    [id, categoryName, slug]
  );

  const result = await client.query(`SELECT id FROM "Category" WHERE slug = $1 LIMIT 1`, [slug]);
  return result.rows[0].id;
}

async function replaceVariants(productId, colors, sizes, images) {
  await client.query(`DELETE FROM "ProductColor" WHERE "productId" = $1`, [productId]);
  await client.query(`DELETE FROM "ProductSize" WHERE "productId" = $1`, [productId]);
  await client.query(`DELETE FROM "ProductImage" WHERE "productId" = $1`, [productId]);

  for (const colorName of colors) {
    await client.query(
      `INSERT INTO "ProductColor" (id, "productId", "colorName", "createdAt") VALUES ($1, $2, $3, NOW())`,
      [uuidv4(), productId, colorName]
    );
  }

  for (const sizeName of sizes) {
    await client.query(
      `INSERT INTO "ProductSize" (id, "productId", "sizeName", "createdAt") VALUES ($1, $2, $3, NOW())`,
      [uuidv4(), productId, sizeName]
    );
  }

  for (const [index, imageUrl] of images.entries()) {
    await client.query(
      `INSERT INTO "ProductImage" (id, "productId", "imageUrl", "sortOrder", "createdAt") VALUES ($1, $2, $3, $4, NOW())`,
      [uuidv4(), productId, imageUrl, index]
    );
  }
}

async function run() {
  await client.connect();

  const workbook = xlsx.readFile(excelPath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet);

  console.log("Tong dong Excel:", rows.length);

  let inserted = 0;
  let updated = 0;

  for (const row of rows) {
    const name = String(pick(row, ["name", "Name", "Tên sản phẩm", "Ten san pham"], "No name")).trim();
    const slug = createSlug(pick(row, ["slug", "Slug"], name));
    const sku = String(pick(row, ["sku", "SKU"], `SKU-${slug}`)).trim();
    const price = Number(pick(row, ["price", "Price", "Giá", "Gia"], 0)) || 0;
    const originalPrice = Number(pick(row, ["originalPrice", "Original Price", "Giá gốc", "Gia goc"], 0)) || null;
    const stock = Number(pick(row, ["stock", "Stock", "Tồn kho", "Ton kho"], 100)) || 0;
    const description = String(pick(row, ["description", "Description", "Mô tả", "Mo ta"], "")).trim();
    const categoryId = await ensureCategory(pick(row, ["category", "Category", "Danh mục", "Danh muc"], "Default Category"));
    const colors = toList(pick(row, ["colors", "Colors", "Màu", "Mau"]));
    const sizes = toList(pick(row, ["sizes", "Sizes", "Size", "Kích thước", "Kich thuoc"]));
    const images = toList(pick(row, ["images", "Images", "Ảnh phụ", "Anh phu"]));
    const image = String(pick(row, ["image", "Image", "IMAGE", "Ảnh", "Anh"], images[0] || "")).trim();

    const existing = await client.query(`SELECT id FROM "Product" WHERE slug = $1 OR sku = $2 LIMIT 1`, [slug, sku]);
    const productId = existing.rows[0]?.id || uuidv4();

    if (existing.rows.length) {
      await client.query(
        `UPDATE "Product"
         SET name = $1, slug = $2, sku = $3, price = $4, "originalPrice" = $5, image = $6,
             stock = $7, description = $8, "categoryId" = $9, "isDeleted" = false,
             "isActive" = true, "updatedAt" = NOW()
         WHERE id = $10`,
        [name, slug, sku, price, originalPrice, image, stock, description, categoryId, productId]
      );
      updated++;
    } else {
      await client.query(
        `INSERT INTO "Product"
         (id, name, slug, sku, price, "originalPrice", image, stock, description, "categoryId", "isDeleted", "isActive", "createdAt", "updatedAt")
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,false,true,NOW(),NOW())`,
        [productId, name, slug, sku, price, originalPrice, image, stock, description, categoryId]
      );
      inserted++;
    }

    await replaceVariants(productId, colors, sizes, images);
  }

  console.log("Ket qua:");
  console.log("Them moi:", inserted);
  console.log("Cap nhat:", updated);

  await client.end();
}

run().catch(async (error) => {
  console.error("Import loi:", error.message);
  await client.end().catch(() => {});
  process.exit(1);
});
