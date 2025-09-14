import mongoose from "mongoose";

const claimSchema = new mongoose.Schema({
  claimId: String,
  name: String,
  phone: String,
  address: String,
  location: Object,
  consent: Boolean,
  created_at: { type: Date, default: Date.now },
  status: { type: String, default: "pending" }
});

export default mongoose.model("Claim", claimSchema);
