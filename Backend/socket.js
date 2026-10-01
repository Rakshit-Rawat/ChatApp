const { Server } = require("socket.io");

const User = require("./Models/User");

const onlineUsers = new Map();

const markUserOffline = async (username) => {
  if (!username) return;

  try {
    await User.findOneAndUpdate({ username }, { status: "offline" });
  } catch (error) {
    console.error(`Failed to mark ${username} offline:`, error);
  }
};

const initializeSocket = (server, allowedOrigins = ["http://localhost:5173"]) => {
  const io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("user-connected", ({ userId, username }) => {
      if (!userId || !username) return;

      onlineUsers.set(username, { userId, socketId: socket.id });
      io.emit("online-users", Array.from(onlineUsers.keys()));
      io.emit("user-status-update", { username, status: "online" });
    });

    socket.on("check-status", ({ participantUsername }) => {
      socket.emit("status-response", {
        participantUsername,
        status: onlineUsers.has(participantUsername) ? "online" : "offline",
      });
    });

    socket.on("send-message", (messageData) => {
      const {
        senderUsername,
        receiverUsername,
        message: messageContent,
        conversationId,
        senderId,
        timestamp = new Date().toISOString(),
      } = messageData;

      const receiverInfo = onlineUsers.get(receiverUsername);
      const newMessagePayload = {
        conversationId,
        lastMessage: {
          content: messageContent,
          senderId,
          senderUsername,
          timestamp,
        },
      };

      if (receiverInfo?.socketId) {
        io.to(receiverInfo.socketId).emit("receive-message", {
          conversationId,
          senderId,
          content: messageContent,
          senderUsername,
          timestamp,
        });
        io.to(receiverInfo.socketId).emit("new-message", newMessagePayload);
      }

      io.to(socket.id).emit("new-message", newMessagePayload);
    });

    socket.on("user-disconnected", (username) => {
      if (!username) return;

      const activeUser = onlineUsers.get(username);
      if (activeUser?.socketId === socket.id) {
        onlineUsers.delete(username);
      }

      io.emit("user-status-update", { username, status: "offline" });
      void markUserOffline(username);
    });

    socket.on("disconnect", () => {
      let disconnectedUsername = null;

      for (const [username, userInfo] of onlineUsers.entries()) {
        if (userInfo.socketId === socket.id) {
          disconnectedUsername = username;
          onlineUsers.delete(username);
          break;
        }
      }

      if (!disconnectedUsername) return;

      io.emit("user-status-update", {
        username: disconnectedUsername,
        status: "offline",
      });
      void markUserOffline(disconnectedUsername);
    });
  });
};

module.exports = { initializeSocket, onlineUsers };
