import { getConfig } from "@/app/config";
import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import type { TokenPayload } from "@/app/types";
import AppError from "@/app/utils/app-error.util";
import { jwtUtils } from "@/app/utils/jwt.util";
import { tokenUtils } from "@/app/utils/token.util";
import { UserStatus } from "@/generated/prisma/enums";
import status from "http-status";
import ms, { type StringValue } from "ms";
import type {
  ChangePasswordPayload,
  PasswordResetPayload,
  RequestPasswordPayload,
  SignInSchemaPayload,
  SignUpPayload,
  VerifyEmailPayload,
} from "./auth.validation";

const signUp = async (payload: SignUpPayload) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (user) {
    throw new AppError(status.CONFLICT, "User already exists. Use another email.");
  }

  const data = await auth.api.signUpEmail({
    body: payload,
  });

  if (!data.user) {
    throw new AppError(status.BAD_REQUEST, "Failed to sign up");
  }

  return data;
};

const verifyEmail = async (payload: VerifyEmailPayload) => {
  const data = await auth.api.verifyEmailOTP({
    body: payload,
  });

  if (data.status) {
    const user = await prisma.user.update({
      where: {
        email: payload.email,
      },
      data: {
        emailVerified: true,
        status: UserStatus.ACTIVE,
      },
    });
    return user;
  }
};

const signIn = async (payload: SignInSchemaPayload) => {
  const data = await auth.api.signInEmail({
    body: payload,
  });

  const user = await prisma.user.findUnique({
    where: { id: data.user.id },
    include: {
      userTypes: true,
    },
  });

  if (!user) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  if (user.status === UserStatus.BANNED) {
    throw new AppError(status.FORBIDDEN, "Your account is banned");
  }

  const tokenPayload: TokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
    userTypes: user.userTypes.map((ut) => ({
      type: ut.type,
      status: ut.status,
    })),
  };

  const accessToken = tokenUtils.generateAccessToken(tokenPayload);
  const refreshToken = tokenUtils.generateRefreshToken(tokenPayload);

  return {
    ...data,
    accessToken,
    refreshToken,
  };
};

const refreshTokens = async (currentSessionToken: string, currentRefreshToken: string) => {
  const config = getConfig();

  const session = await prisma.session.findUnique({
    where: { token: currentSessionToken },
    include: {
      user: {
        include: { userTypes: true },
      },
    },
  });

  if (!session) {
    throw new AppError(status.UNAUTHORIZED, "Invalid session token");
  }

  if (new Date() > session.expiresAt) {
    throw new AppError(status.UNAUTHORIZED, "Session expired. Please login again.");
  }

  const decoded = jwtUtils.verifyToken(currentRefreshToken, config.jwt.refreshToken.secret);

  if (!decoded.success || !decoded.data) {
    throw new AppError(status.UNAUTHORIZED, "Invalid refresh token");
  }

  const payload = decoded.data as TokenPayload;

  if (payload.id !== session.user.id) {
    throw new AppError(status.UNAUTHORIZED, "Token mismatch");
  }

  const user = session.user;

  if (
    user.status === UserStatus.BANNED ||
    user.status === UserStatus.SUSPENDED ||
    user.status === UserStatus.INACTIVE
  ) {
    throw new AppError(status.FORBIDDEN, "Account is not active");
  }

  const tokenPayload: TokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
    userTypes: user.userTypes.map((ut) => ({
      type: ut.type,
      status: ut.status,
    })),
  };

  const accessToken = tokenUtils.generateAccessToken(tokenPayload);
  const refreshToken = tokenUtils.generateRefreshToken(tokenPayload);

  const sesExpInMs = ms(config.betterAuth.sessionToken.expiresIn as StringValue);
  const newExpDate = new Date(Date.now() + sesExpInMs);

  const updatedSession = await prisma.session.update({
    where: { token: currentSessionToken },
    data: {
      expiresAt: newExpDate,
      updatedAt: new Date(),
    },
    select: { token: true },
  });

  return {
    ...updatedSession,
    accessToken,
    refreshToken,
  };
};

const changePassword = async (payload: ChangePasswordPayload, sessionToken: string) => {
  const session = await auth.api.getSession({
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`,
    }),
  });

  if (!session) {
    throw new AppError(status.UNAUTHORIZED, "Invalid session token.");
  }

  const result = await auth.api.changePassword({
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`,
    }),
    body: {
      revokeOtherSessions: true,
      newPassword: payload.newPassword,
      currentPassword: payload.currentPassword,
    },
  });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { userTypes: true },
  });

  if (!user) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  if (
    user.status === UserStatus.BANNED ||
    user.status === UserStatus.SUSPENDED ||
    user.status === UserStatus.INACTIVE
  ) {
    throw new AppError(status.FORBIDDEN, "Account is not active");
  }

  const tokenPayload: TokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
    userTypes: user.userTypes.map((ut) => ({
      type: ut.type,
      status: ut.status,
    })),
  };

  const accessToken = tokenUtils.generateAccessToken(tokenPayload);
  const refreshToken = tokenUtils.generateRefreshToken(tokenPayload);

  return {
    ...result,
    accessToken,
    refreshToken,
  };
};

const requestPasswordReset = async (payload: RequestPasswordPayload) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (user && user.emailVerified && user.status === UserStatus.ACTIVE) {
    const result = await auth.api.requestPasswordResetEmailOTP({
      body: { email: payload.email },
    });

    return result;
  }
};

const passwordReset = async (payload: PasswordResetPayload) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  const result = await auth.api.resetPasswordEmailOTP({
    body: {
      email: payload.email,
      otp: payload.otp,
      password: payload.newPassword,
    },
  });

  if (!result) {
    throw new AppError(status.BAD_REQUEST, "Invalid or expired OTP");
  }

  if (user) {
    await prisma.session.deleteMany({
      where: { userId: user.id },
    });
  }
};

const logout = async (sessionToken: string) => {
  const result = await auth.api.signOut({
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`,
    }),
  });

  return result;
};

const getSession = async (sessionToken: string, userId: string) => {
  const authSession = await auth.api.getSession({
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`,
    }),
  });

  if (!authSession) {
    throw new AppError(status.UNAUTHORIZED, "Invalid session token");
  }

  if (authSession.user.id !== userId) {
    throw new AppError(status.UNAUTHORIZED, "Token mismatch");
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: {
      userTypes: true,
    },
  });

  const session = {
    id: authSession.session.id,
    token: authSession.session.token,
    expiresAt: authSession.session.expiresAt,
    createdAt: authSession.session.createdAt,
    updatedAt: authSession.session.updatedAt,
    ipAddress: authSession.session.ipAddress || "",
    userAgent: authSession.session.userAgent || "",
  };

  return {
    user,
    session,
  };
};

export const authServices = {
  signUp,
  verifyEmail,
  signIn,
  refreshTokens,
  changePassword,
  requestPasswordReset,
  passwordReset,
  logout,
  getSession,
};
