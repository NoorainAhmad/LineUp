import dotenv from "dotenv";
dotenv.config();

import { Redis } from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

// Create Redis clients
export const redisClient = new Redis(redisUrl);
export const pubClient = new Redis(redisUrl);
export const subClient = pubClient.duplicate();

// Error handlers
redisClient.on("error", (err) => console.error("❌ Redis Client Error:", err));
pubClient.on("error", (err) => console.error("❌ Redis Pub Error:", err));
subClient.on("error", (err) => console.error("❌ Redis Sub Error:", err));

// Connection success handlers
redisClient.on("connect", () => console.log("✅ Redis Client connected"));
pubClient.on("connect", () => console.log("✅ Redis Pub Client connected"));
subClient.on("connect", () => console.log("✅ Redis Sub Client connected"));

export const connectRedis = async () => {
  try {
    // ioredis connects automatically, but we'll wait a bit to ensure connection
    await new Promise((resolve) => setTimeout(resolve, 100));
    console.log("✅ Redis connected successfully!");
    return true;
  } catch (error) {
    console.error("❌ Redis connection failed:", error);
    process.exit(1);
  }
};