import jwt from "jsonwebtoken";

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
      jwt.sign(payload, secret, { expiresIn: "7d" }, (err, token) => {
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
};
