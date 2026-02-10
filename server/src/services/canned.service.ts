import z from "zod";
import { prisma } from "@/config/db.js";
import type { cannedResponseCreateSchema } from "@/validators/canned.validator.js";

export class CannedResponseService {
  private static cannedResponseSelection = {
    id: true,
    command: true,
    text: true,
    description: true,
    userId: true,
    createdAt: true,
    updatedAt: true,
  };

  // Get a single canned by ID
  static async getCannedResponseById(id: string) {
    try {
      return prisma.cannedResponse.findUnique({
        where: { id },
        select: this.cannedResponseSelection,
      });
    } catch (error) {
      console.log(`[Canned Response] Error: ${error}`);
      throw new Error("Canned response not found: " + (error as Error).message);
    }
  }

  // Get all canned responses by User ID
  static async getCannedResponsesByUserId(userId: string) {
    try {
      return prisma.cannedResponse.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: this.cannedResponseSelection,
      });
    } catch (error) {
      console.log(`[Canned Response] Error: ${error}`);
      throw new Error(
        "Canned responses not found: " + (error as Error).message,
      );
    }
  }

  // Get all canned responses
  static async getAllCannedResponses() {
    try {
      return prisma.cannedResponse.findMany({
        orderBy: { createdAt: "desc" },
        select: this.cannedResponseSelection,
      });
    } catch (error) {
      console.log(`[Canned Response] Error: ${error}`);
      throw new Error(
        "Canned responses not found: " + (error as Error).message,
      );
    }
  }

  // Create a new canned response
  static async createCannedResponse(
    userId: string,
    data: z.infer<typeof cannedResponseCreateSchema>,
  ) {
    try {
      return await prisma.cannedResponse.create({
        data: {
          command: data.command,
          text: data.text,
          description: data.description || "",
          userId: userId,
        },
        select: this.cannedResponseSelection,
      });
    } catch (error) {
      console.log(`[Canned Response] Error: ${error}`);
      throw new Error(
        "Canned response not created: " + (error as Error).message,
      );
    }
  }

  // Update a canned
  static async updateCannedResponse(
    id: string,
    data: z.infer<typeof cannedResponseCreateSchema>,
  ) {
    try {
      const updateData: any = { ...data };
      Object.keys(updateData).forEach(
        (key) => updateData[key] === undefined && delete updateData[key],
      );
      return prisma.cannedResponse.update({
        where: { id },
        data: updateData,
        select: this.cannedResponseSelection,
      });
    } catch (error) {
      console.log(`[Canned Response] Error: ${error}`);
      throw new Error(
        "Canned response not updated: " + (error as Error).message,
      );
    }
  }

  // Delete a canned by ID
  static async deleteCannedResponse(id: string) {
    try {
      return prisma.cannedResponse.delete({ where: { id } });
    } catch (error) {
      console.log(`[Canned Response] Error: ${error}`);
      throw new Error(
        "Canned response not deleted: " + (error as Error).message,
      );
    }
  }
}
