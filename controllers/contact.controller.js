const Contact = require("../models/contact");
const Auth = require("../models/auth");
const { getContactByNameForUser } = require("../helpers/getAddressByName");

exports.addContact = async (req, res) => {
  const { mobile_number, name, address } = req.body;

  if (!mobile_number || !name || !address) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const user = await Auth.findOne({ mobile_number });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newContact = new Contact({
      user: user._id,
      name,
      address,
    });

    const savedContact = await newContact.save();

    res.status(201).json({
      message: "Contact added successfully",
      data: savedContact,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add contact",
      error: error.message,
    });
  }
};

exports.getAllContacts = async (req, res) => {
  const { mobile_number } = req.params;

  if (!mobile_number) {
    return res.status(400).json({ message: "Mobile number is required" });
  }

  try {
    const user = await Auth.findOne({ mobile_number });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const contacts = await Contact.find({ user: user._id });

    res.status(200).json({
      message: "Contacts retrieved successfully",
      data: contacts,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve contacts",
      error: error.message,
    });
  }
};

exports.getContactByName = async (req, res) => {
  const { mobile_number, name } = req.params;

  if (!mobile_number || !name) {
    return res
      .status(400)
      .json({ message: "Mobile number and name are required" });
  }

  try {
    const contact = await getContactByNameForUser(mobile_number, name);

    res.status(200).json({
      message: "Contact retrieved successfully",
      data: contact,
    });
  } catch (error) {
    const statusCode =
      error.message === "User not found" ||
      error.message === "Contact not found"
        ? 404
        : 500;
    res.status(statusCode).json({
      message: error.message,
    });
  }
};
