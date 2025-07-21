import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY!,
      from: process.env.AUTH_RESEND_DOMAIN!,
      name: "Snipmatic",
      
    }),
  ],
  debug: true,
});
