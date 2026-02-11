import { prisma } from "../config/db.js";

// Send OTP
const sendOtp = async (phone: string, code: string) => {
  await fetch(
    `http://3.110.17.247/V2/http-api.php?apikey=WRD3EhHXl2a3t6bv&senderid=EDTECK&number=${phone}&message=${code} is your OTP for verification. Do not share it with anyone. Team, Eduteck.&format=json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      }
    },
  ); 
};

export class OtpService {
  // Generate OTP
  static async generate(phone: string) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60000); // 5 mins
    await sendOtp(phone, code); 
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
