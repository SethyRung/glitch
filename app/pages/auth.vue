<script lang="ts" setup>
definePageMeta({ layout: "auth" });

const user = useUser();

watchEffect(() => {
  if (user.value) {
    navigateTo("/");
  }
});

const items = [
  { label: "Sign in", slot: "login" },
  { label: "Sign up", slot: "signup" },
];
</script>

<template>
  <div class="w-full max-w-sm mx-auto space-y-6">
    <div class="text-center space-y-2">
      <UIcon name="i-lucide-gamepad-2" class="text-primary size-10 mx-auto" />
      <h1 class="text-2xl font-bold">Glitch</h1>
      <p class="text-muted">Sign in to your account or create a new one</p>
    </div>

    <UTabs
      :items="items"
      :ui="{
        root: 'w-full',
        content: 'mt-4',
      }"
    >
      <template #login>
        <AuthLoginForm />
      </template>

      <template #signup>
        <AuthSignupForm />
      </template>
    </UTabs>
  </div>
</template>
