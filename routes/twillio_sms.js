const express = require("express");
const triggerTwillioCall = require("../controllers/twillio.controller");
const router = express.Router();

router.get("/sms", async (req, res) => {
  const { toPhoneNumber } = req.query;
  console.log("toPhoneNumber", toPhoneNumber);
  const result = triggerTwillioCall(toPhoneNumber);

  return res.json({
    result,
  });
});

module.exports = router;
