const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const { Server } = require("socket.io");
const { createServer } = require("http");

const connectDB = require("./db");
const {initializeSocket} = require("./socket");
const authRoute = require("./Routes/authRoute");
const userRoute = require("./Routes/userRoute");
const conversationRoute = require("./Routes/conversationRoute"); // Import the conversation routes
const messageRoute=require("./Routes/messageRoute")

const PORT = process.env.PORT || 6000;

const app = express();
const server = createServer(app);

app.use(cookieParser());
app.use(express.json());
app.use(cors());

app.use("/auth", authRoute);
app.use("/api/user", userRoute);
app.use("/api/conversation", conversationRoute); // Use the conversation routes
app.use("/api/messages",messageRoute)

initializeSocket(server);
server.listen(PORT, () => {
  console.log(`running at ${PORT}`);
  connectDB();
});
