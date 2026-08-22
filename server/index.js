import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import tripRoutes from "./routes/tripRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import cityRoutes from "./routes/cityRoutes.js";

dotenv.config();

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cities", cityRoutes);

const PORT = process.env.PORT || 8000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });

export default app;
