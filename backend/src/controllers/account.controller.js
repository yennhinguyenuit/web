const prisma = require("../config/prisma");
const { sendSuccess, sendError } = require("../utils/response");

const buildDefaultAddressText = (addressObj) => {
  if (!addressObj) return null;
  return `${addressObj.address}, ${addressObj.ward}, ${addressObj.district}, ${addressObj.city}`;
};

const formatProfile = (user) => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    defaultAddress: user.defaultAddress,
    role: user.role ? user.role.name : null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { role: true },
    });

    if (!user) {
      return sendError(res, "Không tìm thấy người dùng", 404);
    }

    return sendSuccess(
      res,
      "Lấy thông tin tài khoản thành công",
      formatProfile(user)
    );
  } catch (error) {
    console.error("Get profile error:", error);
    return sendError(res, "Lỗi server khi lấy thông tin tài khoản", 500);
  }
};

const updateProfile = async (req, res) => {
  try {
    const currentUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { role: true },
    });

    if (!currentUser) {
      return sendError(res, "Không tìm thấy người dùng", 404);
    }

    const { name, phone, defaultAddress } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name: name ?? currentUser.name,
        phone: phone ?? currentUser.phone,
        defaultAddress: defaultAddress ?? currentUser.defaultAddress,
      },
      include: { role: true },
    });

    return sendSuccess(
      res,
      "Cập nhật thông tin tài khoản thành công",
      formatProfile(user)
    );
  } catch (error) {
    console.error("Update profile error:", error);
    return sendError(res, "Lỗi server khi cập nhật tài khoản", 500);
  }
};

const getAddresses = async (req, res) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return sendSuccess(res, "Lấy danh sách địa chỉ thành công", addresses);
  } catch (error) {
    console.error("Get addresses error:", error);
    return sendError(res, "Lỗi server khi lấy địa chỉ", 500);
  }
};

const createAddress = async (req, res) => {
  try {
    const {
      name,
      phone,
      address,
      city,
      district,
      ward,
      isDefault = false,
    } = req.body;

    if (!name || !phone || !address || !city || !district || !ward) {
      return sendError(res, "Vui lòng nhập đầy đủ thông tin địa chỉ", 400);
    }

    const createdAddress = await prisma.$transaction(async (tx) => {
      const addressCount = await tx.address.count({
        where: { userId: req.user.id },
      });

      const shouldBeDefault = addressCount === 0 ? true : isDefault;

      if (shouldBeDefault) {
        await tx.address.updateMany({
          where: { userId: req.user.id },
          data: { isDefault: false },
        });
      }

      const newAddress = await tx.address.create({
        data: {
          userId: req.user.id,
          name,
          phone,
          address,
          city,
          district,
          ward,
          isDefault: shouldBeDefault,
        },
      });

      if (shouldBeDefault) {
        await tx.user.update({
          where: { id: req.user.id },
          data: {
            defaultAddress: buildDefaultAddressText(newAddress),
          },
        });
      }

      return newAddress;
    });

    return sendSuccess(res, "Tạo địa chỉ thành công", createdAddress, 201);
  } catch (error) {
    console.error("Create address error:", error);
    return sendError(res, "Lỗi server khi tạo địa chỉ", 500);
  }
};

const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, address, city, district, ward, isDefault } = req.body;

    const existingAddress = await prisma.address.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!existingAddress) {
      return sendError(res, "Không tìm thấy địa chỉ", 404);
    }

    if (existingAddress.isDefault && isDefault === false) {
      return sendError(
        res,
        "Không thể bỏ mặc định của địa chỉ này. Hãy chọn địa chỉ khác làm mặc định trước.",
        400
      );
    }

    const finalData = {
      name: name ?? existingAddress.name,
      phone: phone ?? existingAddress.phone,
      address: address ?? existingAddress.address,
      city: city ?? existingAddress.city,
      district: district ?? existingAddress.district,
      ward: ward ?? existingAddress.ward,
    };

    const updatedAddress = await prisma.$transaction(async (tx) => {
      let finalIsDefault = existingAddress.isDefault;

      if (isDefault === true) {
        await tx.address.updateMany({
          where: { userId: req.user.id },
          data: { isDefault: false },
        });
        finalIsDefault = true;
      }

      const updated = await tx.address.update({
        where: { id },
        data: {
          ...finalData,
          isDefault: finalIsDefault,
        },
      });

      if (updated.isDefault) {
        await tx.user.update({
          where: { id: req.user.id },
          data: {
            defaultAddress: buildDefaultAddressText(updated),
          },
        });
      }

      return updated;
    });

    return sendSuccess(res, "Cập nhật địa chỉ thành công", updatedAddress);
  } catch (error) {
    console.error("Update address error:", error);
    return sendError(res, "Lỗi server khi cập nhật địa chỉ", 500);
  }
};

const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const existingAddress = await prisma.address.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!existingAddress) {
      return sendError(res, "Không tìm thấy địa chỉ", 404);
    }

    await prisma.$transaction(async (tx) => {
      await tx.address.delete({
        where: { id },
      });

      if (existingAddress.isDefault) {
        const anotherAddress = await tx.address.findFirst({
          where: {
            userId: req.user.id,
            id: { not: id },
          },
          orderBy: { createdAt: "desc" },
        });

        if (anotherAddress) {
          const newDefaultAddress = await tx.address.update({
            where: { id: anotherAddress.id },
            data: { isDefault: true },
          });

          await tx.user.update({
            where: { id: req.user.id },
            data: {
              defaultAddress: buildDefaultAddressText(newDefaultAddress),
            },
          });
        } else {
          await tx.user.update({
            where: { id: req.user.id },
            data: { defaultAddress: null },
          });
        }
      }
    });

    return sendSuccess(res, "Xóa địa chỉ thành công", null);
  } catch (error) {
    console.error("Delete address error:", error);
    return sendError(res, "Lỗi server khi xóa địa chỉ", 500);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
};