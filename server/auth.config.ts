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
  plugins: [
    admin({
      defaultRole: "user",
      adminRoles: ["admin"],
    }),
  ],
});
