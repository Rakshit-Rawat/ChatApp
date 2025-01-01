// server/routes/conversations.js
const Conversation = require("../Models/Conversation");

// Get user's conversations
const conversations = async (req, res) => {
  try {
    const userId = req.params.userId;
    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate("participants")
      .populate("lastMessage.sender");

    // Transform conversations to match frontend requirements
    const formattedConversations = conversations.map((conv) => {
      // Find the other participant (not the requesting user)
      const otherParticipant = conv.participants.find(
        (p) => p._id.toString() !== userId
      );

      return {
        _id: conv._id,
        username: otherParticipant?.username || "Unknown User",
        avatar: otherParticipant?.avatar, // If you have avatar in your User model
        participants: conv.participants.map((p) => p._id),
        lastMessage: conv.lastMessage
          ? {
              content: conv.lastMessage.content,
              timestamp: conv.lastMessage.timestamp,
              sender: conv.lastMessage.sender._id.toString(),
            }
          : null,
      };
    });

    res.json(formattedConversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ error: "Error fetching conversations" });
  }
};

//Create a new Convo
const createConversation = async (req, res) => {
  const { participants } = req.body; // Change to an array of usernames

  if (!participants || participants.length !== 2) {
    return res.status(400).json({ error: "Two participants are required" });
  }

  try {
    // Find user IDs based on usernames
    const participantUsers = await User.find({
      username: { $in: participants },
    });

    if (participantUsers.length !== 2) {
      return res.status(400).json({ error: "Users not found" });
    }

    // Check for existing conversation
    let conversation = await Conversation.findOne({
      participants: {
        $all: participantUsers.map((u) => u._id),
      },
    }).populate("participants");

    if (!conversation) {
      conversation = new Conversation({
        participants: participantUsers.map((u) => u._id),
      });
      await conversation.save();
      conversation = await conversation.populate("participants");
    }

    // Format response
    const formattedConversation = {
      id: conversation._id,
      participants: conversation.participants.map((p) => p.username),
      name: participants.find((p) => p !== user.username),
      avatar: conversation.participants.find(
        (p) => p.username !== user.username
      )?.avatar,
      lastMessage: conversation.lastMessage?.content || "Start a conversation",
      time: conversation.lastMessage?.timestamp
        ? new Date(conversation.lastMessage.timestamp).toLocaleTimeString()
        : "Just now",
    };

    res.json(formattedConversation);
  } catch (error) {
    console.error("Error creating conversation:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { conversations, createConversation };
