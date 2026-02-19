import { prisma } from "../config/db.js";

// Configuration (move to env variables in production)
const SMS_CONFIG = {
  URL: "http://3.110.17.247/V2/http-api.php",
  API_KEY: "WRD3EhHXl2a3t6bv",
  SENDER_ID: "MANFOU",
};

const WHATSAPP_CONFIG = {
  URL: "https://omni.yourbulksms.com/V23.0/1012642478596331/messages",
  TOKEN: "bdead578-d68b-4fb9-a295-b1e63d0eb6a3",
};

// Send OTP via both channels
export const sendOtp = async (phone: string, code: string) => {
  console.log(`📤 Sending OTP ${code} to ${phone}`);

  // SMS function with error handling
  const sendSms = async () => {
    try {
      const msg = encodeURIComponent(
        `Hello, Your OTP for login is ${code}. Thank You, Mangocity`,
      );
      const url = `${SMS_CONFIG.URL}?apikey=${SMS_CONFIG.API_KEY}&senderid=${SMS_CONFIG.SENDER_ID}&number=${phone}&message=${msg}&format=json`;

      const response = await fetch(url);
      const data = await response.json();

      console.log(`📱 SMS sent to ${phone}:`, data);
      return { success: true, data };
    } catch (error: any) {
      console.error(`❌ SMS failed for ${phone}:`, error);
      return { success: false, error: error.message };
    }
  };

  // WhatsApp function with error handling
  const sendWhatsApp = async () => {
    try {
      const response = await fetch(WHATSAPP_CONFIG.URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WHATSAPP_CONFIG.TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: `91${phone}`,
          type: "template",
          template: {
            name: "otp",
            language: { code: "en" },
            components: [
              { type: "body", parameters: [{ type: "text", text: code }] },
              {
                type: "button",
                sub_type: "url",
                index: "0",
                parameters: [{ type: "text", text: code }],
              },
            ],
          },
        }),
      });

      const data = await response.json();
      console.log(`📱 WhatsApp sent to ${phone}:`, data);
      return { success: true, data };
    } catch (error: any) {
      console.error(`❌ WhatsApp failed for ${phone}:`, error);
      return { success: false, error: error.message };
    }
  };

  // Send both simultaneously
  const [smsResult, whatsappResult] = await Promise.allSettled([
    sendSms(),
    sendWhatsApp(),
  ]);

  // Process results
  const results = {
    sms:
      smsResult.status === "fulfilled"
        ? smsResult.value
        : {
            success: false,
            error: smsResult.reason?.message || "SMS failed",
          },
    whatsapp:
      whatsappResult.status === "fulfilled"
        ? whatsappResult.value
        : {
            success: false,
            error: whatsappResult.reason?.message || "WhatsApp failed",
          },
  };

  // Log summary
  console.log(`📊 OTP Delivery Summary for ${phone}:`, {
    sms: results.sms.success ? "✅" : "❌",
    whatsapp: results.whatsapp.success ? "✅" : "❌",
  });

  return {
    success: results.sms.success || results.whatsapp.success,
    channels: {
      sms: results.sms.success ? "sent" : "failed",
      whatsapp: results.whatsapp.success ? "sent" : "failed",
    },
    errors: {
      sms: results.sms.error,
      whatsapp: results.whatsapp.error,
    },
    code,
    phone,
    timestamp: new Date().toISOString(),
  };
};

export class OtpService {
  // Generate OTP
  static async generate(phone: string) {
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60000); // 5 mins
      await sendOtp(phone, code);
      return await prisma.otp.upsert({
        where: { phone },
        update: { code, expiresAt },
        create: { phone, code, expiresAt },
      });
    } catch (error) {
      throw new Error("Failed to generate OTP: " + (error as Error).message);
    }
  }

  // Verify OTP
  static async verify(phone: string, code: string) {
    try {
      const record = await prisma.otp.findUnique({ where: { phone } });
      if (!record || record.code !== code || new Date() > record.expiresAt) {
        return false;
      }
      await prisma.otp.delete({ where: { phone } });
      return true;
    } catch (error) {
      throw new Error("Failed to verify OTP: " + (error as Error).message);
    }
  }
}
