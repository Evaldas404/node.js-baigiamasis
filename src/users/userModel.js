import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  id: { type: String, required: true },
  name: {
    type: String,
    required: true,
    trim: true,
    set: (value) => {
     return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  password: {
    type: String,
    required: true,
  },
  tickets: { type: [String], required: true },
  balance: { type: Number, required: true, min: [0] },
});

export default mongoose.model("User", userSchema);
