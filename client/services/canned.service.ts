import api from "../api/axios";
import {
  cannedResponseCreateSchema,
  type CannedResponseCreateInput,
} from "../validators/canned.validator.js";

export class CannedResponseService {
  // Get a single canned response by ID
  static async getCannedResponseById(id: string) {
    const response = await api.get(`/canned-responses/${id}`);
    return response.data;
  }

  // Get all canned responses by User ID
  static async getCannedResponsesByUserId(userId: string) {
    const response = await api.get(`/canned-responses/user/${userId}`);
    return response.data;
  }

  // Get all canned responses
  static async getAllCannedResponses() {
    const response = await api.get("/canned-responses");
    return response.data;
  }

  // Create a canned response
  static async createCannedResponse(data: CannedResponseCreateInput) {
    const validatedData = cannedResponseCreateSchema.parse(data);
    const response = await api.post("/canned-responses", validatedData);
    return response.data;
  }

  // Update a canned response
  static async updateCannedResponse(
    id: string,
    data: CannedResponseCreateInput,
  ) {
    const validatedData = cannedResponseCreateSchema.parse(data);
    const response = await api.patch(`/canned-responses/${id}`, validatedData);
    return response.data;
  }

  // Delete a canned response
  static async deleteCannedResponse(id: string) {
    const response = await api.delete(`/canned-responses/${id}`);
    return response.data;
  }
}
