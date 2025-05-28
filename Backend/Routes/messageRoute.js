const express = require("express");
const Message = require("../Models/Message");
const Conversation = require("../Models/Conversation"); // Add this import

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
  const {
    conversationId,
    senderId,
    receiverId,
    content,
    senderUsername,
    timestamp,
  } = req.body; // Added timestamp to the destructuring

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
      timestamp: timestamp || new Date(),
    });

    // Save the message to the database
    const savedMessage = await newMessage.save();

    //  CRITICAL FIX: Update the conversation's lastMessage immediately
    await Conversation.findByIdAndUpdate(
      conversationId,
      {
        lastMessage: {
          content: content,
          senderId: senderId,
          senderUsername: senderUsername,
          timestamp: savedMessage.timestamp,
        },
      },
      { new: true }
    );

    // Populate sender details
    const populatedMessage = await Message.findById(savedMessage._id)
      .populate("sender", "username avatar")
      .populate("receiver", "username avatar");

   
    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Error saving message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/bulk-delete", async (req, res) => {
  const { messageIds } = req.body;

  if (!Array.isArray(messageIds) || messageIds.length === 0) {
    return res
      .status(400)
      .json({ error: "messageIds must be a non-empty array" });
  }

  try {
    // Get the conversations that will be affected before deleting messages
    const messagesToDelete = await Message.find({ _id: { $in: messageIds } });
    const affectedConversations = [
      ...new Set(messagesToDelete.map((msg) => msg.conversation.toString())),
    ];

    // Delete the messages
    const result = await Message.deleteMany({ _id: { $in: messageIds } });

    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ error: "No messages found for the provided IDs" });
    }

    // Update lastMessage for each affected conversation
    for (const conversationId of affectedConversations) {
      // Find the most recent message in this conversation
      const latestMessage = await Message.findOne({
        conversation: conversationId,
      })
        .sort({ timestamp: -1 })
        .populate("sender", "username");

      if (latestMessage) {
        // Update conversation with the latest remaining message
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: {
            content: latestMessage.content,
            senderId: latestMessage.sender._id,
            senderUsername: latestMessage.senderUsername,
            timestamp: latestMessage.timestamp,
          },
        });
      } else {
        // If no messages left, clear the lastMessage
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: {
            content: "No messages",
            senderId: null,
            senderUsername: "",
            timestamp: new Date(),
          },
        });
      }
    }

    res.status(200).json({
      message: `${result.deletedCount} message(s) deleted successfully`,
      affectedConversations: affectedConversations.length,
    });
  } catch (error) {
    console.error("Error deleting messages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
