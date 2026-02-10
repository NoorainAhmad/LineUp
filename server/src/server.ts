import express, { Application } from "express";
import cors from "cors";
import { createServer } from "http";
import dotenv from "dotenv";

import { connectRedis } from "@/config/redis.js";
import { connectDB } from "@/config/db.js";

dotenv.config();

const app: Application = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

// Global Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cors());

// Routes
import authRoutes from "./routes/auth.routes.js";
import mediaRoutes from "./routes/media.routes.js";
import userRoutes from "./routes/user.routes.js";
import cannedRoutes from "./routes/canned.routes.js";
import statusRoutes from "./routes/status.routes.js";
import chatRoutes from "./routes/chat.routes.js";

// API Prefix
const API_PREFIX = "/api/v1";

// Routes Registration
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/media`, mediaRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/canned-responses`, cannedRoutes);
app.use(`${API_PREFIX}/statuses`, statusRoutes);
app.use(`${API_PREFIX}/chats`, chatRoutes);

// Health Check
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Initialize infrastructure
async function bootstrap() {
  try {
    // Parallelize infrastructure connections for faster boot times
    console.log("⏳ Connecting to infrastructure...");
    await Promise.all([connectRedis(), connectDB()]);
    console.log("✅ Databases connected successfully.");
    // Start server after infrastructure is ready
    httpServer.listen(PORT, () => {
      console.log(`-----------------------------------------------`);
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📡 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`-----------------------------------------------`);
    });
  } catch (error) {
    console.error("💥 Critical Boot Error:", error);
    process.exit(1);
  }
}

// Handle unexpected process crashes
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

bootstrap();
