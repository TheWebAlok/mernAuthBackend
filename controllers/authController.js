import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/User.js";

// ----------------------
// REGISTER USER
// ----------------------
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, username } = req.body;

    if (!name || !email || !password || !username) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      username,
      password: hashedPassword,
      token: "",
    });

    await newUser.save();

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ----------------------
// LOGIN USER
// ----------------------
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.token = token;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ----------------------
// GOOGLE LOGIN / SIGNUP
// ----------------------
export const googleAuth = async (req, res) => {
  try {
    const { name, email, googleId, avatar } = req.body;

    if (!email || !googleId) {
      return res.status(400).json({ message: "Invalid Google data" });
    }

    let user = await User.findOne({ email });

    // ---------- EXISTING USER ----------
    if (user) {
      user.googleId = googleId;
      user.avatar = avatar;

      const token = crypto.randomBytes(32).toString("hex");
      user.token = token;
      await user.save();

      return res.status(200).json({
        success: true,
        token,
        isNewUser: false, // ✅ FLAG
        message: "Google login successful",
      });
    }

    // ---------- NEW USER ----------
    const randomPassword = crypto.randomBytes(16).toString("hex");
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    const username = email.split("@")[0] + Math.floor(Math.random() * 1000);

    user = new User({
      name,
      email,
      username,
      password: hashedPassword,
      googleId,
      avatar,
      token: crypto.randomBytes(32).toString("hex"),
    });

    await user.save();

    return res.status(201).json({
      success: true,
      token: user.token,
      isNewUser: true, // ✅ FLAG
      message: "Google signup successful",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
