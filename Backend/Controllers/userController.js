const User = require("../Models/User");

const search = async (req, res) => {
  try {
    const { q } = req.query; // Get the query parameter from the URL
    if (!q || !q.trim()) {
      return res.status(400).json({ error: "Query parameter is required" });
    }

    // Perform a case-insensitive search on the username field only
    const users = await User.find({
      username: { $regex: q.trim(), $options: "i" },
    }).select("username email avatar"); // Select only necessary fields

    res.json(users);
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const status = async () => {};

module.exports = { search, status };
