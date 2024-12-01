const express = require("express");
const bodyParser = require("body-parser");
const llmRoutes = require("./routes/llm.route");
const twillioRoutes = require("./routes/twillio.route");
const ws = require("express-ws");
const { wsHandler } = require("./controllers/ws.controller");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const webSocket = ws(app);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/llm", llmRoutes);
app.use("/twillio", twillioRoutes);
// webSocket.app.ws("/ws", wsHandler);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
