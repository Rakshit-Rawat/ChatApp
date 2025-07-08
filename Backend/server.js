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
const conversationRoute = require("./Routes/conversationRoute"); 
const messageRoute=require("./Routes/messageRoute")

const PORT = process.env.PORT || 6000;

const app = express();
const server = createServer(app);

app.use(cookieParser());
app.use(express.json());

app.use(cors({
  origin: ['http://localhost:5173', 'https://buzz-link-azure.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors({
  origin: ['http://localhost:5173', 'https://buzz-link-azure.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use("/auth", authRoute);
app.use("/api/user", userRoute);
app.use("/api/conversation", conversationRoute);
app.use("/api/messages",messageRoute)

initializeSocket(server);
server.listen(PORT, () => {
  console.log(`running at ${PORT}`);
  connectDB();
});
