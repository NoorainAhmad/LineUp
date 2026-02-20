import { Router } from "express";
import { UserController } from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { UserRole } from "@/generated/prisma/index.js";
import { checkRole } from "@/middlewares/role.middleware.js";

const router = Router();
router.use(authMiddleware); // All routes below this line require a valid JWT

// Dashboard Stats
router.get("/dashboard/stats", checkRole([UserRole.BRANCH, UserRole.ADMIN, UserRole.MASTER, UserRole.DEVELOPER]), UserController.getDashboardStats);
router.get("/stats/:id", checkRole([UserRole.BRANCH, UserRole.ADMIN, UserRole.MASTER, UserRole.DEVELOPER]), UserController.getUserStats);

// Search: Users
router.get("/search", checkRole([UserRole.BRANCH, UserRole.ADMIN, UserRole.MASTER, UserRole.DEVELOPER]), UserController.searchUsers);

// Search: Team Members
router.get("/team/search", checkRole([UserRole.BRANCH, UserRole.ADMIN, UserRole.MASTER, UserRole.DEVELOPER]), UserController.searchTeamMembers);

// Individual: Specific User
router.get("/:id", checkRole([UserRole.USER, UserRole.BRANCH, UserRole.ADMIN, UserRole.MASTER, UserRole.DEVELOPER]), UserController.getUserById);

// List: All Users
router.get("/", checkRole([UserRole.BRANCH, UserRole.ADMIN, UserRole.MASTER, UserRole.DEVELOPER]), UserController.getAllUsers);

// List: User's subordinates
router.get("/:id/subordinates", checkRole([UserRole.BRANCH, UserRole.ADMIN, UserRole.MASTER, UserRole.DEVELOPER]), UserController.getUserSubordinates);

// Create: New User
router.post("/", checkRole([UserRole.BRANCH, UserRole.ADMIN, UserRole.MASTER, UserRole.DEVELOPER]), UserController.createUser);

// Update: User
router.patch("/:id", checkRole([UserRole.USER, UserRole.BRANCH, UserRole.ADMIN, UserRole.MASTER, UserRole.DEVELOPER]), UserController.updateUser);

// Change Password
router.post("/:id/change-password", checkRole([UserRole.USER, UserRole.BRANCH, UserRole.ADMIN, UserRole.MASTER, UserRole.DEVELOPER]), UserController.changePassword);

// Update Profile Photo
router.patch("/:id/profile-photo", checkRole([UserRole.USER, UserRole.BRANCH, UserRole.ADMIN, UserRole.MASTER, UserRole.DEVELOPER]), UserController.updateProfilePhoto);

// Delete: User
router.delete("/:id",checkRole([UserRole.MASTER, UserRole.DEVELOPER]), UserController.deleteUser);

// Health check
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "LineUp User Service is active",
    timestamp: new Date().toISOString(),
  });
});

export default router;
