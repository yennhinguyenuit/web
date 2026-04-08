const prisma = require('../config/prisma');

const ORDER_STATUSES = ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'];
const PAYMENT_STATUSES = ['unpaid', 'pending', 'paid', 'failed', 'expired', 'refunded'];
const normalizeStringArray = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || '').trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const resolveCategoryId = async ({ categoryId, categorySlug }) => {
  if (categoryId) return categoryId;

  if (categorySlug) {
    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
      select: { id: true },
    });
    if (category) return category.id;
  }

  const fallbackCategory = await prisma.category.findFirst({
    orderBy: { createdAt: 'asc' },
    select: { id: true },
  });

  return fallbackCategory?.id || null;
};
const normalizeImageArray = (image, images) => {
  if (Array.isArray(images) && images.length) {
    return images.filter(Boolean);
  }

  if (typeof image === 'string' && image.trim()) {
    return [image.trim()];
  }

  return [];
};

const mapAdminProduct = (product) => ({
  ...product,
  price: Number(product.price || 0),
  category: product.category || null,
  image: product.image || product.images?.[0]?.imageUrl || '',
  images: (product.images || []).map((item) => item.imageUrl),
  colors: (product.colors || []).map((item) => item.colorName),
  sizes: (product.sizes || []).map((item) => item.sizeName),
});

const mapAdminOrder = (order) => ({
  id: order.id,
  code: order.code,
  status: order.status,
  paymentStatus: order.paymentStatus,
  total: Number(order.total || 0),
  createdAt: order.createdAt,
  updatedAt: order.updatedAt,
  customer: order.user
    ? {
        id: order.user.id,
        name: order.user.name,
        email: order.user.email,
      }
    : null,
  paymentMethod: order.paymentMethod?.name || order.paymentMethodName || '',
  shippingMethod: order.shippingMethod?.name || order.shippingMethodName || '',
  items: (order.items || []).map((item) => ({
    id: item.id,
    quantity: item.quantity,
    price: Number(item.unitPrice || item.price || 0),
    color: item.color || '',
    size: item.size || '',
    product: item.product
      ? {
          id: item.product.id,
          name: item.product.name || item.productName || 'Sản phẩm đã xóa',
          slug: item.product.slug || '',
          image: item.product.image || item.productImage || item.product.images?.[0]?.imageUrl || '',
        }
      : {
          id: item.productId,
          name: item.productName || 'Sản phẩm đã xóa',
          slug: '',
          image: item.productImage || '',
        },
  })),
});

const getAdminOrderInclude = () => ({
  user: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  paymentMethod: {
    select: {
      id: true,
      name: true,
    },
  },
  shippingMethod: {
    select: {
      id: true,
      name: true,
    },
  },
  items: {
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          image: true,
          images: {
            orderBy: { sortOrder: 'asc' },
            select: { imageUrl: true },
          },
        },
      },
    },
  },
});

const getAdminOrderById = async (id) => {
  const order = await prisma.order.findUnique({
    where: { id },
    include: getAdminOrderInclude(),
  });

  return order ? mapAdminOrder(order) : null;
};

exports.getDashboard = async (req, res) => {
  try {
    const [totalUsers, totalProducts, totalOrders, revenueAgg, latestOrders] = await Promise.all([
      prisma.user.count(),
      prisma.product.count({
        where: { isActive: true, isDeleted: false },
      }),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: {
          total: true,
        },
        where: {
          paymentStatus: 'paid',
        },
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
    ]);

    return res.json({
      success: true,
      data: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: Number(revenueAgg?._sum?.total || 0),
        latestOrders: latestOrders.map((order) => ({
          id: order.id,
          code: order.code,
          total: Number(order.total || 0),
          status: order.status,
          customerName: order.user?.name || 'Không rõ khách hàng',
          createdAt: order.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error('getDashboard error:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể tải dashboard',
    });
  }
};

exports.getAdminProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        colors: true,
        sizes: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.json({
      success: true,
      data: products.map(mapAdminProduct),
    });
  } catch (error) {
    console.error('getAdminProducts error:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể tải danh sách sản phẩm',
    });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      slug,
      sku,
      price,
      stock,
      image,
      images,
      shortDescription,
      description,
      isActive,
      categoryId,
      categorySlug,
      colors,
      sizes,
    } = req.body;

    if (!name || !slug || price === undefined || price === null) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc: name, slug, price',
      });
    }

    const existingSlug = await prisma.product.findFirst({
      where: {
        slug: String(slug).trim(),
        isDeleted: false,
      },
      select: { id: true },
    });

    if (existingSlug) {
      return res.status(400).json({
        success: false,
        message: 'Slug sản phẩm đã tồn tại',
      });
    }

    if (sku) {
      const existingSku = await prisma.product.findFirst({
        where: {
          sku: String(sku).trim(),
          isDeleted: false,
        },
        select: { id: true },
      });

      if (existingSku) {
        return res.status(400).json({
          success: false,
          message: 'SKU sản phẩm đã tồn tại',
        });
      }
    }

    const finalCategoryId = await resolveCategoryId({ categoryId, categorySlug });

    if (!finalCategoryId) {
      return res.status(400).json({
        success: false,
        message: 'Không tìm thấy danh mục để gán cho sản phẩm',
      });
    }

    const imageList = normalizeImageArray(image, images);
    const colorList = normalizeStringArray(colors);
    const sizeList = normalizeStringArray(sizes);

    const product = await prisma.product.create({
      data: {
        name: String(name).trim(),
        slug: String(slug).trim(),
        sku: sku ? String(sku).trim() : null,
        shortDescription: shortDescription || '',
        description: description || '',
        price: Number(price || 0),
        stock: Number(stock || 0),
        image: typeof image === 'string' ? image.trim() : '',
        isActive: typeof isActive === 'boolean' ? isActive : true,
        isDeleted: false,
        categoryId: finalCategoryId,
        images: {
          create: imageList.map((imageUrl, index) => ({
            imageUrl,
            sortOrder: index + 1,
          })),
        },
        colors: {
          create: colorList.map((colorName) => ({ colorName })),
        },
        sizes: {
          create: sizeList.map((sizeName) => ({ sizeName })),
        },
      },
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
        colors: true,
        sizes: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Thêm sản phẩm thành công',
      data: mapAdminProduct(product),
    });
  } catch (error) {
    console.error('createProduct error:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể thêm sản phẩm',
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      slug,
      sku,
      price,
      stock,
      image,
      images,
      shortDescription,
      description,
      isActive,
      categoryId,
      categorySlug,
      colors,
      sizes,
    } = req.body;

    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        colors: true,
        sizes: true,
        category: true,
      },
    });

    if (!existingProduct || existingProduct.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm',
      });
    }

    if (slug && slug !== existingProduct.slug) {
      const duplicateSlug = await prisma.product.findFirst({
        where: {
          slug: String(slug).trim(),
          isDeleted: false,
          id: { not: id },
        },
        select: { id: true },
      });

      if (duplicateSlug) {
        return res.status(400).json({
          success: false,
          message: 'Slug sản phẩm đã tồn tại',
        });
      }
    }

    if (sku && sku !== existingProduct.sku) {
      const duplicateSku = await prisma.product.findFirst({
        where: {
          sku: String(sku).trim(),
          isDeleted: false,
          id: { not: id },
        },
        select: { id: true },
      });

      if (duplicateSku) {
        return res.status(400).json({
          success: false,
          message: 'SKU sản phẩm đã tồn tại',
        });
      }
    }

    let finalCategoryId = existingProduct.categoryId;
    if (categoryId !== undefined || categorySlug !== undefined) {
      finalCategoryId = await resolveCategoryId({ categoryId, categorySlug });
    }

    const nextImage =
      image !== undefined
        ? String(image || '').trim()
        : existingProduct.image || existingProduct.images?.[0]?.imageUrl || '';

    const shouldReplaceImages = image !== undefined || images !== undefined;
    const shouldReplaceColors = colors !== undefined;
    const shouldReplaceSizes = sizes !== undefined;

    const imageList = shouldReplaceImages
      ? normalizeImageArray(nextImage, images)
      : existingProduct.images.map((item) => item.imageUrl);

    const colorList = shouldReplaceColors
      ? normalizeStringArray(colors)
      : existingProduct.colors.map((item) => item.colorName);

    const sizeList = shouldReplaceSizes
      ? normalizeStringArray(sizes)
      : existingProduct.sizes.map((item) => item.sizeName);

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name: String(name).trim() } : {}),
        ...(slug !== undefined ? { slug: String(slug).trim() } : {}),
        ...(sku !== undefined ? { sku: sku ? String(sku).trim() : null } : {}),
        ...(shortDescription !== undefined ? { shortDescription } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(price !== undefined ? { price: Number(price || 0) } : {}),
        ...(stock !== undefined ? { stock: Number(stock || 0) } : {}),
        ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
        image: nextImage,
        categoryId: finalCategoryId,
        ...(shouldReplaceImages
          ? {
              images: {
                deleteMany: {},
                create: imageList.map((imageUrl, index) => ({
                  imageUrl,
                  sortOrder: index + 1,
                })),
              },
            }
          : {}),
        ...(shouldReplaceColors
          ? {
              colors: {
                deleteMany: {},
                create: colorList.map((colorName) => ({ colorName })),
              },
            }
          : {}),
        ...(shouldReplaceSizes
          ? {
              sizes: {
                deleteMany: {},
                create: sizeList.map((sizeName) => ({ sizeName })),
              },
            }
          : {}),
      },
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
        colors: true,
        sizes: true,
      },
    });

    return res.json({
      success: true,
      message: 'Cập nhật sản phẩm thành công',
      data: mapAdminProduct(updatedProduct),
    });
  } catch (error) {
    console.error('updateProduct error:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể cập nhật sản phẩm',
    });
  }
};


exports.toggleProductVisibility = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isActive phải là true hoặc false',
      });
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id },
      select: { id: true, name: true, isDeleted: true },
    });

    if (!existingProduct || existingProduct.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm để cập nhật hiển thị',
      });
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { isActive },
    });

    return res.json({
      success: true,
      message: isActive ? 'Đã hiển thị sản phẩm' : 'Đã ẩn sản phẩm',
      data: {
        id: updatedProduct.id,
        isActive: updatedProduct.isActive,
      },
    });
  } catch (error) {
    console.error('toggleProductVisibility error:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể cập nhật trạng thái hiển thị sản phẩm',
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const existingProduct = await prisma.product.findUnique({
      where: { id },
      select: { id: true, name: true, isDeleted: true },
    });

    if (!existingProduct || existingProduct.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm',
      });
    }

    await prisma.product.update({
      where: { id },
      data: {
        isActive: false,
        isDeleted: true,
      },
    });

    return res.json({
      success: true,
      message: 'Đã xóa sản phẩm',
    });
  } catch (error) {
    console.error('deleteProduct error:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể xóa sản phẩm',
    });
  }
};


exports.getAdminCustomers = async (req, res) => {
  try {
    const customers = await prisma.user.findMany({
      where: {
        orders: {
          some: {},
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        orders: {
          orderBy: {
            createdAt: 'desc',
          },
          select: {
            id: true,
            code: true,
            total: true,
            paymentStatus: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.json({
      success: true,
      data: customers.map((customer) => {
        const paidOrders = customer.orders.filter((order) => order.paymentStatus === 'paid');
        return {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          orderCount: customer.orders.length,
          paidOrderCount: paidOrders.length,
          totalSpent: paidOrders.reduce((sum, order) => sum + Number(order.total || 0), 0),
          latestOrderCode: customer.orders[0]?.code || '',
          lastOrderAt: customer.orders[0]?.createdAt || null,
          createdAt: customer.createdAt,
        };
      }),
    });
  } catch (error) {
    console.error('getAdminCustomers error:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể tải danh sách khách hàng',
    });
  }
};

exports.getAdminOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: getAdminOrderInclude(),
    });

    return res.json({
      success: true,
      data: orders.map(mapAdminOrder),
    });
  } catch (error) {
    console.error('getAdminOrders error:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể tải danh sách đơn hàng',
    });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;

    const existingOrder = await prisma.order.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng',
      });
    }

    const data = {};

    if (status !== undefined) {
      if (!ORDER_STATUSES.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Trạng thái đơn hàng không hợp lệ',
        });
      }
      data.status = status;
    }

    if (paymentStatus !== undefined) {
      if (!PAYMENT_STATUSES.includes(paymentStatus)) {
        return res.status(400).json({
          success: false,
          message: 'Trạng thái thanh toán không hợp lệ',
        });
      }
      data.paymentStatus = paymentStatus;
    }

    if (!Object.keys(data).length) {
      return res.status(400).json({
        success: false,
        message: 'Không có dữ liệu cần cập nhật',
      });
    }

    await prisma.order.update({
      where: { id },
      data,
      select: { id: true },
    });

    const updatedOrder = await getAdminOrderById(id);

    return res.json({
      success: true,
      message: 'Cập nhật đơn hàng thành công',
      data: updatedOrder,
    });
  } catch (error) {
    console.error('updateOrderStatus error:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể cập nhật trạng thái đơn hàng',
    });
  }
};
