const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const addressController = require("../controllers/addressController");

router.use(authMiddleware);

router.get("/", addressController.getAddresses);
router.get("/:id", addressController.getAddressById);
router.post("/", addressController.createAddress);
router.put("/:id", addressController.updateAddress);
router.delete("/:id", addressController.deleteAddress);
router.patch("/:id/default", addressController.setDefaultAddress);

module.exports = router;
