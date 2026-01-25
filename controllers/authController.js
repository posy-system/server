const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { comparePassword  } = require("../helpers/auth");

//login End Point
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    //check user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.json({
        error: "no user found",
      });
    }

    //compare password
    const match = await comparePassword(password, user.password);
    if (match) {
      const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      res.cookie("token", token).json({
        message: "Login successful",
        token: token,
        user: {
          _id: user._id,
          username: user.username,
          role: user.role,
        },
      });
    } else {
      return res.json({ error: "Incorrect password" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Server Error" });
  }
};

module.exports = {
  loginUser,
};
