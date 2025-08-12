import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    for_user_id: { type: String, ref: "User", required: true },
    to_user_id: { type: String, ref: "User", required: true },
    status: { type: String, enum: ["pending", "accepted"], default: "pending" },
  },
  { timestamps: true }
);

const Connection = mongoose.model("Connection", schema);

export default Connection;
