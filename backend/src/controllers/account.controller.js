const prisma = require("../config/prisma");
const { sendSuccess, sendError } = require("../utils/response");

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

    return sendSuccess(res, "Lấy thông tin tài khoản thành công", formatProfile(user));
  } catch (error) {
    console.error("Get profile error:", error);
    return sendError(res, "Lỗi server khi lấy thông tin tài khoản", 500);
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone, defaultAddress } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name: name ?? req.user.name,
        phone: phone ?? req.user.phone,
        defaultAddress: defaultAddress ?? req.user.defaultAddress,
      },
      include: { role: true },
    });

    return sendSuccess(res, "Cập nhật thông tin tài khoản thành công", formatProfile(user));
  } catch (error) {
    console.error("Update profile error:", error);
    return sendError(res, "Lỗi server khi cập nhật tài khoản", 500);
  }
};

const getAddresses = async (req, res) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user.id },
      orderBy: [
        { isDefault: "desc" },
        { createdAt: "desc" },
      ],
    });

    return sendSuccess(res, "Lấy danh sách địa chỉ thành công", addresses);
  } catch (error) {
    console.error("Get addresses error:", error);
    return sendError(res, "Lỗi server khi lấy địa chỉ", 500);
  }
};

const createAddress = async (req, res) => {
  try {
    const { name, phone, address, city, district, ward, isDefault = false } = req.body;

    if (!name || !phone || !address || !city || !district || !ward) {
      return sendError(res, "Vui lòng nhập đầy đủ thông tin địa chỉ", 400);
    }

    const createdAddress = await prisma.$transaction(async (tx) => {
      if (isDefault) {
        await tx.address.updateMany({
          where: { userId: req.user.id },
          data: { isDefault: false },
        });

        await tx.user.update({
          where: { id: req.user.id },
          data: {
            defaultAddress: `${address}, ${ward}, ${district}, ${city}`,
          },
        });
      }

      return tx.address.create({
        data: {
          userId: req.user.id,
          name,
          phone,
          address,
          city,
          district,
          ward,
          isDefault,
        },
      });
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

    const updatedAddress = await prisma.$transaction(async (tx) => {
      if (isDefault === true) {
        await tx.address.updateMany({
          where: { userId: req.user.id },
          data: { isDefault: false },
        });

        const finalAddress = address ?? existingAddress.address;
        const finalWard = ward ?? existingAddress.ward;
        const finalDistrict = district ?? existingAddress.district;
        const finalCity = city ?? existingAddress.city;

        await tx.user.update({
          where: { id: req.user.id },
          data: {
            defaultAddress: `${finalAddress}, ${finalWard}, ${finalDistrict}, ${finalCity}`,
          },
        });
      }

      return tx.address.update({
        where: { id },
        data: {
          name: name ?? existingAddress.name,
          phone: phone ?? existingAddress.phone,
          address: address ?? existingAddress.address,
          city: city ?? existingAddress.city,
          district: district ?? existingAddress.district,
          ward: ward ?? existingAddress.ward,
          isDefault:
            typeof isDefault === "boolean" ? isDefault : existingAddress.isDefault,
        },
      });
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
        await tx.user.update({
          where: { id: req.user.id },
          data: { defaultAddress: null },
        });
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