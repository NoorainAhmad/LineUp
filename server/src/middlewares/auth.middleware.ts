import { JwtPayload } from "../utils/jwt.js";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Interface for authenticated requests
export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
  ipAddress?: string;
}

// Middleware to check if user is authenticated
export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "Access denied. No token provided." });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    //console.log("Decoded token is ", decoded)
    req.userId = decoded.userId;
    req.userRole = decoded.userRole;
    req.ipAddress = req.ip;
    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ error: "Token expired. Please login again." });
    }
    return res.status(401).json({ error: "Invalid token." });
  }
};
