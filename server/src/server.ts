import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import dotenv from "dotenv";

import { connectRedis } from "@/config/redis.js";
import { connectDB } from "@/config/db.js";

dotenv.config();

const app: Application = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

// API Prefix
const API_PREFIX = "/api/v1";

import cluster from "cluster";

if (cluster.isPrimary) {
  console.log("Primary process", process.pid);
} else {
  console.log("Worker started", process.pid);
}

// ====================================
// PROXY CONFIGURATION (CRITICAL FOR RATE LIMITING)
// ====================================

// Tell Express to trust the proxy - needed for accurate IP detection
// The number indicates how many proxy hops to trust
// app.set("trust proxy", 1); // Use 1 if behind a single proxy like Nginx
// Or for AWS load balancers, you might need:
app.set("trust proxy", true); // Trust all proxies

// Log requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} from ${req.ip}`);
  next();
});

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

// 2. Basic rate limiting for all requests
const globalLimiter = rateLimit({
  windowMs: 30 * 1000, // 30 seconds (simplified from 1 * 30 * 1000)
  max: 200, // Limit each IP to 200 requests per windowMs
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => req.path === `${API_PREFIX}/health`, // Skip health checks
});

app.use(globalLimiter);

// 3. Stricter rate limiting for auth routes (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 attempts per hour
  message: {
    error: "Too many authentication attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 4. Body parsing with size limits (prevent payload too large attacks)
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ limit: "1mb", extended: true }));

// 5. CORS configuration
const corsOptions = {
  origin: [
    "http://localhost:5173",
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

// Routes
import authRoutes from "./routes/auth.routes.js";
import mediaRoutes from "./routes/media.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import statusRoutes from "./routes/status.routes.js";
import userRoutes from "./routes/user.routes.js";
import cannedRoutes from "./routes/canned.routes.js";
import systemRoutes from "./routes/system.routes.js";

// Apply stricter limits to specific routes
app.use(`${API_PREFIX}/auth/login`, authLimiter);
app.use(`${API_PREFIX}/auth/register`, authLimiter);
app.use(`${API_PREFIX}/auth/forgot-password`, authLimiter);

// Routes Registration
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/media`, mediaRoutes);
app.use(`${API_PREFIX}/chats`, chatRoutes);
app.use(`${API_PREFIX}/statuses`, statusRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/canned-responses`, cannedRoutes);
app.use(`${API_PREFIX}/system`, systemRoutes);

// Health Check (excluded from rate limiting)
app.get(`${API_PREFIX}/health`, (_req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    processId: process.pid,
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// Global error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error("Error:", err.message);
  res.status(err.status || 500).json({
    error:
      process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : err.message,
  });
});

// Initialize infrastructure
async function bootstrap() {
  try {
    console.log("⏳ Connecting to infrastructure...");

    // Add timeout to prevent hanging
    const timeout = setTimeout(() => {
      console.error("❌ Infrastructure connection timeout");
      process.exit(1);
    }, 30000);

    await Promise.all([connectRedis(), connectDB()]);
    clearTimeout(timeout);

    console.log("✅ Databases connected successfully.");

    httpServer.listen(PORT, () => {
      console.log(`-----------------------------------------------`);
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📡 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🛡️ Security: Rate limiting & Helmet enabled`);
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
    process.exit(0);
  });
}

// Handle unexpected process crashes
process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Rejection:", reason);
});
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  process.exit(1);
});

// Handle graceful shutdown
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

bootstrap();
