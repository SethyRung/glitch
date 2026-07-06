<script setup lang="ts">
definePageMeta({
  auth: {
    only: "user",
    redirectUserTo: "/login",
  },
});

const route = useRoute();
const id = computed(() => route.params.id as string);

useHead({ title: "Receipt · Glitch" });

const { data, pending, error } = await useFetch<ApiResponse<LibraryItem>>(
  () => `/api/library/${id.value}`,
);

const envelope = computed(() => (isSuccessResponse(data.value) ? data.value : null));
const item = computed(() => envelope.value?.data ?? null);
const notFound = computed(
  () =>
    data.value !== null &&
    data.value !== undefined &&
    data.value.status.code === ApiResponseCode.NotFound,
);

const statusLabel: Record<PurchaseStatus, string> = {
  pending: "Pending",
  completed: "Completed",
  failed: "Failed",
  refunded: "Refunded",
};

const statusColor: Record<PurchaseStatus, "warning" | "success" | "error" | "neutral"> = {
  pending: "warning",
  completed: "success",
  failed: "error",
  refunded: "neutral",
};

const purchasedAt = computed(() => {
  if (!item.value) return "—";
  const d = new Date(item.value.createdAt);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
});
</script>

<template>
  <UContainer class="py-12 lg:py-16 space-y-10">
    <NuxtLink
      to="/library"
      class="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-[0.08em] text-toned hover:text-default transition-colors"
    >
      <UIcon name="i-lucide-arrow-left" class="size-3.5" />
      Back to library
    </NuxtLink>

    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      title="Could not load receipt"
      :description="error.message"
    />

    <UEmpty
      v-else-if="notFound"
      icon="i-lucide-file-x"
      title="Receipt not found"
      description="This order doesn't exist or belongs to another account."
      :actions="[
        { label: 'Back to library', to: '/library', color: 'neutral', variant: 'outline' },
      ]"
    />

    <div v-else-if="pending" class="space-y-6">
      <USkeleton class="aspect-video rounded-xl max-w-3xl" />
      <USkeleton class="h-40 rounded-xl" />
    </div>

    <article v-else-if="item" class="grid gap-10 lg:grid-cols-[2fr_3fr]">
      <div class="space-y-4">
        <div class="rounded-xl ring-1 ring-default overflow-hidden bg-muted aspect-video">
          <img
            :src="item.game.imageUrl"
            :alt="`${item.game.name} cover art`"
            class="w-full h-full object-cover"
          />
        </div>
        <UButton
          :to="`/games/${item.game.id}`"
          color="primary"
          block
          icon="i-lucide-external-link"
          label="View game page"
        />
      </div>

      <div class="space-y-8">
        <header class="space-y-4">
          <UBadge
            :color="statusColor[item.status]"
            variant="solid"
            :ui="{ base: 'px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-[0.08em]' }"
            :label="statusLabel[item.status]"
          />
          <h1
            class="text-3xl sm:text-4xl font-semibold tracking-[-0.02em] leading-[1.05] text-highlighted"
          >
            {{ item.game.name }}
          </h1>
          <p class="text-sm font-mono text-toned">
            {{ item.game.developer }} · {{ item.game.category }}
          </p>
        </header>

        <div class="rounded-xl bg-default ring-1 ring-default divide-y divide-default">
          <div class="p-5 flex items-center justify-between">
            <span class="text-xs font-mono uppercase tracking-[0.08em] text-toned">Price paid</span>
            <span class="text-2xl font-semibold text-primary">
              {{ formatPrice(item.pricePaid) }}
            </span>
          </div>

          <div class="p-5 flex items-center justify-between gap-4">
            <span class="text-xs font-mono uppercase tracking-[0.08em] text-toned">Purchased</span>
            <span class="text-sm text-default font-mono">{{ purchasedAt }}</span>
          </div>

          <div class="p-5 flex items-center justify-between gap-4">
            <span class="text-xs font-mono uppercase tracking-[0.08em] text-toned"
              >Payment method</span
            >
            <span class="text-sm text-default font-mono">
              {{ item.paymentMethod ?? "—" }}
            </span>
          </div>

          <div class="p-5 flex items-center justify-between gap-4">
            <span class="text-xs font-mono uppercase tracking-[0.08em] text-toned">Reference</span>
            <span class="text-sm text-default font-mono break-all text-right">
              {{ item.paymentReference ?? "—" }}
            </span>
          </div>

          <div class="p-5 flex items-center justify-between gap-4">
            <span class="text-xs font-mono uppercase tracking-[0.08em] text-toned">Order ID</span>
            <span class="text-sm text-default font-mono break-all text-right">{{ item.id }}</span>
          </div>
        </div>
      </div>
    </article>
  </UContainer>
</template>
