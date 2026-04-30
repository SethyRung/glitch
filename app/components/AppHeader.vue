<script lang="ts" setup>
const cart = useCartStore();
const user = useUser();

const navItems = computed(() => [
  { label: "Store", to: "/", icon: "i-lucide-store" },
  { label: "Purchases", to: "/purchases", icon: "i-lucide-receipt" },
]);

async function logout() {
  const res = await useApi("/api/auth/logout", { method: "POST" });
  if (isSuccessResponse(res)) {
    user.value = null;
    await navigateTo("/");
  }
}

const userMenuItems = [
  [
    { label: "Profile", icon: "i-lucide-user", to: "/me" },
    { label: "Purchases", icon: "i-lucide-receipt", to: "/purchases" },
  ],
  [{ label: "Logout", icon: "i-lucide-log-out", onSelect: logout }],
];
</script>

<template>
  <UHeader
    :ui="{
      title: 'flex items-center gap-2 font-bold text-xl',
      right: 'flex items-center gap-4',
    }"
  >
    <template #title>
      <UIcon name="i-lucide:gamepad-2" class="text-primary size-6" />
      <span>Glitch</span>
    </template>

    <UNavigationMenu :items="navItems" />

    <template #right>
      <CartSlideover>
        <UChip :text="cart.count" :show="cart.count > 0" size="3xl">
          <UButton color="neutral" variant="ghost" icon="i-lucide-shopping-cart" />
        </UChip>
      </CartSlideover>

      <UDropdownMenu v-if="user" :items="userMenuItems">
        <UAvatar :alt="user.name" />
      </UDropdownMenu>

      <UButton v-else label="Sign in" to="/auth" />
    </template>

    <template #body>
      <UNavigationMenu :items="navItems" orientation="vertical" class="-mx-2.5" />
    </template>
  </UHeader>
</template>
