const prisma = require("../config/prisma");
const { sendSuccess, sendError } = require("../utils/response");

const getShippingMethods = async (req, res) => {
  try {
    const methods = await prisma.shippingMethod.findMany({
      orderBy: { createdAt: "asc" },
    });

    return sendSuccess(
      res,
      "Lấy phương thức vận chuyển thành công",
      methods.map((item) => ({
        id: item.id,
        code: item.code,
        name: item.name,
        price: Number(item.price),
        estimatedDays: item.estimatedDays,
        description: item.description,
      }))
    );
  } catch (error) {
    console.error("Get shipping methods error:", error);
    return sendError(res, "Lỗi server khi lấy phương thức vận chuyển", 500);
  }
};

module.exports = {
  getShippingMethods,
};