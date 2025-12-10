import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  username: String,
  password: String,
  token: String,
});

export default mongoose.model("User", userSchema);
