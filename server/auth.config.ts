import { admin } from "better-auth/plugins";
import { defineServerAuth } from "@onmax/nuxt-better-auth/config";

export default defineServerAuth({
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    autoSignIn: true,
    sendResetPassword: async ({ user, url }) => {
      console.log(`[auth] Password reset requested for ${user.email}: ${url}`);
    },
  },
  user: {
    additionalFields: {
      nativeUserId: { type: "string", required: false, unique: true },
      bridgeLinkedAt: { type: "string", required: false },
      bridgeIssuer: { type: "string", required: false },
    },
  },
  plugins: [
    admin({
      defaultRole: "user",
      adminRoles: ["admin"],
    }),
  ],
});
