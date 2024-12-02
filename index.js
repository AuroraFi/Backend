const express = require("express");
const connectDB = require("./config/mongoose");
const bodyParser = require("body-parser");
const llmRoutes = require("./routes/llm.route");
const twillioRoutes = require("./routes/twillio.route");
const authRoutes = require("./routes/auth.route");
const contactRoutes = require("./routes/contact.route");
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
app.use("/api", authRoutes);
app.use("/api", contactRoutes);
// webSocket.app.ws("/ws", wsHandler);

connectDB();

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
