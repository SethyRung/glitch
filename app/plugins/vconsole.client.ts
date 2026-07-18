import VConsole from "vconsole";

export default defineNuxtPlugin({
  name: "vconsole",
  setup() {
    const config = useRuntimeConfig();
    if (config.public.enableVConsole === "false") return;
    new VConsole({ theme: "dark" });
  },
});
