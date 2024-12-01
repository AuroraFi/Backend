const PlayHT = require("playht");
const { PLAYHT_API_KEY, PLAYHT_USER_ID } = require("../lib/data");

PlayHT.init({
  apiKey: PLAYHT_API_KEY,
  userId: PLAYHT_USER_ID,
});

const DEFAULT_VOICE_URL =
  "s3://voice-cloning-zero-shot/d9ff78ba-d016-47f6-b0ef-dd630f59414e/female-cs/manifest.json";

const playHTStreamingOptions = {
  voiceEngine: "PlayHT2.0-turbo",
  voiceId: DEFAULT_VOICE_URL,
  sampleRate: 8000,
  outputFormat: "mulaw",
  speed: 0.75,
};

async function streamGeneratedAudio(ws, streamSid, text) {
  const streamFromStream = await PlayHT.stream(text, playHTStreamingOptions);

  streamFromStream.on("data", (data) => {
    const message = JSON.stringify({
      event: "media",
      streamSid,
      media: {
        payload: data.toString("base64"),
      },
    });

    ws.send(message);
  });

  return streamFromStream;
}

async function getPlayHTStream(text) {
  const streamFromStream = await PlayHT.stream(text, playHTStreamingOptions);

  return streamFromStream;
}

async function getPlayHTStreamFromStream(textStream) {
  const streamFromStream = await PlayHT.stream(
    textStream,
    playHTStreamingOptions
  );

  return streamFromStream;
}

module.exports = {
  streamGeneratedAudio,
  getPlayHTStream,
  getPlayHTStreamFromStream,
};
