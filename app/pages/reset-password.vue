<script setup lang="ts">
import * as z from "zod";

definePageMeta({
  layout: "auth",
  auth: {
    only: "guest",
    redirectGuestTo: "/",
  },
});

useHead({ title: "Set a new password · Glitch" });

const route = useRoute();

const token = computed(() => (typeof route.query.token === "string" ? route.query.token : ""));

const isInvalidToken = computed(
  () => typeof route.query.error === "string" && route.query.error.length > 0,
);

const schema = z
  .object({
    password: z.string("Password is required").min(8, "Password must be at least 8 characters"),
    confirm: z.string("Please confirm your password"),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords don't match",
    path: ["confirm"],
  });

type Schema = z.output<typeof schema>;

const success = ref(false);
const pending = ref(false);
const errorMessage = ref<string | null>(null);

async function onSubmit(event: { data: Schema }) {
  if (!token.value) return;
  pending.value = true;
  errorMessage.value = null;
  try {
    await $fetch("/api/auth/reset-password", {
      method: "POST",
      body: {
        newPassword: event.data.password,
        token: token.value,
      },
    });
    success.value = true;
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "Could not update the password. Please try again.";
  } finally {
    pending.value = false;
  }
}
</script>

<template>
  <div class="w-full max-w-md space-y-6">
    <header class="text-center space-y-3">
      <span
        class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-elevated text-toned text-xs font-mono uppercase tracking-[0.08em]"
      >
        <span class="size-1.5 rounded-full bg-primary" />
        Account
      </span>
      <h1 class="text-4xl font-semibold tracking-[-0.02em] text-highlighted">
        Set a new <span class="font-pixel-circle text-primary">password</span>
      </h1>
      <p class="text-sm text-muted">Pick something at least 8 characters long.</p>
    </header>

    <UAlert
      v-if="isInvalidToken"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      title="This reset link is invalid or expired"
      description="Request a fresh one and try again."
    />

    <UPageCard v-if="success" class="w-full">
      <div class="text-center space-y-4 py-2">
        <div
          class="mx-auto size-12 rounded-full bg-success/15 text-success flex items-center justify-center"
        >
          <UIcon name="i-lucide-check" class="size-6" />
        </div>
        <h2 class="text-xl font-semibold text-highlighted">Password updated</h2>
        <p class="text-sm text-muted">You can now sign in with your new password.</p>
        <UButton to="/login" color="primary" block label="Back to sign in" />
      </div>
    </UPageCard>

    <template v-else-if="token && !isInvalidToken">
      <UAlert
        v-if="errorMessage"
        color="error"
        variant="subtle"
        icon="i-lucide-circle-alert"
        title="Could not update the password"
        :description="errorMessage"
        data-testid="reset-error"
      />

      <UPageCard class="w-full">
        <UAuthForm
          :schema="schema"
          :fields="[
            {
              name: 'password',
              type: 'password',
              label: 'New password',
              placeholder: 'At least 8 characters',
              required: true,
              autocomplete: 'new-password',
            },
            {
              name: 'confirm',
              type: 'password',
              label: 'Confirm password',
              placeholder: 'Repeat the password',
              required: true,
              autocomplete: 'new-password',
            },
          ]"
          :submit="{
            label: pending ? 'Updating…' : 'Update password',
            block: true,
            loading: pending,
          }"
          @submit="onSubmit"
        >
          <template #footer>
            <NuxtLink to="/forgot-password" class="text-primary font-medium">
              Request a new link
            </NuxtLink>
          </template>
        </UAuthForm>
      </UPageCard>
    </template>

    <UPageCard v-else class="w-full">
      <div class="text-center space-y-4 py-2">
        <div
          class="mx-auto size-12 rounded-full bg-elevated text-toned flex items-center justify-center"
        >
          <UIcon name="i-lucide-key-round" class="size-6" />
        </div>
        <h2 class="text-xl font-semibold text-highlighted">Open the link from your email</h2>
        <p class="text-sm text-muted">
          Reset links arrive in your inbox and include a secure token.
        </p>
        <UButton to="/forgot-password" color="primary" block label="Request a reset link" />
      </div>
    </UPageCard>
  </div>
</template>
