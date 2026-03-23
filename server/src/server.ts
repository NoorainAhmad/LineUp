import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import dotenv from "dotenv";

import { connectRedis, redisClient, pubClient, subClient } from "@/config/redis.js";
import { connectDB } from "@/config/db.js";
import { initSocket } from "@/socket/index.js";

dotenv.config();

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

const app: Application = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

// API Prefix
const API_PREFIX = "/api/v1";

// ====================================
// PROXY CONFIGURATION (CRITICAL FOR RATE LIMITING)
// ====================================

// Tell Express to trust the proxy - needed for accurate IP detection
app.set("trust proxy", true); // Trust all proxies

// ====================================
// SECURITY MIDDLEWARE (Applied first)
// ====================================

// Disable the X-Powered-By header
app.disable("x-powered-by");

// 1. Helmet for security headers (protects from XSS, clickjacking, etc.)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }),
);

// 2. Body parsing with size limits (prevent payload too large attacks)
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ limit: "1mb", extended: true }));

// 3. CORS configuration
const corsOptions = {
  origin: [
    "http://localhost:5173",
    //   "http://localhost:5174", testing for different frontend locally
    "http://lineup24x7.com",
    "https://lineup24x7.com",
    "https://www.lineup24x7.com",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  preflightContinue: false,
  credentials: true,
  maxAge: 86400, // 24 hours
};
app.use(cors(corsOptions));
app.use(cookieParser());

// Request logging middleware (after body parsing)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} from ${req.ip}`);
  next();
});

// ====================================
// REDIS-BASED RATE LIMITING WITH IOREDIS
// ====================================

// Helper function to create a unique store for each limiter
const createRedisStore = (client: any, prefix: string): any => {
  return {
    increment: async (key: string) => {
      const prefixedKey = `${prefix}${key}`;
      const multi = client.multi();
      multi.incr(prefixedKey);
      multi.pexpire(prefixedKey, 60000);
      const results = await multi.exec();
      const count = results[0][1];
      return count;
    },

    decrement: async (key: string) => {
      const prefixedKey = `${prefix}${key}`;
      return await client.decr(prefixedKey);
    },

    resetKey: async (key: string) => {
      const prefixedKey = `${prefix}${key}`;
      return await client.del(prefixedKey);
    },

    get: async (key: string) => {
      const prefixedKey = `${prefix}${key}`;
      const value = await client.get(prefixedKey);
      return value ? parseInt(value, 10) : 0;
    }
  };
};

// Helper function to safely get client IP (handles IPv6 properly)
const getClientIp = (req: any): string => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';

  if (ip === '::1' || ip === '127.0.0.1' || ip === '::ffff:127.0.0.1') {
    return 'localhost';
  }

  if (ip.startsWith('::ffff:')) {
    return ip.substring(7);
  }

  return ip;
};

// Store for rate limiters
let globalLimiter: any;
let authLimiter: any;
let apiLimiter: any;
let uploadLimiter: any;
let websocketLimiter: any;

// Initialize rate limiters after Redis is connected
function initializeRateLimiters() {
  try {
    if (!redisClient || redisClient.status !== "ready") {
      console.warn("⚠️ Redis client not available, using memory-based rate limiting");
      initializeFallbackRateLimiters();
      return;
    }

    // Create separate stores for each limiter
    globalLimiter = rateLimit({
      windowMs: 60 * 1000,          // 60 seconds
      max: 1000,                      // 1000 requests per minute 
      message: { error: "Too many requests, please try again later." },
      standardHeaders: true,
      legacyHeaders: false,
      store: createRedisStore(redisClient, 'rl:global:'),
      keyGenerator: (req) => getClientIp(req),
      skip: (req) => req.path === `${API_PREFIX}/health`,
    });

    authLimiter = rateLimit({
      windowMs: 60 * 60 * 1000,
      max: 10,
      message: {
        error: "Too many authentication attempts, please try again later.",
      },
      standardHeaders: true,
      legacyHeaders: false,
      store: createRedisStore(redisClient, 'rl:auth:'),
      keyGenerator: (req) => {
        const email = req.body?.email || req.body?.username || "none";
        return `${getClientIp(req)}:${email}`;
      },
      skipSuccessfulRequests: true,
    });

    apiLimiter = rateLimit({
      windowMs: 60 * 1000,
      max: 200,
      message: { error: "API rate limit exceeded. Please slow down." },
      standardHeaders: true,
      legacyHeaders: false,
      store: createRedisStore(redisClient, 'rl:api:'),
      keyGenerator: (req) => getClientIp(req),
      skip: (req) => req.path === `${API_PREFIX}/health`,
    });

    uploadLimiter = rateLimit({
      windowMs: 60 * 60 * 1000,                      // 1 hour
      max: 50,                                        // 50 uploads per hour (increased from 20)
      message: { error: "Upload limit exceeded. Please try again later." },
      standardHeaders: true,
      legacyHeaders: false,
      store: createRedisStore(redisClient, 'rl:upload:'),
      keyGenerator: (req) => getClientIp(req),
    });

    websocketLimiter = rateLimit({
      windowMs: 60 * 1000,
      max: 30,
      message: { error: "Too many connection attempts. Please wait." },
      standardHeaders: true,
      legacyHeaders: false,
      store: createRedisStore(redisClient, 'rl:ws:'),
      keyGenerator: (req) => getClientIp(req),
    });

    console.log("✅ Redis rate limiters initialized");
  } catch (error) {
    console.error("❌ Failed to initialize Redis rate limiters:", error);
    initializeFallbackRateLimiters();
  }
}

// Fallback to memory-based rate limiting
function initializeFallbackRateLimiters() {
  console.warn("⚠️ Using fallback memory-based rate limiting");

  globalLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 1000,
    message: { error: "Too many requests, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path === `${API_PREFIX}/health`,
  });

  authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: { error: "Too many authentication attempts, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
  });

  apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 200,
    message: { error: "API rate limit exceeded. Please slow down." },
    standardHeaders: true,
    legacyHeaders: false,
  });

  uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 50,
    message: { error: "Upload limit exceeded. Please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
  });

  websocketLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    message: { error: "Too many connection attempts. Please wait." },
    standardHeaders: true,
    legacyHeaders: false,
  });
}

// Routes
import authRoutes from "./routes/auth.routes.js";
import mediaRoutes from "./routes/media.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import statusRoutes from "./routes/status.routes.js";
import userRoutes from "./routes/user.routes.js";
import cannedRoutes from "./routes/canned.routes.js";
import systemRoutes from "./routes/system.routes.js";

// Health Check (excluded from rate limiting) - Place this BEFORE rate limiters
app.get(`${API_PREFIX}/health`, (_req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    processId: process.pid,
    timestamp: new Date().toISOString(),
  });
});

// Initialize infrastructure
async function bootstrap() {
  try {
    console.log("⏳ Connecting to infrastructure...");

    const timeout = setTimeout(() => {
      console.error("❌ Infrastructure connection timeout");
      process.exit(1);
    }, 30000);

    await Promise.all([connectRedis(), connectDB()]);
    clearTimeout(timeout);

    // Initialize rate limiters after Redis is connected
    initializeRateLimiters();

    // ====================================
    // APPLY RATE LIMITERS IN CORRECT ORDER
    // ====================================

    // 1. Apply global rate limiter first (catches all requests)
    if (globalLimiter) {
      app.use(globalLimiter);
    }

    // 2. Apply specific rate limiters to routes
    // Note: Order matters - more specific routes should come before general ones

    // Auth routes with stricter limits
    if (authLimiter) {
      app.use(`${API_PREFIX}/auth/login`, authLimiter);
      app.use(`${API_PREFIX}/auth/register`, authLimiter);
      app.use(`${API_PREFIX}/auth/forgot-password`, authLimiter);
    }

    // Upload routes
    if (uploadLimiter) {
      app.use(`${API_PREFIX}/media`, uploadLimiter);
    }

    // WebSocket connection endpoint
    if (websocketLimiter) {
      app.use(`${API_PREFIX}/socket.io/`, websocketLimiter);
    }

    // API rate limiter for all remaining API routes
    if (apiLimiter) {
      app.use(`${API_PREFIX}`, apiLimiter);
    }

    // ====================================
    // REGISTER ROUTES
    // ====================================

    // Now register all route handlers
    app.use(`${API_PREFIX}/auth`, authRoutes);
    app.use(`${API_PREFIX}/media`, mediaRoutes);
    app.use(`${API_PREFIX}/chats`, chatRoutes);
    app.use(`${API_PREFIX}/statuses`, statusRoutes);
    app.use(`${API_PREFIX}/users`, userRoutes);
    app.use(`${API_PREFIX}/canned-responses`, cannedRoutes);
    app.use(`${API_PREFIX}/system`, systemRoutes);

    // 404 handler - should be after all routes
    app.use((req, res) => {
      res.status(404).json({ error: "Not Found" });
    });

    // Global error handler - should be last
    app.use((err: any, req: any, res: any, next: any) => {
      console.error("Error:", err.message);
      res.status(err.status || 500).json({
        error: process.env.NODE_ENV === "production"
          ? "Internal Server Error"
          : err.message,
      });
    });

    // Initialize Socket.io
    initSocket(httpServer);
    console.log("✅ Socket.io initialized.");

    httpServer.listen(PORT, () => {
      console.log(`-----------------------------------------------`);
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📡 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🛡️ Security: Redis rate limiting & Helmet enabled`);
      console.log(`🌐 Proxy trust: Enabled`);
      console.log(`-----------------------------------------------`);
    });
  } catch (error) {
    console.error("💥 Critical Boot Error:", error);
    process.exit(1);
  }
}

// Graceful shutdown
function shutdown() {
  console.log("Shutting down gracefully...");
  httpServer.close(() => {
    console.log("Closed out remaining connections.");
    if (redisClient) redisClient.quit();
    if (pubClient) pubClient.quit();
    if (subClient) subClient.quit();
    process.exit(0);
  });
}

process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  process.exit(1);
});

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

bootstrap();