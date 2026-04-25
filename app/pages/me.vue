<script lang="ts" setup>
const { data } = await useApiFetch("/api/auth/me");

const user = computed(() => data.value?.data);
</script>

<template>
  <UContainer class="py-8">
    <UPageHeader title="Profile" description="Your account details" />

    <div class="mt-6 max-w-md">
      <UCard>
        <div class="flex items-center gap-4">
          <UAvatar :alt="user?.name" size="lg" />
          <div>
            <p class="font-semibold text-lg">{{ user?.name }}</p>
            <p class="text-muted text-sm">{{ user?.email }}</p>
          </div>
        </div>

        <USeparator class="my-4" />

        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted">Balance</p>
            <p class="text-2xl font-bold text-primary">${{ user?.balance }}</p>
          </div>
          <UIcon name="i-lucide-wallet" class="text-muted size-8" />
        </div>
      </UCard>
    </div>
  </UContainer>
</template>
