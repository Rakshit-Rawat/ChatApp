const { createServer } = require("http");

const cookieParser = require("cookie-parser");
const cors = require("cors");
const express = require("express");

require("dotenv").config();

const connectDB = require("./db");
const { initializeSocket } = require("./socket");
const authRoute = require("./Routes/authRoute");
const conversationRoute = require("./Routes/conversationRoute");
const messageRoute = require("./Routes/messageRoute");
const userRoute = require("./Routes/userRoute");

const PORT = process.env.PORT || 6000;
const CLIENT_ORIGINS = [
  "http://localhost:5173",
  "https://buzz-link-azure.vercel.app",
];

const app = express();
const server = createServer(app);

const corsOptions = {
  origin: CLIENT_ORIGINS,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cookieParser());
app.use(express.json());
app.use(cors(corsOptions));

app.use("/auth", authRoute);
app.use("/api/user", userRoute);
app.use("/api/conversation", conversationRoute);
app.use("/api/messages", messageRoute);

initializeSocket(server, CLIENT_ORIGINS);

server.listen(PORT, async () => {
  console.log(`VChat backend listening on port ${PORT}`);
  await connectDB();
});
