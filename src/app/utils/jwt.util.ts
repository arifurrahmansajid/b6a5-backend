import type { JwtPayload, SignOptions } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import type { StringValue } from "ms";

const generateToken = (payload: JwtPayload, secret: string, expiresIn: StringValue) => {
  const options: SignOptions = { expiresIn };
  const token = jwt.sign(payload, secret, options);
  return token;
};

const verifyToken = (token: string, secret: string) => {
  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    return {
      success: true,
      data: decoded,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
      error,
    };
  }
};

const decodeToken = (token: string) => {
  const decoded = jwt.decode(token) as JwtPayload;
  return decoded;
};

export const jwtUtils = {
  generateToken,
  verifyToken,
  decodeToken,
};
