import type { $Fetch } from "nitropack";

declare module "#app" {
  interface NuxtApp {
    $fetch: $Fetch;
  }
}

declare module "vue" {
  interface ComponentCustomProperties {
    $fetch: $Fetch;
  }
}

export {};
