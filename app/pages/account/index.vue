<script setup lang="ts">
definePageMeta({
  auth: {
    only: "user",
    redirectUserTo: "/login",
  },
});

useHead({ title: "Account · Glitch" });

const { user, signOut, updateUser } = useUserSession();
const toast = useToast();

const initial = computed(() => user.value?.name?.trim().charAt(0).toUpperCase() ?? "?");

const joinedAt = computed(() => {
  if (!user.value?.createdAt) return "—";
  return new Date(user.value.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
});

async function onSignOut() {
  await signOut({
    onSuccess: () => {
      void navigateTo("/login");
    },
  });
}

const editing = ref(false);
const name = ref("");
const saving = ref(false);

function startEdit() {
  name.value = user.value?.name ?? "";
  editing.value = true;
}

async function saveProfile() {
  if (!name.value.trim() || name.value === user.value?.name) {
    editing.value = false;
    return;
  }
  saving.value = true;
  try {
    await updateUser({ name: name.value.trim() });
    toast.add({
      title: "Profile updated",
      color: "success",
      icon: "i-lucide-check",
    });
    editing.value = false;
  } catch (error) {
    toast.add({
      title: "Could not update profile",
      description: error instanceof Error ? error.message : String(error),
      color: "error",
      icon: "i-lucide-circle-alert",
    });
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <UContainer class="py-12 space-y-10">
    <header class="space-y-3">
      <span
        class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-elevated text-toned text-xs font-mono uppercase tracking-[0.08em]"
      >
        <span class="size-1.5 rounded-full bg-primary" />
        Account
      </span>
      <h1 class="text-4xl font-semibold tracking-[-0.02em] text-highlighted">
        Welcome <span class="font-pixel text-primary">back</span>,
        {{ user?.name ?? "player" }}
      </h1>
      <p class="text-sm text-muted">
        Manage your profile, sign out, or jump back into the catalog.
      </p>
    </header>

    <div class="grid gap-6 md:grid-cols-3">
      <UPageCard class="md:col-span-2 divide-y divide-default">
        <template #header>
          <div class="flex items-start gap-4">
            <div
              class="size-14 rounded-full bg-primary text-inverted flex items-center justify-center text-2xl font-semibold"
            >
              {{ initial }}
            </div>
            <div class="space-y-1">
              <h2 class="text-xl font-semibold text-highlighted">Profile</h2>
              <p class="text-sm text-muted">Your display name shows up on orders and reviews.</p>
            </div>
          </div>
        </template>

        <div class="py-5 space-y-1">
          <div class="text-xs font-mono uppercase tracking-[0.08em] text-toned">Display name</div>
          <div v-if="!editing" class="flex items-center justify-between gap-4">
            <span class="text-default">{{ user?.name ?? "—" }}</span>
            <UButton size="xs" variant="ghost" color="neutral" label="Edit" @click="startEdit" />
          </div>
          <form v-else class="flex items-center gap-2" @submit.prevent="() => saveProfile()">
            <UInput v-model="name" class="flex-1" placeholder="Your name" :disabled="saving" />
            <UButton type="submit" size="sm" color="primary" :loading="saving" label="Save" />
            <UButton
              size="sm"
              color="neutral"
              variant="outline"
              :disabled="saving"
              label="Cancel"
              @click="
                () => {
                  editing = false;
                }
              "
            />
          </form>
        </div>

        <div class="py-5 space-y-1">
          <div class="text-xs font-mono uppercase tracking-[0.08em] text-toned">Email</div>
          <span class="text-default">{{ user?.email ?? "—" }}</span>
        </div>

        <div class="py-5 space-y-1">
          <div class="text-xs font-mono uppercase tracking-[0.08em] text-toned">Role</div>
          <UBadge
            :color="user?.role === 'admin' ? 'primary' : 'neutral'"
            :variant="user?.role === 'admin' ? 'solid' : 'subtle'"
            :label="user?.role ?? 'user'"
            class="font-mono uppercase tracking-[0.08em]"
          />
        </div>

        <div class="py-5 space-y-1">
          <div class="text-xs font-mono uppercase tracking-[0.08em] text-toned">Member since</div>
          <span class="text-default">{{ joinedAt }}</span>
        </div>
      </UPageCard>

      <div class="space-y-6">
        <UPageCard class="space-y-3">
          <template #header>
            <h2 class="text-base font-semibold text-highlighted">Quick links</h2>
          </template>
          <UButton
            to="/"
            variant="ghost"
            color="neutral"
            block
            icon="i-lucide-gamepad-2"
            label="Browse catalog"
          />
          <UButton
            v-if="user?.role === 'admin'"
            to="/admin"
            variant="ghost"
            color="primary"
            block
            icon="i-lucide-shield"
            label="Admin dashboard"
          />
        </UPageCard>

        <UPageCard class="space-y-3">
          <template #header>
            <h2 class="text-base font-semibold text-highlighted">Session</h2>
          </template>
          <p class="text-sm text-muted">
            Sign out of this device. You'll need to log in again to view orders.
          </p>
          <UButton
            color="error"
            variant="outline"
            block
            icon="i-lucide-log-out"
            label="Sign out"
            @click="onSignOut"
          />
        </UPageCard>
      </div>
    </div>
  </UContainer>
</template>
