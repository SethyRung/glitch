<script setup lang="ts">
import * as z from "zod";

definePageMeta({
  layout: "auth",
  auth: {
    only: "guest",
    redirectGuestTo: "/",
  },
});

useHead({ title: "Forgot password · Glitch" });

const schema = z.object({
  email: z.email("Enter a valid email"),
});

type Schema = z.output<typeof schema>;

const submitted = ref(false);
const submittedEmail = ref("");
const pending = ref(false);
const errorMessage = ref<string | null>(null);

async function onSubmit(event: { data: Schema }) {
  pending.value = true;
  errorMessage.value = null;
  try {
    await $fetch("/api/auth/request-password-reset", {
      method: "POST",
      body: {
        email: event.data.email,
        redirectTo: "/reset-password",
      },
    });
    submittedEmail.value = event.data.email;
    submitted.value = true;
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "Could not send the reset link. Please try again.";
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
        Reset your <PixelAccent>password</PixelAccent>
      </h1>
      <p class="text-sm text-muted">
        Enter your email and we'll send you a link to pick a new one.
      </p>
    </header>

    <UAlert
      v-if="errorMessage && !submitted"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      title="Could not send the reset link"
      :description="errorMessage"
      data-testid="forgot-error"
    />

    <UPageCard v-if="!submitted" class="w-full">
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
        ]"
        :submit="{ label: pending ? 'Sending…' : 'Send reset link', block: true, loading: pending }"
        @submit="onSubmit"
      >
        <template #footer>
          Remembered it?
          <NuxtLink to="/login" class="text-primary font-medium"> Back to sign in </NuxtLink>
        </template>
      </UAuthForm>
    </UPageCard>

    <UPageCard v-else class="w-full">
      <div class="text-center space-y-4 py-2">
        <div
          class="mx-auto size-12 rounded-full bg-primary/15 text-primary flex items-center justify-center"
        >
          <UIcon name="i-lucide-mail-check" class="size-6" />
        </div>
        <h2 class="text-xl font-semibold text-highlighted">Check your inbox</h2>
        <p class="text-sm text-muted">
          If an account exists for
          <span class="font-medium text-default">{{ submittedEmail }}</span
          >, we've sent a reset link. The link expires in one hour.
        </p>
        <p class="text-xs font-mono uppercase tracking-[0.08em] text-dimmed pt-2">
          Demo mode — reset link is printed to the server console.
        </p>
        <UButton to="/login" variant="outline" color="neutral" block label="Back to sign in" />
      </div>
    </UPageCard>
  </div>
</template>
