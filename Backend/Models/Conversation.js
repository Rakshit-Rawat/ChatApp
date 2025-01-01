const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId, // Reference to the user
      ref: 'User', // Reference to the User model
    },
    {
      username: String,
      avatar: {
        initials: String,
        color: String,
      },
      color: String,
      initials: String,
    }
  ],
  lastMessage: {
    content: String,
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to the User model for sender
    timestamp: Date,
  },
}, { timestamps: true });

module.exports = mongoose.model('Conversation', conversationSchema);
