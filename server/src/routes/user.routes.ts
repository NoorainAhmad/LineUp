import { Router } from "express";
import { UserController } from "@/controllers/user.controller.js";
import { authMiddleware } from "@/middlewares/auth.middleware.js";

const router = Router();
router.use(authMiddleware); // All routes below this line require a valid JWT

// Individual: Specific User
router.get("/:id", UserController.getUserById);

// List: All Users
router.get("/", UserController.getAllUsers);

// Create: New User
router.post("/", UserController.createUser);

// Update: User
router.patch("/:id", UserController.updateUser);

// Delete: User
router.delete("/:id", UserController.deleteUser);

// Health check
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "LineUp User Service is active",
    timestamp: new Date().toISOString(),
  });
});

export default router;
