import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import rewardRoutes from "./routes/rewards.js";
import claimRoutes from "./routes/claims.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/rewards", rewardRoutes);
app.use("/api/claims", claimRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(process.env.PORT || 5000, () => {
      console.log("🚀 Server running on port " + (process.env.PORT || 5000));
    });
  })
  .catch(err => console.error("❌ DB connection failed:", err));
