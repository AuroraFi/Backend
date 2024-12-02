const Auth = require("../models/auth");
const Contact = require("../models/contact");

const getContactByNameForUser = async (mobile_number, name) => {
  const user = await Auth.findOne({ mobile_number });

  console.log("user", user);

  if (!user) {
    throw new Error("User not found");
  }

  const contact = await Contact.findOne({ name });

  if (!contact) {
    throw new Error("Contact not found");
  }

  console.log("contact", contact);
  return contact;
};

module.exports = {
  getContactByNameForUser,
};
