const prisma = require("../config/prisma");
const { sendSuccess, sendError } = require("../utils/response");

const mapWishlistItem = (item) => ({
  id: item.id,
  createdAt: item.createdAt,
  product: {
    id: item.product.id,
    name: item.product.name,
    slug: item.product.slug,
    price: Number(item.product.price),
    originalPrice: item.product.originalPrice ? Number(item.product.originalPrice) : null,
    image: item.product.image || item.product.images[0]?.imageUrl || null,
    badge: item.product.badge,
    stock: item.product.stock,
    isActive: item.product.isActive,
    rating: item.product.ratingAvg,
    reviewCount: item.product.reviewCount,
  },
});

const getWishlist = async (req, res) => {
  try {
    const wishlist = await prisma.wishlist.findMany({
      where: { userId: req.user.id },
      include: {
        product: {
          include: {
            images: {
              orderBy: { sortOrder: "asc" },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return sendSuccess(res, "Lấy wishlist thành công", {
      items: wishlist.map(mapWishlistItem),
      totalItems: wishlist.length,
    });
  } catch (error) {
    console.error("Get wishlist error:", error);
    return sendError(res, "Lỗi server khi lấy wishlist", 500);
  }
};

const addWishlistItem = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return sendError(res, "Thiếu productId", 400);
    }

    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        isActive: true,
      },
    });

    if (!product) {
      return sendError(res, "Sản phẩm không tồn tại", 404);
    }

    await prisma.wishlist.upsert({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId,
        },
      },
      update: {},
      create: {
        userId: req.user.id,
        productId,
      },
    });

    const wishlistItem = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId,
        },
      },
      include: {
        product: {
          include: {
            images: {
              orderBy: { sortOrder: "asc" },
            },
          },
        },
      },
    });

    return sendSuccess(res, "Đã thêm sản phẩm vào wishlist", mapWishlistItem(wishlistItem), 201);
  } catch (error) {
    console.error("Add wishlist item error:", error);
    return sendError(res, "Lỗi server khi thêm wishlist", 500);
  }
};

const removeWishlistItem = async (req, res) => {
  try {
    const { productId } = req.params;

    const existingItem = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId,
        },
      },
    });

    if (!existingItem) {
      return sendError(res, "Sản phẩm chưa có trong wishlist", 404);
    }

    await prisma.wishlist.delete({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId,
        },
      },
    });

    return sendSuccess(res, "Đã xóa sản phẩm khỏi wishlist", null);
  } catch (error) {
    console.error("Remove wishlist item error:", error);
    return sendError(res, "Lỗi server khi xóa wishlist", 500);
  }
};

module.exports = {
  getWishlist,
  addWishlistItem,
  removeWishlistItem,
};
