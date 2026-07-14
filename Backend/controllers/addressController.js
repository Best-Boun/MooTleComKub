const AddressModel = require("../models/addressModel");

const validateAddressPayload = (payload, requireAllFields = true) => {
  const errors = [];
  const requiredFields = [
    "recipient_name",
    "phone",
    "address_line",
    "subdistrict",
    "district",
    "province",
    "postal_code",
  ];

  if (requireAllFields) {
    requiredFields.forEach((field) => {
      if (!payload[field]) {
        errors.push(`${field} is required`);
      }
    });
  }

  if (payload.phone && typeof payload.phone !== "string") {
    errors.push("phone must be a string");
  }

  if (payload.postal_code && !/^\d{5}$/.test(payload.postal_code)) {
    errors.push("postal_code must be a 5-digit string");
  }

  return errors;
};

const getAddresses = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const addresses = await AddressModel.getAllByUser(userId);

    res.json({
      success: true,
      addresses,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const getAddressById = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const addressId = Number(req.params.id);

    if (Number.isNaN(addressId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid address id",
      });
    }

    const address = await AddressModel.findById(addressId);

    if (!address || address.user_id !== userId) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    res.json({
      success: true,
      address,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const createAddress = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const payload = req.body;

    const errors = validateAddressPayload(payload);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: errors.join(", "),
      });
    }

    const insertId = await AddressModel.createAddress(userId, payload);
    const address = await AddressModel.findById(insertId);

    res.status(201).json({
      success: true,
      message: "Address created successfully",
      address,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const updateAddress = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const addressId = Number(req.params.id);

    if (Number.isNaN(addressId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid address id",
      });
    }

    const payload = req.body;
    const errors = validateAddressPayload(payload, false);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: errors.join(", "),
      });
    }

    if (payload.user_id !== undefined) {
      delete payload.user_id;
    }

    const updated = await AddressModel.updateAddress(addressId, userId, payload);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Address not found or not owned by user",
      });
    }

    res.json({
      success: true,
      message: "Address updated successfully",
      address: updated,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const addressId = Number(req.params.id);

    if (Number.isNaN(addressId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid address id",
      });
    }

    const address = await AddressModel.findById(addressId);
    if (!address || address.user_id !== userId) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    const usedByOrder = await AddressModel.isAddressUsedByOrder(addressId);
    if (usedByOrder) {
      return res.status(400).json({
        success: false,
        message: "Address cannot be deleted because it is used by an existing order",
      });
    }

    const deleted = await AddressModel.deleteAddress(addressId, userId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Address not found or not owned by user",
      });
    }

    res.json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const setDefaultAddress = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const addressId = Number(req.params.id);

    if (Number.isNaN(addressId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid address id",
      });
    }

    const updated = await AddressModel.setDefaultAddress(addressId, userId);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Address not found or not owned by user",
      });
    }

    res.json({
      success: true,
      message: "Default address updated successfully",
      address: updated,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  getAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
