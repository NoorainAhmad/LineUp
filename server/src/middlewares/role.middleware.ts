import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware.js";

// Middleware to check user role
export const checkRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.userId || !req.userRole) {
        return res.status(401).json({
          error: "Unauthorized: No user identity found",
        });
      }
      const hasAccess = allowedRoles.includes(req.userRole);
      if (!hasAccess) {
        return res.status(403).json({
          error: `Forbidden: This action requires one of the following roles: [${allowedRoles.join(", ")}]`,
        });
      }
      next();
    } catch (error) {
      // Handle internal server error
      return res
        .status(500)
        .json({ error: "Internal server error during role validation" });
    }
  };
};
