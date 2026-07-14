const SystemLogModel = require("../models/systemLogModel");
const SystemSettingModel = require("../models/systemSettingModel");

// GET /api/system/logs
const getLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 100;
    const offset = (page - 1) * limit;

    const logs = await SystemLogModel.getAll({ limit, offset });

    res.json({
      success: true,
      logs,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// PUT /api/system/settings
const updateSettings = async (req, res) => {
  try {
    const settings = req.body;

    if (
      !settings ||
      typeof settings !== "object" ||
      Array.isArray(settings) ||
      Object.keys(settings).length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one setting to update",
      });
    }

    await SystemSettingModel.upsertMany(settings);

    await SystemLogModel.create({
      user_id: req.user.user_id,
      action: "UPDATE_SETTINGS",
      description: `Updated system settings: ${Object.keys(settings).join(", ")}`,
      ip_address: req.ip,
    });

    res.json({
      success: true,
      message: "System settings updated",
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
  getLogs,
  updateSettings,
};
