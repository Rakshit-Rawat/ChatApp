const express = require("express");
const Message = require("../Models/Message");

const router = express.Router();

router.get("/:conversationId", async (req, res) => {
  try {
    const messages = await Message.find({
      conversation: req.params.conversationId,
    })
      .populate("sender", "username avatar") // Populate sender details
      .sort({ timestamp: 1 }); // Sort messages by timestamp (ascending)

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: error.message });
  }
});

// Save a new message
router.post("/", async (req, res) => {
  const { conversationId, senderId, receiverId, content, senderUsername } =
    req.body; // Expecting these fields in the request body

  // Validate the request body
  if (
    !conversationId ||
    !senderId ||
    !receiverId ||
    !content ||
    !senderUsername
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Create a new message instance
    const newMessage = new Message({
      conversation: conversationId,
      sender: senderId,
      receiver: receiverId,
      content: content,
      senderUsername: senderUsername,
    });

    // Save the message to the database
    const savedMessage = await newMessage.save();

    // Populate sender details
    const populatedMessage = await Message.findById(savedMessage._id)
      .populate("sender", "username avatar")
      .populate("receiver", "username avatar"); // Optionally populate receiver details

    // Respond with the saved message
    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Error saving message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
