const {
  HOST_SOCKET,
  HOST,
  TWILIO_ACCOUNT_SID_CALL,
  TWILIO_AUTH_TOKEN_CALL,
  TWILLIO_PHONE_NUMBER,
} = require("../lib/data");
const twilio = require("twilio");
const accountSid = TWILIO_ACCOUNT_SID_CALL;
const authToken = TWILIO_AUTH_TOKEN_CALL;
const toPhoneNumber = TWILLIO_PHONE_NUMBER;
const client = twilio(accountSid, authToken);

function triggerTwillioCall(body) {
  console.log("triggerTwillioCall -> toPhoneNumber");
  try {
    client.messages.create({
      body: body,
      to: +917057147271,
      from: +17752597090,
    });

    return `SMS Sent Successfully!`;
  } catch (err) {
    console.log(err);

    return `Failed to initiate call`;
  }
}

module.exports = triggerTwillioCall;
