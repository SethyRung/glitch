import { admin } from "better-auth/plugins";
import { defineServerAuth } from "@onmax/nuxt-better-auth/config";

export default defineServerAuth({
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    autoSignIn: true,
  },
  plugins: [
    admin({
      defaultRole: "user",
      adminRoles: ["admin"],
    }),
  ],
});
