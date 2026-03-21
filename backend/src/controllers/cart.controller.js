const prisma = require("../config/prisma");
const { sendSuccess, sendError } = require("../utils/response");

const formatCart = (cart) => {
  const items = cart.items.map((item) => {
    const unitPrice = Number(item.unitPrice);
    const quantity = item.quantity;
    const subTotal = unitPrice * quantity;

    return {
      id: item.id,
      productId: item.productId,
      name: item.product.name,
      slug: item.product.slug,
      thumbnail:
        item.product.image ||
        (item.product.images[0] ? item.product.images[0].imageUrl : null),
      price: unitPrice,
      quantity,
      color: item.color,
      size: item.size,
      stock: item.product.stock,
      subTotal,
    };
  });

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.subTotal, 0);

  return {
    id: cart.id,
    items,
    totalQuantity,
    totalAmount,
  };
};

const getOrCreateCart = async (userId) => {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: {
                orderBy: { sortOrder: "asc" },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        userId,
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  orderBy: { sortOrder: "asc" },
                },
              },
            },
          },
        },
      },
    });
  }

  return cart;
};

const getCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    return sendSuccess(res, "Lấy giỏ hàng thành công", formatCart(cart));
  } catch (error) {
    console.error("Get cart error:", error);
    return sendError(res, "Lỗi server khi lấy giỏ hàng", 500);
  }
};

const addCartItem = async (req, res) => {
  try {
    const { productId, quantity = 1, color = null, size = null } = req.body;

    if (!productId) {
      return sendError(res, "Thiếu productId", 400);
    }

    const parsedQuantity = Number(quantity);
    if (Number.isNaN(parsedQuantity) || parsedQuantity <= 0) {
      return sendError(res, "Số lượng không hợp lệ", 400);
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || !product.isActive) {
      return sendError(res, "Sản phẩm không tồn tại", 404);
    }

    if (product.stock < parsedQuantity) {
      return sendError(res, "Số lượng vượt quá tồn kho", 400);
    }

    const result = await prisma.$transaction(async (tx) => {
      let cart = await tx.cart.findUnique({
        where: { userId: req.user.id },
      });

      if (!cart) {
        cart = await tx.cart.create({
          data: { userId: req.user.id },
        });
      }

      const existingItem = await tx.cartItem.findFirst({
        where: {
          cartId: cart.id,
          productId,
          color,
          size,
        },
      });

      if (existingItem) {
        const newQuantity = existingItem.quantity + parsedQuantity;

        if (newQuantity > product.stock) {
          throw new Error("Số lượng vượt quá tồn kho");
        }

        await tx.cartItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: newQuantity,
          },
        });
      } else {
        await tx.cartItem.create({
          data: {
            cartId: cart.id,
            productId,
            quantity: parsedQuantity,
            color,
            size,
            unitPrice: product.price,
          },
        });
      }

      return tx.cart.findUnique({
        where: { id: cart.id },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: {
                    orderBy: { sortOrder: "asc" },
                  },
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });
    });

    return sendSuccess(
      res,
      "Thêm sản phẩm vào giỏ hàng thành công",
      formatCart(result)
    );
  } catch (error) {
    console.error("Add cart item error:", error);
    return sendError(res, error.message || "Lỗi server khi thêm vào giỏ hàng", 500);
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    const parsedQuantity = Number(quantity);
    if (Number.isNaN(parsedQuantity) || parsedQuantity <= 0) {
      return sendError(res, "Số lượng không hợp lệ", 400);
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
    });

    if (!cart) {
      return sendError(res, "Không tìm thấy giỏ hàng", 404);
    }

    const item = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cartId: cart.id,
      },
      include: {
        product: true,
      },
    });

    if (!item) {
      return sendError(res, "Không tìm thấy sản phẩm trong giỏ hàng", 404);
    }

    if (parsedQuantity > item.product.stock) {
      return sendError(res, "Số lượng vượt quá tồn kho", 400);
    }

    await prisma.cartItem.update({
      where: { id: itemId },
      data: {
        quantity: parsedQuantity,
      },
    });

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  orderBy: { sortOrder: "asc" },
                },
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    return sendSuccess(
      res,
      "Cập nhật giỏ hàng thành công",
      formatCart(updatedCart)
    );
  } catch (error) {
    console.error("Update cart item error:", error);
    return sendError(res, "Lỗi server khi cập nhật giỏ hàng", 500);
  }
};

const removeCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
    });

    if (!cart) {
      return sendError(res, "Không tìm thấy giỏ hàng", 404);
    }

    const item = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cartId: cart.id,
      },
    });

    if (!item) {
      return sendError(res, "Không tìm thấy sản phẩm trong giỏ hàng", 404);
    }

    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  orderBy: { sortOrder: "asc" },
                },
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    return sendSuccess(
      res,
      "Xóa sản phẩm khỏi giỏ hàng thành công",
      formatCart(updatedCart)
    );
  } catch (error) {
    console.error("Remove cart item error:", error);
    return sendError(res, "Lỗi server khi xóa sản phẩm khỏi giỏ hàng", 500);
  }
};

const clearCart = async (req, res) => {
  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
    });

    if (!cart) {
      return sendSuccess(res, "Giỏ hàng đã trống", {
        items: [],
        totalQuantity: 0,
        totalAmount: 0,
      });
    }

    await prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
      },
    });

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  orderBy: { sortOrder: "asc" },
                },
              },
            },
          },
        },
      },
    });

    return sendSuccess(
      res,
      "Đã xóa toàn bộ giỏ hàng",
      formatCart(updatedCart)
    );
  } catch (error) {
    console.error("Clear cart error:", error);
    return sendError(res, "Lỗi server khi xóa giỏ hàng", 500);
  }
};

module.exports = {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
};