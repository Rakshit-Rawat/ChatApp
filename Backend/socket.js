const { Server } = require("socket.io");
const User = require("./Models/User");

const onlineUsers = new Map();

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    // Handle user registration with username
    socket.on("user-connected", ({ userId, username }) => {
      if (!userId || !username) return;

      // Add user to online users map
      onlineUsers.set(username, { userId, socketId: socket.id });
      console.log(`User ${username} connected with socket ${socket.id}`);
      console.log("Online users:", Array.from(onlineUsers.entries()));

      io.emit("online-users", Array.from(onlineUsers.keys()));
      io.emit("user-status-update", { username, status: "online" });
    });

    socket.on("check-status", ({ participantUsername }) => {
      const userInfo = onlineUsers.get(participantUsername); // Assuming `onlineUsers` Map

      // Emit back the result
      socket.emit("status-response", {
        participantUsername,
        status: userInfo ? "online" : "offline",
      });
    });

    // Handle sending messages using more detailed payload
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

  // Emit to receiver
  if (receiverInfo && receiverInfo.socketId) {
    io.to(receiverInfo.socketId).emit("receive-message", {
      conversationId,
      senderId,
      content: messageContent,
      senderUsername,
      timestamp,
    });

    io.to(receiverInfo.socketId).emit("new-message", newMessagePayload);
    console.log(`Message sent to ${receiverUsername}`);
  } else {
    console.log(`User ${receiverUsername} is offline`);
  }

  // Emit to sender (so their own chat list updates too)
  io.to(socket.id).emit("new-message", newMessagePayload);
});


    // Handle user disconnection
    socket.on("user-disconnected", (username) => {
      if (username) {
        onlineUsers.delete(username);
        console.log(`User ${username} manually disconnected`);

        io.emit("user-status-update", { username, status: "offline" });
      }
    });

    // Handle automatic disconnection
    socket.on("disconnect", () => {
      let disconnectedUser = null;
      // Find and remove disconnected user
      for (const [username, userInfo] of onlineUsers.entries()) {
        if (userInfo.socketId === socket.id) {
          disconnectedUser = username;
          onlineUsers.delete(username);

          console.log(`User ${username} disconnected`);
          break;
        }
      }
      if (disconnectedUser) {
        console.log(`User ${disconnectedUser} disconnected`);
        console.log("Online users:", Array.from(onlineUsers.entries()));

        // Call markUserOffline function
        markUserOffline(disconnectedUser);
      }
      io.emit("user-status-update", {
        username: disconnectedUser,
        status: "offline",
      });
    });
  });

  const markUserOffline = async (username) => {
    console.log(`Marking ${username} as offline in the database...`);
    // Add your database logic here
    try {
      const user = await User.findOneAndUpdate(
        { username },
        { status: "offline" },
        { new: true }
      );
      if (user) {
        console.log(`User ${username} marked as offline in the database.`);
      } else {
        console.log(`User ${username} not found in the database.`);
      }
    } catch (error) {
      console.error(`Error marking user ${username} as offline:`, error);
    }
  };
};

module.exports = { initializeSocket, onlineUsers };
