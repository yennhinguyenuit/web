const prisma = require("../config/prisma");
const { sendSuccess, sendError } = require("../utils/response");

const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return sendSuccess(
      res,
      "Lấy danh sách danh mục thành công",
      categories
    );
  } catch (error) {
    console.error("Get categories error:", error);
    return sendError(res, "Lỗi server khi lấy danh mục", 500);
  }
};

module.exports = {
  getCategories,
};