import { BACKEND_URL } from "@snipmatic/utils";
import { inferAdditionalFields } from "better-auth/client/plugins";
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
  plugins: [
    inferAdditionalFields({
      user: {
        role: {
          type: "string",
          required: false,
          input: false,
        },
      },
    }),
  ],
});
