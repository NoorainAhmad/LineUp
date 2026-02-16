import dotenv from "dotenv";
dotenv.config();

import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL;

export const redisClient = createClient({ url: redisUrl });
export const pubClient = createClient({ url: redisUrl });
export const subClient = pubClient.duplicate();

redisClient.on("error", (err) => console.error("Redis Client Error", err));
pubClient.on("error", (err) => console.error("Redis Pub Error", err));
subClient.on("error", (err) => console.error("Redis Sub Error", err));

export const connectRedis = async () => {
  try {
    await Promise.all([
      redisClient.connect(),
      pubClient.connect(),
      subClient.connect(),
    ]);
    console.log("✅ Redis connected successfully!");
  } catch (error) {
    console.error("❌ Redis connection failed:", error);
    process.exit(1);
  }
};
