const wsHandler = (ws, req) => {
  console.log("Connected");

  ws.on("message", async (rawData, isBinary) => {
    try {
      const data = JSON.parse(rawData.toString());

      if (data.event === "start") {
        const { greet, prompt, loadingText } =
          data.start?.customParameters || {};

        let stream;

        if (prompt) {
          const vertexStream = await gaianetController(prompt);
          stream = await getPlayHTStreamFromStream(vertexStream);
        } else {
          stream = await getPlayHTStream(greet ?? GREET_MESSAGE);
        }

        stream.on("data", (chunk) => {
          const message = JSON.stringify({
            event: "media",
            streamSid: data.streamSid,
            media: {
              payload: chunk.toString("base64"),
              track: "outbound",
            },
          });

          ws.send(message);
        });

        stream.on("end", () => {
          const twilioMessage = {
            event: "mark",
            mark: {
              name: "PlayHT",
            },
            streamSid: data.streamSid,
          };

          ws.send(JSON.stringify(twilioMessage));

          console.log("--------------End stream--------------");
        });

        stream.on("error", (err) => {
          console.error("Stream error: ", err);
          ws.send(JSON.stringify({ event: "error", message: "Stream error" }));
        });
      } else if (data.event === "media") {
        return;
      } else if (data.event === "mark") {
        ws.close();
      } else {
        console.log(`New Event - ${rawData}`);
      }
    } catch (error) {
      console.error("Error in WebSocket handler:", error);
      ws.send(
        JSON.stringify({ event: "error", message: "Internal server error" })
      );
    }
  });

  ws.on("close", () => {
    console.log("Disconnected");
  });
};
