import { prisma } from "@/config/db.js";

export class OtpService {
  // Generate OTP
  static async generate(phone: string) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60000); // 5 mins
    return await prisma.otp.upsert({
      where: { phone },
      update: { code, expiresAt },
      create: { phone, code, expiresAt },
    });
  }

  // Verify OTP
  static async verify(phone: string, code: string) {
    const record = await prisma.otp.findUnique({ where: { phone } });
    if (!record || record.code !== code || new Date() > record.expiresAt) {
      return false;
    }
    await prisma.otp.delete({ where: { phone } });
    return true;
  }
}
