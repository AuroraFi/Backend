const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

router.post("/auth", authController.storeAuthData);
router.get("/auth", authController.getAuthData);

module.exports = router;
