const prisma = require("../config/prisma");
const { sendSuccess, sendError } = require("../utils/response");

const mapProduct = (product) => {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: Number(product.price),
    originalPrice: product.originalPrice
      ? Number(product.originalPrice)
      : null,
    image: product.image || (product.images[0] ? product.images[0].imageUrl : null),
    images: product.images.map((img) => img.imageUrl),
    category: product.category
      ? {
          id: product.category.id,
          name: product.category.name,
          slug: product.category.slug,
        }
      : null,
    stock: product.stock,
    badge: product.badge,
    rating: product.ratingAvg,
    reviewCount: product.reviewCount,
    colors: product.colors.map((c) => c.colorName),
    sizes: product.sizes.map((s) => s.sizeName),
    isActive: product.isActive,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
};

const getProducts = async (req, res) => {
  try {
    const {
      search = "",
      category = "",
      minPrice,
      maxPrice,
      sort = "newest",
      page = 1,
      limit = 12,
    } = req.query;

    const currentPage = Math.max(Number(page) || 1, 1);
    const pageSize = Math.min(Math.max(Number(limit) || 12, 1), 50);
    const skip = (currentPage - 1) * pageSize;

    const parsedMinPrice =
      minPrice !== undefined && minPrice !== null && minPrice !== ""
        ? Number(minPrice)
        : null;

    const parsedMaxPrice =
      maxPrice !== undefined && maxPrice !== null && maxPrice !== ""
        ? Number(maxPrice)
        : null;

    if (
      (parsedMinPrice !== null && Number.isNaN(parsedMinPrice)) ||
      (parsedMaxPrice !== null && Number.isNaN(parsedMaxPrice))
    ) {
      return sendError(res, "Khoảng giá không hợp lệ", 400);
    }

    if (
      parsedMinPrice !== null &&
      parsedMaxPrice !== null &&
      parsedMinPrice > parsedMaxPrice
    ) {
      return sendError(res, "Khoảng giá không hợp lệ", 400);
    }

    const where = {
      isActive: true,
    };

    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    if (category) {
      where.category = {
        OR: [
          {
            slug: {
              contains: category,
              mode: "insensitive",
            },
          },
          {
            name: {
              contains: category,
              mode: "insensitive",
            },
          },
        ],
      };
    }

    if (parsedMinPrice !== null || parsedMaxPrice !== null) {
      where.price = {};
      if (parsedMinPrice !== null) where.price.gte = parsedMinPrice;
      if (parsedMaxPrice !== null) where.price.lte = parsedMaxPrice;
    }

    let orderBy = { createdAt: "desc" };

    if (sort === "price_asc") {
      orderBy = { price: "asc" };
    } else if (sort === "price_desc") {
      orderBy = { price: "desc" };
    } else if (sort === "rating_desc") {
      orderBy = { ratingAvg: "desc" };
    } else if (sort === "newest") {
      orderBy = { createdAt: "desc" };
    }

    const [products, totalItems] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          images: {
            orderBy: {
              sortOrder: "asc",
            },
          },
          colors: true,
          sizes: true,
        },
        orderBy,
        skip,
        take: pageSize,
      }),
      prisma.product.count({ where }),
    ]);

    const items = products.map(mapProduct);

    return sendSuccess(res, "Lấy danh sách sản phẩm thành công", {
      items,
      pagination: {
        page: currentPage,
        limit: pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
      },
    });
  } catch (error) {
    console.error("Get products error:", error);
    return sendError(res, "Lỗi server khi lấy sản phẩm", 500);
  }
};

const getProductDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findFirst({
      where: {
        id,
        isActive: true,
      },
      include: {
        category: true,
        images: {
          orderBy: {
            sortOrder: "asc",
          },
        },
        colors: true,
        sizes: true,
      },
    });

    if (!product) {
      return sendError(res, "Không tìm thấy sản phẩm", 404);
    }

    return sendSuccess(
      res,
      "Lấy chi tiết sản phẩm thành công",
      mapProduct(product)
    );
  } catch (error) {
    console.error("Get product detail error:", error);
    return sendError(res, "Lỗi server khi lấy chi tiết sản phẩm", 500);
  }
};

module.exports = {
  getProducts,
  getProductDetail,
};