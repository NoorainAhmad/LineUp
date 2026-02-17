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
      let readableMessage = "User creation failed. Please try again.";

        if (error instanceof ZodError) {
          // ── Most common approach: field → first error message ────────
          const fieldErrors: Record<string, string> = {};

          error.issues.forEach((issue) => {
            const field = issue.path.join("."); // "guid", "phone", "password"

            // Use the custom message if it exists, otherwise fallback
            let msg = issue.message;

            // Optional: make messages nicer / more user-friendly
            if (issue.code === "too_small") {
              const fieldName =
                issue.path[0] === "guid" ? "GUID"
                : issue.path[0] === "phone" ? "Phone number"
                : issue.path[0] === "password" ? "Password"
                : issue.path.join(".");

              fieldErrors[issue.path.join(".")] =
                ` ${fieldName} must be at least ${issue.minimum} characters`;
            }

            // You can also do: take the first error per field only
            if (!fieldErrors[field]) {
              fieldErrors[field] = msg;
            }
          });

          // Decide how to show it
          if (Object.keys(fieldErrors).length > 0) {
            // Option A: set one main message (simplest for now)
            readableMessage = Object.values(fieldErrors).join(" \n ");

            // Option B: store field-level errors (best if you have inputs)
            // setFieldErrors(fieldErrors);   ← add this state if you want per-field red text
          }

        return res.status(400).json({
          status: "error",
          message: "Validation failed", // main message
          readableMessage, // ⭐ ADD THIS (very useful for frontend)
          errors: fieldErrors, // structured errors for form fields
        });
      }

      next(error);
    }
  };

  
