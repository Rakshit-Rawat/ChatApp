const express = require("express");

const Conversation = require("../Models/Conversation");
const User = require("../Models/User");

const router = express.Router();

router.get("/:username", async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const conversations = await Conversation.find({ participants: user._id })
      .populate({
        path: "participants",
        select: "username avatar color initials",
      })
      .populate("lastMessage.sender", "username color initials")
      .exec();

    const formattedConversations = conversations.map((conversation) => ({
      ...conversation.toObject(),
      lastMessage: {
        ...conversation.lastMessage,
        timestamp: conversation.lastMessage?.timestamp,
      },
    }));

    return res.json(formattedConversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return res.status(500).json({ message: error.message });
  }
});

router.post("/create", async (req, res) => {
  const { participants } = req.body;

  if (!participants || participants.length < 2) {
    return res
      .status(400)
      .json({ message: "At least two participants are required." });
  }

  try {
    const users = await User.find({
      username: { $in: participants },
    }).select("_id username avatar color initials");

    if (users.length < 2) {
      return res
        .status(400)
        .json({ message: "All participants must be valid users." });
    }

    const participantDetails = users.map((user) => ({
      _id: user._id,
      username: user.username,
      avatar: user.avatar,
      color: user.color,
      initials: user.initials,
    }));

    const conversation = new Conversation({
      participants: participantDetails,
      lastMessage: {
        content: "",
        sender: null,
        timestamp: Date.now(),
      },
    });

    const savedConversation = await conversation.save();
    return res.status(201).json(savedConversation);
  } catch (error) {
    console.error("Error creating conversation:", error);
    return res.status(400).json({ message: error.message });
  }
});

router.patch("/:id", async (req, res) => {
  const { lastMessage } = req.body;

  try {
    const updatedConversation = await Conversation.findByIdAndUpdate(
      req.params.id,
      { lastMessage },
      { new: true }
    );

    if (!updatedConversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    return res.status(200).json(updatedConversation);
  } catch (error) {
    console.error("Error updating conversation:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
