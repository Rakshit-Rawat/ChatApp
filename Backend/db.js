const mongoose = require('mongoose');
const monoguri=process.env.MONGO_URI

const connectDB = async () => {
  try {
    await mongoose.connect(monoguri);
    console.log('MongoDB connected successfully at->',monoguri);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports= connectDB