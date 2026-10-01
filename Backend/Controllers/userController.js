const User = require("../Models/User");

const search = async (req, res) => {
  const query = req.query.q?.trim();

  if (!query) {
    return res.status(400).json({ error: "Query parameter is required" });
  }

  try {
    const users = await User.find({
      username: { $regex: query, $options: "i" },
    }).select("username email avatar");

    return res.json(users);
  } catch (error) {
    console.error("Error searching users:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { search };
