import { adminClient } from "better-auth/client/plugins";
import { defineClientAuth } from "@onmax/nuxt-better-auth/config";

export default defineClientAuth({
  plugins: [adminClient()],
});
