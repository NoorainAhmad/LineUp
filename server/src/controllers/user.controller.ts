import { Request, Response } from "express";
import { UserService } from "../services/user.service.js";
import {
  userCreateSchema,
  userUpdateSchema,
} from "@/validators/user.validator.js";

export class UserController {
  // Get a single user
  static async getUserById(req: Request, res: Response) {
    try {
      const user = await UserService.getUserById(req.params.id as string);
      if (!user) return res.status(404).json({ error: "User not found" });
      return res.status(200).json(user);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Get all users
  static async getAllUsers(_req: Request, res: Response) {
    try {
      const users = await UserService.getAllUsers();
      return res.status(200).json(users);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Get user subordinates
  static async getUserSubordinates(req: Request, res: Response) {
    try {
      const subordinates = await UserService.getUserSubordinates(
        req.params.id as string,
      );
      return res.status(200).json(subordinates);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Search users
  static async searchUsers(req: Request, res: Response) {
    if (!req.query.q) return res.status(400).json({ error: "Missing query" });
    try {
      const users = await UserService.searchUsers(req.query.q as string);
      return res.status(200).json(users);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Create a new user
  static async createUser(req: Request, res: Response) {
    try {
      const validatedData = userCreateSchema.parse(req.body);
      const user = await UserService.createUser(validatedData);
      return res.status(201).json(user);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  // Update a user
  static async updateUser(req: Request, res: Response) {
    try {
      const validatedData = userUpdateSchema.parse(req.body);
      const user = await UserService.updateUser(
        req.params.id as string,
        validatedData,
      );
      return res.status(200).json(user);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Delete a user
  static async deleteUser(req: Request, res: Response) {
    try {
      await UserService.deleteUser(req.params.id as string);
      return res.status(204).send();
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
