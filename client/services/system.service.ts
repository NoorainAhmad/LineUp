import api from "../api/axios";
import {
  systemSchema,
  type SystemInput,
} from "../validators/system.validator.js";

export class SystemService {
  // Get system settings
  static async getSystemSettings() {
    const response = await api.get("/system");
    return response.data;
  }

  // Update system settings
  static async updateSystemSettings(data: SystemInput) {
    const validatedData = systemSchema.parse(data);
    const response = await api.post("/system", validatedData);
    return response.data;
  }
}
