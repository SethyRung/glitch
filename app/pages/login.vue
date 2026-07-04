<script setup lang="ts">
import * as z from "zod";

definePageMeta({
  layout: "auth",
  auth: {
    only: "guest",
    redirectGuestTo: "/",
  },
});

useHead({ title: "Sign in · Glitch" });

const schema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string("Password is required").min(1, "Password is required"),
});

type Schema = z.output<typeof schema>;

const { execute, status, error } = useSignIn("email");
const pending = computed(() => status.value === "pending");

function humaniseCode(code: string): string {
  return code
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/^./, (c) => c.toUpperCase());
}

async function onSubmit(event: { data: Schema }) {
  await execute({
    email: event.data.email,
    password: event.data.password,
  });
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
        Welcome <span class="font-pixel text-primary">back</span>
      </h1>
      <p class="text-sm text-muted">Sign in to continue building your library.</p>
    </header>

    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      :title="error.code ? humaniseCode(error.code) : 'Sign in failed'"
      :description="error.message"
      data-testid="login-error"
    />

    <UPageCard class="w-full">
      <UAuthForm
        :schema="schema"
        :fields="[
          {
            name: 'email',
            type: 'email',
            label: 'Email',
            placeholder: 'you@example.com',
            required: true,
            autocomplete: 'email',
          },
          {
            name: 'password',
            type: 'password',
            label: 'Password',
            placeholder: '••••••••',
            required: true,
            autocomplete: 'current-password',
          },
        ]"
        :submit="{ label: pending ? 'Signing in…' : 'Sign in', block: true, loading: pending }"
        @submit="onSubmit"
      >
        <template #password-hint>
          <NuxtLink to="/forgot-password" class="text-sm text-primary font-medium">
            Forgot password?
          </NuxtLink>
        </template>
        <template #footer>
          Don't have an account?
          <NuxtLink to="/register" class="text-primary font-medium"> Create one </NuxtLink>
        </template>
      </UAuthForm>
    </UPageCard>

    <p class="text-center text-xs font-mono text-dimmed">
      Demo accounts:<br />
      admin@easyshop.com<br />
      demo@easyshop.com<br />
      (password123)
    </p>
  </div>
</template>
