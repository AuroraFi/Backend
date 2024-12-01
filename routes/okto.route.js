const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/okto.controller");

router.post("/execute-transaction", transactionController.executeTransaction);

module.exports = router;
