<script setup lang="ts">
const { user } = useUserSession();

const navItems = computed(() => [
  { label: "Catalog", to: "/catalog", icon: "i-lucide-gamepad-2" },
  ...(user.value ? [{ label: "Library", to: "/library", icon: "i-lucide-library" }] : []),
]);
</script>

<template>
  <header class="border-b border-default bg-default/80 backdrop-blur sticky top-0 z-40">
    <div class="mx-auto max-w-7xl px-6 h-14 flex items-center justify-between gap-6">
      <div class="flex items-center gap-8">
        <BrandMark />
        <UNavigationMenu :items="navItems" color="primary" variant="link" class="hidden sm:flex" />
      </div>

      <div class="flex items-center gap-2">
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
      </div>
    </div>
  </header>
</template>
