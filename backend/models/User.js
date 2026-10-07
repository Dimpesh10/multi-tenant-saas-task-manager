const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ["admin", "member", "viewer"], default: "member" },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
