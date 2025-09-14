import mongoose from "mongoose";

const rewardSchema = new mongoose.Schema({
  _id: String, // claimId
  category: String,
  reward_type: String,
  created_at: { type: Date, default: Date.now },
  expires_at: Date,
  single_use: { type: Boolean, default: true },
  claimed: { type: Boolean, default: false }
});

export default mongoose.model("Reward", rewardSchema);
