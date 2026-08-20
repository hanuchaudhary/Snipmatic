import { prisma } from "@snipmatic/db";
import { WEB_URL } from "@snipmatic/utils";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { openAPI } from "better-auth/plugins";

import { resend } from "./resend";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  user: {
    additionalFields: {
      role: {
        type: "string",
        fieldName: "role",
      },
    },
  },
  session: {
    additionalFields: {
      role: {
        type: "string",
        fieldName: "role",
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    onExistingUserSignUp: async ({ user }) => {
      console.log("Existing user sign-up attempt:", user.email);
    },
    requireEmailVerification: true,
    minPasswordLength: 6,
    sendResetPassword: async ({ user, url }) => {
      try {
        console.log("Sending password reset email to:", user.email);
        await resend.emails
          .send({
            from: "Snipmatic <alert@snipmatic.com>",
            to: user.email,
            subject: "Internal Password Reset Request",
            html: `<p>Hello ${user.name},</p>
            <p>You are receiving this email because you (or someone else) have requested a password reset for your account.</p>
            <p>Please click the button below to reset your password:</p>
            <a href="${url}">Reset Password</a>
            <p>If you did not request a password reset, please ignore this email.</p>
            <p>Thank you,</p>
            <p>Snipmatic Team</p>`,
          })
          .catch((error) => {
            console.error("Resend email error:", error);
          });
      } catch (error) {
        console.error("Failed to send password reset email:", error);
      }
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }) => {
      try {
        const frontendOrigin = WEB_URL;
        const verifyUrl = `${frontendOrigin}/verify-email?token=${encodeURIComponent(token)}`;
        console.log("Verification email URL:", verifyUrl);
      } catch (error) {
        console.error("Failed to send verification email:", error);
      }
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: ["http://localhost:3000", "http://localhost:5173", WEB_URL],
  plugins: [openAPI()],
  logger: {
    level: "info",
    format: "pretty",
  },
});
