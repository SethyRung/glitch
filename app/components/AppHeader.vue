<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const { user } = useUserSession();

const navItems = computed<NavigationMenuItem[]>(() => [
  { label: "Catalog", to: "/catalog", icon: "i-lucide-gamepad-2" },
  ...(user.value ? [{ label: "Library", to: "/library", icon: "i-lucide-library" }] : []),
]);
</script>

<template>
  <UHeader>
    <template #left>
      <BrandMark />
    </template>

    <UNavigationMenu :items="navItems" />

    <template #right>
      <UButton
        to="/cart"
        variant="ghost"
        color="neutral"
        icon="i-lucide-shopping-cart"
        aria-label="View cart"
      >
        <template #trailing>
          <UBadge
            color="primary"
            variant="solid"
            :ui="{ base: 'px-1.5 py-0 text-[10px] font-mono' }"
            label="0"
          />
        </template>
      </UButton>

      <UColorModeButton variant="ghost" color="neutral" />

      <UButton
        v-if="user"
        to="/account"
        variant="ghost"
        color="neutral"
        icon="i-lucide-user-round"
        aria-label="Open account"
      />
      <UButton
        v-else
        to="/login"
        variant="ghost"
        color="neutral"
        icon="i-lucide-log-in"
        label="Sign in"
      />
    </template>

    <template #body>
      <UNavigationMenu
        :items="navItems"
        orientation="vertical"
        :ui="{
          link: 'font-mono  py-2.5',
        }"
      />
    </template>
  </UHeader>
</template>
