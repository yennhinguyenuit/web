const mapReview = (review) => ({
  id: review.id,
  rating: review.rating,
  comment: review.comment,
  createdAt: review.createdAt,
  updatedAt: review.updatedAt,
  user: review.user
    ? {
        id: review.user.id,
        name: review.user.name,
      }
    : null,
  productId: review.productId,
  orderId: review.orderId,
});

const recalculateProductReviewStats = async (prismaClient, productId) => {
  const stats = await prismaClient.review.aggregate({
    where: { productId },
    _avg: { rating: true },
    _count: { id: true },
  });

  const ratingAvg = stats._avg.rating ? Number(Number(stats._avg.rating).toFixed(1)) : 0;
  const reviewCount = stats._count.id || 0;

  await prismaClient.product.update({
    where: { id: productId },
    data: {
      ratingAvg,
      reviewCount,
    },
  });

  return { ratingAvg, reviewCount };
};

module.exports = {
  mapReview,
  recalculateProductReviewStats,
};
