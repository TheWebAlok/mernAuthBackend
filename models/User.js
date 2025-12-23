import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,
    username: String,
    email: { type: String, unique: true },
    password: String,

    //  GOOGLE LOGIN FIELDS
    googleId: { type: String, default: null },
    avatar: { type: String, default: null },

    token: String,
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
