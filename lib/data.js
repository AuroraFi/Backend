require("dotenv").config();

TWILIO_ACCOUNT_SID_CALL = process.env.TWILIO_ACCOUNT_SID_CALL;
TWILIO_AUTH_TOKEN_CALL = process.env.TWILIO_AUTH_TOKEN_CALL;
TWILLIO_PHONE_NUMBER = process.env.TWILLIO_PHONE_NUMBER;

PLAYHT_API_KEY = process.env.PLAYHT_API_KEY;
PLAYHT_USER_ID = process.env.PLAYHT_USER_ID;

const HOST_SOCKET =
  "https://bf1c-2402-3a80-1bf2-f09b-1307-d2dd-41f7-cc09.ngrok-free.app/ws";

const HOST =
  "https://bf1c-2402-3a80-1bf2-f09b-1307-d2dd-41f7-cc09.ngrok-free.app";

module.exports = {
  TWILIO_ACCOUNT_SID_CALL,
  TWILIO_AUTH_TOKEN_CALL,
  TWILLIO_PHONE_NUMBER,
  PLAYHT_API_KEY,
  PLAYHT_USER_ID,
  HOST_SOCKET,
  HOST,
};
