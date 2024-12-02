const Auth = require("../models/auth");
const Contact = require("../models/contact");

const getContactByNameForUser = async (mobile_number, name) => {
  const user = await Auth.findOne({ mobile_number });

  if (!user) {
    throw new Error("User not found");
  }

  const contact = await Contact.findOne({ name });

  if (!contact) {
    throw new Error("Contact not found");
  }

  return contact;
};

module.exports = {
  getContactByNameForUser,
};
