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
const fromPhoneNumber = TWILLIO_PHONE_NUMBER;
const client = twilio(accountSid, authToken);

function triggerTwillioCall(toPhoneNumber) {
  console.log("triggerTwillioCall -> toPhoneNumber");
  try {
    let url = `${HOST}/llm/transcribe`;

    client.calls.create({
      url: url,
      to: toPhoneNumber,
      from: fromPhoneNumber,
    });

    return `Called Initiated Successfully!`;
  } catch (err) {
    console.log(err);

    return `Failed to initiate call`;
  }
}

module.exports = triggerTwillioCall;
