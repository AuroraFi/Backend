require("dotenv").config();

TWILIO_ACCOUNT_SID_CALL = process.env.TWILIO_ACCOUNT_SID_CALL;
TWILIO_AUTH_TOKEN_CALL = process.env.TWILIO_AUTH_TOKEN_CALL;
TWILLIO_PHONE_NUMBER = process.env.TWILLIO_PHONE_NUMBER;

PLAYHT_API_KEY = process.env.PLAYHT_API_KEY;
PLAYHT_USER_ID = process.env.PLAYHT_USER_ID;

const HOST_SOCKET =
  "https://c657-2401-4900-4e7c-a94b-cf11-fa2b-64e8-70fc.ngrok-free.app/ws";

const HOST =
  "https://c657-2401-4900-4e7c-a94b-cf11-fa2b-64e8-70fc.ngrok-free.app";

module.exports = {
  TWILIO_ACCOUNT_SID_CALL,
  TWILIO_AUTH_TOKEN_CALL,
  TWILLIO_PHONE_NUMBER,
  PLAYHT_API_KEY,
  PLAYHT_USER_ID,
  HOST_SOCKET,
  HOST,
};
