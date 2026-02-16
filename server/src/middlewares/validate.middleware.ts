import { Request, Response, NextFunction } from "express";
import { ZodObject, ZodError } from "zod";

// Middleware to validate user input
export const validate =
  (schema: ZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      return next();
    } catch (error: any) {
      if (error instanceof ZodError) {
        console.warn(`[Validation Error]: ${req.path}`, error.issues);
        return res.status(400).json({
          status: "error",
          message: "Input validation failed",
          errors: error.issues.map((err) => ({
            field: err.path[err.path.length - 1],
            message: err.message,
          })),
        });
      }
      next(error);
    }
  };
