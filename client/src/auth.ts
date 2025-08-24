import { PrismaAdapter } from "@auth/prisma-adapter";
import Resend from "next-auth/providers/resend";
import { DefaultSession } from "next-auth";
import authConfig from "./auth.config";
import { prisma } from "@/lib/prisma";
import NextAuth from "next-auth";
import "next-auth/jwt";
import Google from "next-auth/providers/google";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/signin",
    verifyRequest: "/verify",
  },
  providers: [
    // ...authConfig.providers,
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY as string,
      from: process.env.AUTH_RESEND_DOMAIN as string,
      name: "Snipmatic",
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID as string,
      clientSecret: process.env.AUTH_GOOGLE_SECRET as string,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }

      return session;
    },
  },
  debug: true,
  trustHost: true,
});
