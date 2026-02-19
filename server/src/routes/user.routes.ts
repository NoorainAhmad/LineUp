import { Router } from "express";
import { UserController } from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(authMiddleware); // All routes below this line require a valid JWT

// Dashboard Stats
router.get("/dashboard/stats", UserController.getDashboardStats);
router.get("/stats/:id", UserController.getUserStats);

// Search: Users
router.get("/search", UserController.searchUsers);

// Individual: Specific User
router.get("/:id", UserController.getUserById);

// List: All Users
router.get("/", UserController.getAllUsers);

// List: User's subordinates
router.get("/:id/subordinates", UserController.getUserSubordinates);

// Create: New User
router.post("/", UserController.createUser);

// Update: User
router.patch("/:id", UserController.updateUser);

// Change Password
router.post("/:id/change-password", UserController.changePassword);

// Update Profile Photo
router.patch("/:id/profile-photo", UserController.updateProfilePhoto);

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
