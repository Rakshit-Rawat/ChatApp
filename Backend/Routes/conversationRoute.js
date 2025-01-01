const express = require("express");
const Conversation = require("../Models/Conversation");
const User = require("../Models/User");
const {onlineUsers}=require('../socket')

const router = express.Router();

// Fetch all conversations for a specific user by username
router.get("/:username", async (req, res) => {
  const { username } = req.params;
  try {
    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find conversations involving the user
    const conversations = await Conversation.find({
      participants: user._id, // Use user ID to find conversations
    })
      .populate({
        path: "participants", // Populate participant details from the User model
        select: "username avatar color initials", // Select the fields you want
      })
      .populate("lastMessage.sender", "username color initials") // Populate last message sender details
      .exec();

    const formattedConversations = conversations.map((conversation) => ({
      ...conversation.toObject(),
      lastMessage: {
        ...conversation.lastMessage,
        timestamp: conversation.lastMessage.timestamp,
      },
    }));

    res.json(formattedConversations); // Send the populated conversation data back
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new conversation
router.post("/create", async (req, res) => {
  const { participants } = req.body; // Expecting an array of usernames

  if (!participants || participants.length < 2) {
    return res
      .status(400)
      .json({ message: "At least two participants are required." });
  }

  try {
    // Fetch user details for the provided usernames
    const users = await User.find({ username: { $in: participants } }).select(
      "_id username avatar color initials"
    );

    if (users.length < 2) {
      return res
        .status(400)
        .json({ message: "All participants must be valid users." });
    }

    // Prepare participant details for storage
    const participantDetails = users.map((user) => ({
      _id: user._id,
      username: user.username,
      avatar: user.avatar,
      color: user.color,
      initials: user.initials,
    }));

    // Create a new conversation document with participant details
    const newConversation = new Conversation({
      participants: participantDetails,
      lastMessage: {
        content: "",
        sender: null,
        timestamp: Date.now(),
      },
    });

    const savedConversation = await newConversation.save();

    res.status(201).json(savedConversation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


// PATCH route to update the last message and timestamp of a conversation
router.patch("/:id", async (req, res) => {
  const { lastMessage } = req.body; // Destructure only lastMessage

  try {
    const updatedConversation = await Conversation.findByIdAndUpdate(
      req.params.id,
      { lastMessage }, // Update only the lastMessage object
      { new: true } // Return the updated document
    );

    if (!updatedConversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    res.status(200).json(updatedConversation);
  } catch (error) {
    console.error("Error updating conversation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});



// API endpoint to get online status of participants in a conversation
router.get('/:conversationId/status', async (req, res) => {
  const { conversationId } = req.params;

  try {
    // Fetch participants of the conversation from your database
    const participants = await getParticipantsForConversation(conversationId); // Implement this function as needed

    // Prepare the status response
    const statusResponse = participants.map(participant => {
      const isOnline = onlineUsers.has(participant.username); // Check if the user is online
      return {
        userId: participant.userId,
        username: participant.username,
        status: isOnline ? 'online' : 'offline',
      };
    });

    return res.json(statusResponse);
  } catch (error) {
    console.error('Error fetching participant status:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Function to get participants for a conversation (implement based on your data structure)
const getParticipantsForConversation = async (conversationId) => {
  // Example: Fetch participants from your database
  // This could be a MongoDB query or any other DB operation
  return await User.find({ conversationId });
};
module.exports = router;
