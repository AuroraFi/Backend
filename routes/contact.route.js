const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contact.controller");

router.post("/contacts", contactController.addContact);

router.get("/contacts/:mobile_number", contactController.getAllContacts);

router.get(
  "/contacts/:mobile_number/:name",
  contactController.getContactByName
);

module.exports = router;
