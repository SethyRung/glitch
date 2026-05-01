<script lang="ts" setup>
import { z } from "zod";

const toast = useToast();
const route = useRoute();
const router = useRouter();

const redirect = computed(() => (route.query.redirect as string) || "/");

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email"),
  password: z.string().min(6, "Min 6 characters"),
});

type Schema = z.output<typeof schema>;

const state = reactive<Partial<Schema>>({ name: "", email: "", password: "" });

const user = useUser();
const loading = ref(false);

async function onSubmit() {
  try {
    loading.value = true;

    const res = await useApi("/api/auth/register", {
      method: "post",
      body: toRaw(state),
    });

    if (isSuccessResponse(res)) {
      user.value = res.data;
      toast.add({ title: "Account created!", color: "success", icon: "i-lucide:circle-check" });
      router.push(redirect.value);
    } else {
      toast.add({
        title: "Registration failed",
        description: res.status.message,
        color: "error",
        icon: "i-lucide:circle-x",
      });
    }
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <UForm :schema="schema" :state="state" class="space-y-6" @submit="onSubmit">
    <UFormField name="name" label="Name" required size="xl">
      <UInput v-model="state.name" placeholder="Your name" class="w-full" />
    </UFormField>

    <UFormField name="email" label="Email" required size="xl">
      <UInput v-model="state.email" type="email" placeholder="you@example.com" class="w-full" />
    </UFormField>

    <UFormField name="password" label="Password" required size="xl">
      <UInput v-model="state.password" type="password" placeholder="••••••••" class="w-full" />
    </UFormField>

    <UButton type="submit" label="Create account" :loading="loading" block size="xl" />
  </UForm>
</template>
