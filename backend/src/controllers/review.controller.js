const prisma = require("../config/prisma");
const { sendSuccess, sendError } = require("../utils/response");
const { createError, isAppError } = require("../utils/app-error");
const { mapReview, recalculateProductReviewStats } = require("../utils/review");

const parseRating = (rating) => {
  const parsed = Number(rating);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 5) {
    throw createError("Rating phải là số nguyên từ 1 đến 5", 400);
  }
  return parsed;
};

const normalizeComment = (comment) => {
  if (comment === undefined || comment === null) return null;
  const normalized = String(comment).trim();
  return normalized ? normalized : null;
};

const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        isActive: true,
      },
    });

    if (!product) {
      return sendError(res, "Không tìm thấy sản phẩm", 404);
    }

    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    });

    return sendSuccess(res, "Lấy danh sách đánh giá thành công", {
      items: reviews.map(mapReview),
      summary: {
        ratingAvg: product.ratingAvg,
        reviewCount: product.reviewCount,
      },
    });
  } catch (error) {
    console.error("Get product reviews error:", error);
    return sendError(res, "Lỗi server khi lấy đánh giá", 500);
  }
};

const createReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const rating = parseRating(req.body.rating);
    const comment = normalizeComment(req.body.comment);

    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        isActive: true,
      },
    });

    if (!product) {
      return sendError(res, "Không tìm thấy sản phẩm", 404);
    }

    const existingReview = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId,
        },
      },
    });

    if (existingReview) {
      return sendError(res, "Bạn đã đánh giá sản phẩm này rồi", 400);
    }

    const eligibleOrder = await prisma.order.findFirst({
      where: {
        userId: req.user.id,
        status: "delivered",
        items: {
          some: {
            productId,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!eligibleOrder) {
      return sendError(res, "Bạn chỉ có thể đánh giá sau khi đã nhận hàng", 400);
    }

    const result = await prisma.$transaction(async (tx) => {
      const createdReview = await tx.review.create({
        data: {
          userId: req.user.id,
          productId,
          orderId: eligibleOrder.id,
          rating,
          comment,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      const summary = await recalculateProductReviewStats(tx, productId);

      return {
        review: createdReview,
        summary,
      };
    });

    return sendSuccess(res, "Tạo đánh giá thành công", {
      review: mapReview(result.review),
      summary: result.summary,
    }, 201);
  } catch (error) {
    console.error("Create review error:", error);
    if (isAppError(error)) {
      return sendError(res, error.message, error.statusCode);
    }
    return sendError(res, "Lỗi server khi tạo đánh giá", 500);
  }
};

const updateMyReview = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {};

    if (req.body.rating !== undefined) {
      updateData.rating = parseRating(req.body.rating);
    }

    if (req.body.comment !== undefined) {
      updateData.comment = normalizeComment(req.body.comment);
    }

    if (Object.keys(updateData).length === 0) {
      return sendError(res, "Không có dữ liệu cần cập nhật", 400);
    }

    const existingReview = await prisma.review.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!existingReview) {
      return sendError(res, "Không tìm thấy đánh giá", 404);
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedReview = await tx.review.update({
        where: { id },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      const summary = await recalculateProductReviewStats(tx, existingReview.productId);

      return {
        review: updatedReview,
        summary,
      };
    });

    return sendSuccess(res, "Cập nhật đánh giá thành công", {
      review: mapReview(result.review),
      summary: result.summary,
    });
  } catch (error) {
    console.error("Update review error:", error);
    if (isAppError(error)) {
      return sendError(res, error.message, error.statusCode);
    }
    return sendError(res, "Lỗi server khi cập nhật đánh giá", 500);
  }
};

const deleteMyReview = async (req, res) => {
  try {
    const { id } = req.params;

    const existingReview = await prisma.review.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!existingReview) {
      return sendError(res, "Không tìm thấy đánh giá", 404);
    }

    const summary = await prisma.$transaction(async (tx) => {
      await tx.review.delete({
        where: { id },
      });

      return recalculateProductReviewStats(tx, existingReview.productId);
    });

    return sendSuccess(res, "Xóa đánh giá thành công", {
      summary,
    });
  } catch (error) {
    console.error("Delete review error:", error);
    return sendError(res, "Lỗi server khi xóa đánh giá", 500);
  }
};

// 🔥 LẤY NHỮNG SẢN PHẨM CÓ THỂ ĐÁNH GIÁ (đã mua + đã nhận)
const getEligibleProductsForReview = async (req, res) => {
  try {
    const userId = req.user.id;

    // Lấy những sản phẩm từ đơn hàng đã delivered
    const deliveredOrders = await prisma.order.findMany({
      where: {
        userId,
        status: "delivered",
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                image: true,
                price: true,
                ratingAvg: true,
                reviewCount: true,
                category: {
                  select: { name: true },
                },
              },
            },
          },
        },
      },
    });

    // Lấy những sản phẩm đã được đánh giá
    const reviewedProducts = await prisma.review.findMany({
      where: { userId },
      select: { productId: true },
    });

    const reviewedProductIds = new Set(reviewedProducts.map(r => r.productId));

    // Lọc những sản phẩm chưa được đánh giá
    const eligibleProducts = [];
    const seen = new Set();

    for (const order of deliveredOrders) {
      for (const item of order.items) {
        const productId = item.product.id;
        if (!seen.has(productId) && !reviewedProductIds.has(productId)) {
          eligibleProducts.push({
            ...item.product,
            orderId: order.id,
            orderCode: order.code,
          });
          seen.add(productId);
        }
      }
    }

    return sendSuccess(res, "Lấy danh sách sản phẩm cần đánh giá thành công", {
      items: eligibleProducts,
      count: eligibleProducts.length,
    });
  } catch (error) {
    console.error("Get eligible products error:", error);
    return sendError(res, "Lỗi server khi lấy danh sách sản phẩm", 500);
  }
};

module.exports = {
  getProductReviews,
  createReview,
  updateMyReview,
  deleteMyReview,
  getEligibleProductsForReview,
};
