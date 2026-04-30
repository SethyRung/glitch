<script lang="ts" setup>
import { z } from "zod";

const toast = useToast();
const route = useRoute();
const router = useRouter();

const redirect = computed(() => (route.query.redirect as string) || "/");

const schema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

type Schema = z.output<typeof schema>;

const state = reactive<Partial<Schema>>({ email: "", password: "" });

const loading = ref(false);
const user = useUser();

async function onSubmit() {
  try {
    loading.value = true;

    const res = await $fetch("/api/auth/login", {
      method: "post",
      body: toRaw(state),
    });

    if (isSuccessResponse(res)) {
      user.value = res.data;
      toast.add({ title: "Welcome back!", color: "success", icon: "i-lucide:circle-check" });
      router.push(redirect.value);
    } else {
      toast.add({
        title: "Login failed",
        description: res.status.message,
        color: "error",
        icon: "i-lucide:circle-x",
      });
    }
  } finally {
    loading.value = false;
  }
}

function fillDemo() {
  state.email = "demo@easyshop.com";
  state.password = "password123";
}
</script>

<template>
  <UForm :schema="schema" :state="state" class="space-y-6" @submit="onSubmit">
    <UFormField name="email" label="Email" required size="xl">
      <UInput v-model="state.email" type="email" placeholder="you@example.com" class="w-full" />
    </UFormField>

    <UFormField name="password" label="Password" required size="xl">
      <UInput v-model="state.password" type="password" placeholder="••••••••" class="w-full" />
    </UFormField>

    <UButton type="submit" label="Sign in" :loading="loading" block size="xl" />

    <UButton
      color="neutral"
      variant="soft"
      label="Use demo account"
      block
      size="xl"
      @click="
        () => {
          fillDemo();
          onSubmit();
        }
      "
    />
  </UForm>
</template>
