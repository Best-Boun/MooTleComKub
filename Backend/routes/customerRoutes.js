const express = require("express");
const router = express.Router();

const CustomerController = require("../controllers/customerController");

// ดูลูกค้าทั้งหมด
router.get("/", CustomerController.getAllCustomers);

// ดูลูกค้าตาม ID
router.get("/:id", CustomerController.getCustomerById);

// แก้ไขข้อมูลลูกค้า
router.put("/:id", CustomerController.updateCustomer);

// ลบลูกค้า
router.delete("/:id", CustomerController.deleteCustomer);

module.exports = router;
