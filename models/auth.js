const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AuthSchema = new Schema({
  auth_token: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    default: "success",
  },
  refresh_auth_token: {
    type: String,
    required: true,
  },
  device_token: {
    type: String,
    required: true,
  },
  mobile_number: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Auth", AuthSchema);
