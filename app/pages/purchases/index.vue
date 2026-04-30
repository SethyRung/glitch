<script lang="ts" setup>
const page = ref(1);
const limit = 20;
const offset = computed(() => (page.value - 1) * limit);

const { data, pending } = await useFetchApi("/api/purchases", {
  query: { limit, offset: offset.value },
  watch: [offset],
});

const purchases = computed(() => (data.value && isSuccessResponse(data.value) ? data.value.data : []) ?? []);
const total = computed(() => (data.value && isSuccessResponse(data.value) ? data.value.meta?.total : 0) ?? 0);

function statusColor(status: string) {
  switch (status) {
    case "completed":
      return "success";
    case "failed":
      return "error";
    case "pending":
      return "warning";
    default:
      return "neutral";
  }
}
</script>

<template>
  <UContainer class="py-8">
    <UPageHeader title="Purchase History" description="Your past orders" />

    <div class="mt-6 space-y-4">
      <div v-if="pending" class="space-y-3">
        <USkeleton v-for="i in 5" :key="i" class="h-16 rounded-lg" />
      </div>

      <div v-else-if="purchases.length === 0" class="text-center py-16 text-muted">
        <UIcon name="i-lucide-receipt" class="size-12 mx-auto mb-4" />
        <p class="text-lg">No purchases yet</p>
        <UButton to="/" label="Browse store" class="mt-4" />
      </div>

      <div v-else class="space-y-3">
        <NuxtLink
          v-for="purchase in purchases"
          :key="purchase.id"
          :to="`/purchases/${purchase.id}`"
          class="block"
        >
          <UCard :ui="{ root: 'hover:bg-elevated/50 transition-colors' }">
            <div class="flex items-center gap-4">
              <img
                v-if="purchase.game && purchase.game.imageUrl"
                :src="purchase.game?.imageUrl"
                :alt="purchase.game?.name"
                class="w-20 h-12 object-cover rounded"
              />
              <div v-else class="w-20 h-12 bg-muted rounded flex items-center justify-center">
                <UIcon name="i-lucide-image" class="text-muted" />
              </div>

              <div class="flex-1 min-w-0">
                <p class="font-medium truncate">{{ purchase.game?.name || "Unknown game" }}</p>
                <p class="text-sm text-muted">
                  {{ purchase.createdAt ? new Date(purchase.createdAt).toLocaleDateString() : "—" }}
                </p>
              </div>

              <div class="text-right">
                <p class="font-semibold">${{ purchase.amount }}</p>
                <UBadge :color="statusColor(purchase.status)" size="xs">
                  {{ purchase.status }}
                </UBadge>
              </div>
            </div>
          </UCard>
        </NuxtLink>
      </div>

      <div v-if="total > limit" class="flex justify-center pt-4">
        <UPagination v-model:page="page" :total="total" :items-per-page="limit" show-edges />
      </div>
    </div>
  </UContainer>
</template>
