const express = require("express");
const {
  HOST_SOCKET,
  HOST,
  TWILLIO_PHONE_NUMBER,
  TWILIO_AUTH_TOKEN_CALL,
  TWILIO_ACCOUNT_SID_CALL,
} = require("../lib/data");
const router = express.Router();
const twillio = require("twilio");
const llmController = require("../controllers/llm.controller");

console.log("HOST");

router.post("/transcribe", async (req, res) => {
  console.log("calling the function");
  const skip = req.query.skip;

  const response = new twillio.twiml.VoiceResponse();

  if (!skip) {
    response.say(
      { voice: "Polly.Aditi", language: "en-IN" },
      "How are you doing today how can i help you ?"
    );
  }

  response.gather({
    enhanced: false,
    speechTimeout: "auto",
    speechModel: "phone_call",
    input: ["speech"],
    action: `${HOST}/llm/respond`,
    method: "POST",
    actionOnEmptyResult: true,
    debug: true,
    language: "en-IN",
  });

  res.type("text/xml");
  res.send(response.toString());
});

router.post("/respond", async (req, res) => {
  const userPrompt = req.body?.SpeechResult ?? req.query?.SpeechResult ?? "";
  const response = new twillio.twiml.VoiceResponse();

  console.log("User Prompt: ", userPrompt);

  // res.type("text/xml");
  // res.send(response.toString());

  try {
    const adminResponse = await llmController(userPrompt);
    response.say(
      { voice: "Polly.Aditi", language: "hi-IN" },

      adminResponse
    );

    response.redirect(
      {
        method: "POST",
      },
      `${HOST}/llm/transcribe?skip=true`
    );
  } catch (err) {
    console.error(err);
    response.say("Some error occuered please try again later");
  }

  res.type("text/xml");
  res.send(response.toString());
});
module.exports = router;
