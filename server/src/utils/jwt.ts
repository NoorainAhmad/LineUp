import jwt from "jsonwebtoken";
import crypto from "crypto" 

// JWT PAYLOAD
export interface JwtPayload {
  userId: string;
  userRole: string;
}

// JWT UTIL
export const jwtUtil = {
  // SIGN TOKEN WITH EXPIRATION
  async sign(payload: JwtPayload, secret: string) {
    return new Promise<string>((resolve, reject) => {
      jwt.sign(
        payload, 
        secret, 
        { expiresIn: "15m" }, 
        (err, token) => {
        if (err) {
          reject(err);
        } else {
          resolve(token!);
        }
      });
    });
  },


  // VERIFY TOKEN WITH SECRET
  async verify(token: string, secret: string) {
    return new Promise<{ userId: string }>((resolve, reject) => {
      jwt.verify(token, secret, (err, decoded) => {
        if (err) {
          reject(err);
        } else {
          resolve(decoded as { userId: string });
        }
      });
    });
  },

  //Refresh token ID that is sent to client
  generateTokenId():{id:string; raw:string} {
    const id = crypto.randomBytes(16).toString("hex")
    const raw= crypto.randomBytes(64).toString("hex")
    return {id, raw};
  },

  //Computing refresh Expiry date(For DB)
  refreshExpiresAt(): Date {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d;
  },
};
