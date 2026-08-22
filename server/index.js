import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import tripRoutes from "./routes/tripRoutes.js";

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  })
);

app.get("/", (req, res) => {
  res.json({
    message: "GlobeTrotter API is running"
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "OK"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found"
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    message: "Something went wrong on the server"
  });
});

export default app;