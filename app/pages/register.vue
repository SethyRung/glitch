<script setup lang="ts">
import * as z from "zod";

definePageMeta({
  layout: "auth",
  auth: {
    only: "guest",
    redirectGuestTo: "/",
  },
});

useHead({ title: "Create account · Glitch" });

const schema = z
  .object({
    name: z.string("Name is required").min(2, "Name must be at least 2 characters").max(64),
    email: z.email("Enter a valid email"),
    password: z.string("Password is required").min(8, "Password must be at least 8 characters"),
    confirm: z.string("Please confirm your password"),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords don't match",
    path: ["confirm"],
  });

type Schema = z.output<typeof schema>;

const { execute, status, error } = useSignUp("email");
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
    name: event.data.name,
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
        Join the <span class="font-pixel text-primary">catalog</span>
      </h1>
      <p class="text-sm text-muted">Create an account to build a library and check out faster.</p>
    </header>

    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      :title="error.code ? humaniseCode(error.code) : 'Sign up failed'"
      :description="error.message"
      data-testid="register-error"
    />

    <UPageCard class="w-full">
      <UAuthForm
        :schema="schema"
        :fields="[
          {
            name: 'name',
            type: 'text',
            label: 'Display name',
            placeholder: 'Jane Doe',
            required: true,
            autocomplete: 'name',
          },
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
          label: pending ? 'Creating account…' : 'Create account',
          block: true,
          loading: pending,
        }"
        @submit="onSubmit"
      >
        <template #footer>
          Already have an account?
          <NuxtLink to="/login" class="text-primary font-medium"> Sign in </NuxtLink>
        </template>
      </UAuthForm>
    </UPageCard>
  </div>
</template>
