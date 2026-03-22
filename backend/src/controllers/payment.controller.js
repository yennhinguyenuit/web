const prisma = require("../config/prisma");
const { sendSuccess, sendError } = require("../utils/response");

const getPaymentMethods = async (req, res) => {
  try {
    const methods = await prisma.paymentMethod.findMany({
      orderBy: { createdAt: "asc" },
    });

    return sendSuccess(
      res,
      "Lấy phương thức thanh toán thành công",
      methods.map((item) => ({
        id: item.id,
        code: item.code,
        name: item.name,
        description: item.description,
      }))
    );
  } catch (error) {
    console.error("Get payment methods error:", error);
    return sendError(res, "Lỗi server khi lấy phương thức thanh toán", 500);
  }
};

module.exports = {
  getPaymentMethods,
};