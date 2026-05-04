import { prisma } from "@/app/lib/prisma";
import { betterAuth, type CookieOptions } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer, emailOTP } from "better-auth/plugins";
import status from "http-status";
import ms, { type StringValue } from "ms";
import { Role, UserStatus } from "../../generated/prisma/enums";
import { getConfig } from "../config";
import AppError from "../utils/app-error.util";
import { cookieUtils } from "../utils/cookie.util";
import { sendMail } from "../utils/send-mail";

const config = getConfig();

const sesExpInSec = ms(config.betterAuth.sessionToken.expiresIn as StringValue) / 1000;

const sesUpdateInSec = ms(config.betterAuth.sessionToken.updateAge as StringValue) / 1000;

const cookieCacheInSec = ms(config.betterAuth.sessionToken.cookieCacheAge as StringValue) / 1000;

const cookieOption = cookieUtils.cookieOptions(config.jwt.accessToken.expiresIn) as CookieOptions;

export const auth = betterAuth({
  appName: config.appName.toLowerCase().split(" ").join("_"),
  baseURL: config.betterAuth.baseURL,
  basePath: config.betterAuth.basePath,
  secret: config.betterAuth.secret,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  user: {
    additionalFields: {
      phone: {
        type: "string",
        required: false,
      },
      bio: {
        type: "string",
        required: false,
      },
      avatarUrl: {
        type: "string",
        required: false,
      },
      location: {
        type: "string",
        required: false,
      },
      role: {
        type: "string",
        required: true,
        defaultValue: Role.USER,
      },
      status: {
        type: "string",
        required: true,
        defaultValue: UserStatus.INACTIVE,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
  },
  plugins: [
    bearer(),
    emailOTP({
      overrideDefaultEmailVerification: true,
      expiresIn: 300,
      otpLength: 5,
      sendVerificationOTP: async ({ email, otp, type }) => {
        try {
          const user = await prisma.user.findUnique({ where: { email } });

          if (!user) {
            throw new AppError(status.NOT_FOUND, `No user found with email ${email}`);
          }

          if (type === "email-verification" && user.role === Role.SUPER_ADMIN) {
            console.log(`Skipping OTP for super admin ${email}`);
            return;
          }

          if (type === "email-verification" && !user.emailVerified) {
            await sendMail({
              to: email,
              subject: "Verify your email",
              templateName: "verify-email",
              templateData: {
                name: user.name,
                otp,
                appName: config.appName,
                supportEmail: "support@ummahcare.com",
              },
            });
          }

          if (type === "forget-password") {
            await sendMail({
              to: email,
              subject: "Password Reset Request",
              templateName: "password-reset-otp",
              templateData: {
                name: user.name,
                otp,
                appName: config.appName,
                supportEmail: "support@ummahcare.com",
              },
            });
          }
        } catch (err) {
          console.error(`Error sending OTP to ${email}:`, err);
          throw new AppError(
            status.INTERNAL_SERVER_ERROR,
            "Failed to send OTP email. Please try again later.",
          );
        }
      },
    }),
  ],
  session: {
    expiresIn: sesExpInSec,
    updateAge: sesUpdateInSec,
    cookieCache: {
      enabled: true,
      maxAge: cookieCacheInSec,
    },
  },
  trustedOrigins: config.corsOrigins,
  advanced: {
    cookiePrefix: config.betterAuth.cookiePrefix,
    useSecureCookies: true,
    defaultCookieAttributes: cookieOption,
  },
});
