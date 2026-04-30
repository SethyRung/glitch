<script lang="ts" setup>
const route = useRoute();

const { data, status } = await useFetchApi(`/api/purchases/${route.params.id}`);

const purchase = computed(() => data.value?.data ?? null);
const isLoading = computed(() => status.value === "pending");

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
    <UButton
      to="/purchases"
      color="neutral"
      variant="ghost"
      icon="i-lucide-arrow-left"
      label="Back to purchases"
      class="mb-4"
    />

    <div v-if="isLoading" class="space-y-4">
      <USkeleton class="h-8 w-1/3" />
      <USkeleton class="h-48 w-full" />
    </div>

    <div v-else-if="!purchase" class="text-center py-16 text-muted">
      <UIcon name="i-lucide-receipt" class="size-12 mx-auto mb-4" />
      <p class="text-lg">Purchase not found</p>
    </div>

    <div v-else class="max-w-2xl space-y-6">
      <UPageHeader :title="purchase.game?.name || 'Purchase'" description="Order details" />

      <UCard>
        <div class="flex items-start gap-4">
          <img
            v-if="purchase.game?.imageUrl"
            :src="purchase.game.imageUrl"
            :alt="purchase.game.name"
            class="w-32 h-20 object-cover rounded"
          />
          <div v-else class="w-32 h-20 bg-muted rounded flex items-center justify-center">
            <UIcon name="i-lucide-image" class="text-muted" />
          </div>

          <div class="flex-1 space-y-1">
            <div class="flex items-center justify-between">
              <span class="text-sm text-muted">Status</span>
              <UBadge :color="statusColor(purchase.status)">{{ purchase.status }}</UBadge>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-muted">Amount</span>
              <span class="font-semibold">${{ purchase.amount }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-muted">Quantity</span>
              <span>{{ purchase.quantity }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-muted">Date</span>
              <span>{{
                purchase.createdAt ? new Date(purchase.createdAt).toLocaleDateString() : "—"
              }}</span>
            </div>
            <div v-if="purchase.merchantReference" class="flex items-center justify-between">
              <span class="text-sm text-muted">Reference</span>
              <span class="font-mono text-sm">{{ purchase.merchantReference }}</span>
            </div>
          </div>
        </div>
      </UCard>

      <UButton v-if="purchase.game" :to="`/games/${purchase.game.id}`" label="View game" block />
    </div>
  </UContainer>
</template>
