import { Role, UserStatus, UserType, UserTypeStatus } from "@/generated/prisma/enums";
import type { NextFunction, Request, Response } from "express";
import status from "http-status";
import { getConfig } from "../config";
import { TOKEN_CONFIG } from "../constants/token.const";
import { prisma } from "../lib/prisma";
import type { TokenPayload } from "../types";
import AppError from "../utils/app-error.util";
import { cookieUtils } from "../utils/cookie.util";
import { jwtUtils } from "../utils/jwt.util";

declare global {
  namespace Express {
    interface Request {
      user: TokenPayload;
    }
  }
}

export const auth = (allowedRoles: Role[] = [], allowedTypes: UserType[] = []) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const config = getConfig();
      const { BETTER_AUTH_SESSION_TOKEN_NAME, ACCESS_TOKEN_NAME } = TOKEN_CONFIG;

      const sessionToken = cookieUtils.getCookie(req, BETTER_AUTH_SESSION_TOKEN_NAME);

      if (config.nodeEnv === "development" && !sessionToken) {
        console.debug("🔑 [Auth] Missing session token. Available cookies:", Object.keys(req.cookies || {}), Object.keys(req.signedCookies || {}));
        console.debug("🔑 [Auth] Looking for:", BETTER_AUTH_SESSION_TOKEN_NAME);
      }

      if (!sessionToken) {
        throw new AppError(status.UNAUTHORIZED, "Unauthorized access! No session token provided.");
      }

      const session = await prisma.session.findUnique({
        where: { token: sessionToken },
        include: {
          user: {
            include: { userTypes: true },
          },
        },
      });

      if (!session || session.expiresAt <= new Date()) {
        throw new AppError(status.UNAUTHORIZED, "Session expired or invalid.");
      }

      // Notify session nearing expiry
      const sessionLifeTime = session.expiresAt.getTime() - session.createdAt.getTime();
      const timeRemaining = session.expiresAt.getTime() - Date.now();
      const isSessionExpiringSoon = (timeRemaining / sessionLifeTime) * 100 <= 20;

      if (isSessionExpiringSoon) {
        res.setHeader("X-Session-Refresh", "true");
        res.setHeader("X-Session-Expire-At", session.expiresAt.toISOString());
        res.setHeader("X-Time-Remaining", timeRemaining.toString());
      }

      const user = session.user;

      if (
        user.status === UserStatus.BANNED ||
        user.status === UserStatus.SUSPENDED ||
        user.status === UserStatus.INACTIVE
      ) {
        throw new AppError(status.FORBIDDEN, "Account is not active");
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        throw new AppError(status.FORBIDDEN, "You do not have permission to access this resource");
      }

      if (allowedTypes.length > 0) {
        const hasRequiredType = user.userTypes.some(
          (ut) => allowedTypes.includes(ut.type) && ut.status === UserTypeStatus.ACTIVE,
        );

        if (!hasRequiredType) {
          throw new AppError(status.FORBIDDEN, "You do not have the required user type.");
        }
      }

      const accessToken = cookieUtils.getCookie(req, ACCESS_TOKEN_NAME);

      if (!accessToken) {
        throw new AppError(status.UNAUTHORIZED, "Unauthorized access! No access token provided.");
      }

      const decoded = jwtUtils.verifyToken(accessToken, config.jwt.accessToken.secret);

      if (!decoded.success || !decoded.data) {
        throw new AppError(status.UNAUTHORIZED, "Invalid access token");
      }

      if (decoded.data.id !== user.id) {
        throw new AppError(status.UNAUTHORIZED, "Token mismatch");
      }

      // Attach user payload to request
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        userTypes: user.userTypes,
      };

      next();
    } catch (error) {
      next(error);
    }
  };
};
