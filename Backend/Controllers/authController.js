const User = require("../Models/User");
const jwt =require('jsonwebtoken')



const generateAvatarDetails = (username) => {
  const initials = username
    .split(' ')
    .map(word => word[0].toUpperCase())
    .join('')
    .slice(0, 2);

  const colors = ['#4CAF50', '#FFC107', '#03A9F4', '#E91E63', '#9C27B0'];
  const colorIndex = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;

  return { initials, color: colors[colorIndex] };
};

const register = async (req, res) => {
  try {
    
    const { username, email, password } = req.body;

    const { initials, color } = generateAvatarDetails(username);

    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).clearCookie("token").json({
        success: false,
        error: "User Already Exists",
      });
    }

    const newUser = await User.create({
      username,
      email,
      password,
      avatar:{initials,color},
      status:'offline'
    });

    res
      .status(200)
      
      .json({
        success: true,
        user: {
          id:newUser._id,
          username: newUser.username,
          email: newUser.email,
        },
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      error: "SERVER ERROR ",
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({
      success: false,
      error: "User doesn't exist",
    });
  }

  

  const jwtToken = jwt.sign({ email }, process.env.JWT_SECRET);

  res.cookie("token", jwtToken);

  // Update user status to online
  user.status = 'online';
  await user.save();

  res.status(200).json({
    success: true,
    TOKEN: jwtToken,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      avatar: {
        color: user.avatar.color,
        initials: user.avatar.initials,
        status: user.status
      },
    },
  });
};


const logout= async (req,res)=>{
  const {userId,username } = req.body;
  
  const user =await User.findById(userId)
  if(user){
    user.status='offline';
    await user.save()
  }


  return res.status(200).json({
    success: true,
    message: `User logged out ---> ${username || userId}`
  });
}

module.exports = {
  register,
  login,
  logout
};
