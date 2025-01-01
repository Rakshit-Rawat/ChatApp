const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  avatar: {
    initials: { type: String, required: true },
    color: { type: String, required: true },
  },
  status: { type: String, default: "offline" },
});

const User = new mongoose.model("User", userSchema);

module.exports = User;
