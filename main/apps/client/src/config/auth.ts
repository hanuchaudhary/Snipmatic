import { BACKEND_URL } from "@snipmatic/utils";
import { createAuthClient } from "better-auth/react";

export const {
  useSession,
  signIn,
  signOut,
  signUp,
  updateUser,
  requestPasswordReset,
  verifyEmail,
  resetPassword,
} = createAuthClient({
  baseURL: BACKEND_URL,
});