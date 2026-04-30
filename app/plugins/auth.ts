export default defineNuxtPlugin({
  name: "auth",
  dependsOn: ["fetch"],
  async setup() {
    const user = useUser();

    try {
      const res = await useApi("/api/auth/me");
      if (res.status.code === ApiResponseCode.Success) {
        user.value = res.data;
      }
    } catch {
      user.value = null;
    }
  },
});
