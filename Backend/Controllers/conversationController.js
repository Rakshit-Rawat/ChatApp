const Conversation = require("../Models/Conversation");
const User = require("../Models/User"); 

// Get user's conversations
const conversations = async (req, res) => {
  try {
    const username = req.params.userId;

    const currentUser = await User.findOne({ username: username });
    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const conversations = await Conversation.find({
      participants: currentUser._id,
    })
      .populate("participants", "username avatar")
      .sort({ "lastMessage.timestamp": -1 });

    const formattedConversations = conversations.map((conv) => {
      const otherParticipant = conv.participants.find(
        (p) => p.username !== username
      );

      return {
        _id: conv._id,
        participants: conv.participants,
        lastMessage: conv.lastMessage || {
          content: "Start a conversation",
          timestamp: new Date(),
        },
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
  const { participants } = req.body; 

  if (!participants || participants.length !== 2) {
    return res.status(400).json({ error: "Two participants are required" });
  }

  try {
 
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
        $size: 2, // Ensure exactly 2 participants
      },
    }).populate("participants", "username avatar");

    if (!conversation) {
      conversation = new Conversation({
        participants: participantUsers.map((u) => u._id),
        lastMessage: {
          content: "Start a conversation",
          timestamp: new Date(),
        },
      });
      await conversation.save();
      conversation = await conversation.populate(
        "participants",
        "username avatar"
      );
    }

    // Format response to match what frontend expects
    const formattedConversation = {
      _id: conversation._id,
      participants: conversation.participants,
      lastMessage: conversation.lastMessage,
    };

    res.json(formattedConversation);
  } catch (error) {
    console.error("Error creating conversation:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { conversations, createConversation };
