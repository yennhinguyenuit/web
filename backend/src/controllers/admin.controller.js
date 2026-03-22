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
    stock: product.stock,
    badge: product.badge,
    image: product.image,
    ratingAvg: product.ratingAvg,
    reviewCount: product.reviewCount,
    isActive: product.isActive,
    category: product.category
      ? {
          id: product.category.id,
          name: product.category.name,
          slug: product.category.slug,
        }
      : null,
    images: product.images.map((img) => ({
      id: img.id,
      imageUrl: img.imageUrl,
      sortOrder: img.sortOrder,
    })),
    colors: product.colors.map((c) => c.colorName),
    sizes: product.sizes.map((s) => s.sizeName),
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
};

const getAdminProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
        colors: true,
        sizes: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return sendSuccess(
      res,
      "Lấy danh sách sản phẩm thành công",
      products.map(mapProduct)
    );
  } catch (error) {
    console.error("Get admin products error:", error);
    return sendError(res, "Lỗi server khi lấy sản phẩm", 500);
  }
};

const createProduct = async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      price,
      originalPrice,
      stock,
      badge,
      image,
      categoryId,
      colors = [],
      sizes = [],
      images = [],
    } = req.body;

    if (!name || !slug || !price || !categoryId) {
      return sendError(res, "Thiếu các trường bắt buộc", 400);
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return sendError(res, "Danh mục không tồn tại", 404);
    }

    const existingProduct = await prisma.product.findUnique({
      where: { slug },
    });

    if (existingProduct) {
      return sendError(res, "Slug sản phẩm đã tồn tại", 400);
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description: description || null,
        price,
        originalPrice: originalPrice || null,
        stock: Number(stock) || 0,
        badge: badge || null,
        image: image || null,
        categoryId,
        isActive: true,
        images: {
          create: images.map((img, index) => ({
            imageUrl: img.imageUrl || img,
            sortOrder: img.sortOrder ?? index + 1,
          })),
        },
        colors: {
          create: colors.map((color) => ({
            colorName: color,
          })),
        },
        sizes: {
          create: sizes.map((size) => ({
            sizeName: size,
          })),
        },
      },
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
        colors: true,
        sizes: true,
      },
    });

    return sendSuccess(res, "Tạo sản phẩm thành công", mapProduct(product), 201);
  } catch (error) {
    console.error("Create product error:", error);
    return sendError(res, "Lỗi server khi tạo sản phẩm", 500);
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      slug,
      description,
      price,
      originalPrice,
      stock,
      badge,
      image,
      categoryId,
      isActive,
      colors,
      sizes,
      images,
    } = req.body;

    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        colors: true,
        sizes: true,
      },
    });

    if (!existingProduct) {
      return sendError(res, "Không tìm thấy sản phẩm", 404);
    }

    if (slug && slug !== existingProduct.slug) {
      const slugExists = await prisma.product.findUnique({
        where: { slug },
      });

      if (slugExists) {
        return sendError(res, "Slug sản phẩm đã tồn tại", 400);
      }
    }

    const updatedProduct = await prisma.$transaction(async (tx) => {
      if (Array.isArray(images)) {
        await tx.productImage.deleteMany({
          where: { productId: id },
        });
      }

      if (Array.isArray(colors)) {
        await tx.productColor.deleteMany({
          where: { productId: id },
        });
      }

      if (Array.isArray(sizes)) {
        await tx.productSize.deleteMany({
          where: { productId: id },
        });
      }

      await tx.product.update({
        where: { id },
        data: {
          name: name ?? existingProduct.name,
          slug: slug ?? existingProduct.slug,
          description: description ?? existingProduct.description,
          price: price ?? existingProduct.price,
          originalPrice:
            originalPrice !== undefined
              ? originalPrice
              : existingProduct.originalPrice,
          stock: stock !== undefined ? Number(stock) : existingProduct.stock,
          badge: badge !== undefined ? badge : existingProduct.badge,
          image: image !== undefined ? image : existingProduct.image,
          categoryId: categoryId ?? existingProduct.categoryId,
          isActive:
            typeof isActive === "boolean" ? isActive : existingProduct.isActive,
        },
      });

      if (Array.isArray(images) && images.length > 0) {
        await tx.productImage.createMany({
          data: images.map((img, index) => ({
            productId: id,
            imageUrl: img.imageUrl || img,
            sortOrder: img.sortOrder ?? index + 1,
          })),
        });
      }

      if (Array.isArray(colors) && colors.length > 0) {
        await tx.productColor.createMany({
          data: colors.map((color) => ({
            productId: id,
            colorName: color,
          })),
        });
      }

      if (Array.isArray(sizes) && sizes.length > 0) {
        await tx.productSize.createMany({
          data: sizes.map((size) => ({
            productId: id,
            sizeName: size,
          })),
        });
      }

      return tx.product.findUnique({
        where: { id },
        include: {
          category: true,
          images: { orderBy: { sortOrder: "asc" } },
          colors: true,
          sizes: true,
        },
      });
    });

    return sendSuccess(
      res,
      "Cập nhật sản phẩm thành công",
      mapProduct(updatedProduct)
    );
  } catch (error) {
    console.error("Update product error:", error);
    return sendError(res, "Lỗi server khi cập nhật sản phẩm", 500);
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return sendError(res, "Không tìm thấy sản phẩm", 404);
    }

    await prisma.product.delete({
      where: { id },
    });

    return sendSuccess(res, "Xóa sản phẩm thành công", null);
  } catch (error) {
    console.error("Delete product error:", error);
    return sendError(res, "Lỗi server khi xóa sản phẩm", 500);
  }
};

const getAdminOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: true,
        paymentMethod: true,
        shippingMethod: true,
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const data = orders.map((order) => ({
      id: order.id,
      code: order.code,
      customer: order.user
        ? {
            id: order.user.id,
            name: order.user.name,
            email: order.user.email,
            phone: order.user.phone,
          }
        : null,
      total: Number(order.total),
      status: order.status,
      paymentStatus: order.paymentStatus,
      itemCount: order.items.length,
      paymentMethod: order.paymentMethod?.name || null,
      shippingMethod: order.shippingMethod?.name || null,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }));

    return sendSuccess(res, "Lấy danh sách đơn hàng thành công", data);
  } catch (error) {
    console.error("Get admin orders error:", error);
    return sendError(res, "Lỗi server khi lấy đơn hàng", 500);
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;

    const existingOrder = await prisma.order.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      return sendError(res, "Không tìm thấy đơn hàng", 404);
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: status ?? existingOrder.status,
        paymentStatus: paymentStatus ?? existingOrder.paymentStatus,
      },
      include: {
        user: true,
        paymentMethod: true,
        shippingMethod: true,
        items: true,
      },
    });

    return sendSuccess(res, "Cập nhật trạng thái đơn hàng thành công", {
      id: updatedOrder.id,
      code: updatedOrder.code,
      status: updatedOrder.status,
      paymentStatus: updatedOrder.paymentStatus,
      updatedAt: updatedOrder.updatedAt,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    return sendError(res, "Lỗi server khi cập nhật trạng thái đơn hàng", 500);
  }
};

const getAdminDashboard = async (req, res) => {
  try {
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalCategories,
      latestOrders,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.category.count(),
      prisma.order.findMany({
        take: 5,
        include: {
          user: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);

    const revenueAgg = await prisma.order.aggregate({
      _sum: {
        total: true,
      },
    });

    return sendSuccess(res, "Lấy dashboard thành công", {
      totalUsers,
      totalProducts,
      totalOrders,
      totalCategories,
      totalRevenue: revenueAgg._sum.total ? Number(revenueAgg._sum.total) : 0,
      latestOrders: latestOrders.map((order) => ({
        id: order.id,
        code: order.code,
        customerName: order.user?.name || null,
        total: Number(order.total),
        status: order.status,
        createdAt: order.createdAt,
      })),
    });
  } catch (error) {
    console.error("Get admin dashboard error:", error);
    return sendError(res, "Lỗi server khi lấy dashboard", 500);
  }
};

module.exports = {
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAdminOrders,
  updateOrderStatus,
  getAdminDashboard,
};