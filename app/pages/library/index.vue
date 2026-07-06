<script setup lang="ts">
useHead({ title: "Library · Glitch" });

definePageMeta({
  auth: {
    only: "user",
    redirectUserTo: "/login",
  },
});

const PAGE_SIZE = 12;

const STATUS_FILTERS: ("All" | PurchaseStatus)[] = [
  "All",
  "completed",
  "pending",
  "failed",
  "refunded",
];

const statusLabel: Record<"All" | PurchaseStatus, string> = {
  All: "All",
  completed: "Owned",
  pending: "Pending",
  failed: "Failed",
  refunded: "Refunded",
};

const selectedStatus = ref<"All" | PurchaseStatus>("All");
const page = ref(1);

const query = computed(() => ({
  status: selectedStatus.value === "All" ? undefined : selectedStatus.value,
  limit: PAGE_SIZE,
  offset: (page.value - 1) * PAGE_SIZE,
}));

const { data, pending, error } = await useFetch("/api/library", {
  query,
  watch: [query],
});

const { data: statsData } = await useFetch("/api/library/stats");

const envelope = computed(() => (isSuccessResponse(data.value) ? data.value : null));
const stats = computed(() => (isSuccessResponse(statsData.value) ? statsData.value.data : null));
const items = computed(() => envelope.value?.data?.items ?? []);
const total = computed(() => envelope.value?.meta?.total ?? 0);
const pageCount = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)));

watch([selectedStatus], () => {
  page.value = 1;
});
</script>

<template>
  <UContainer class="py-12 lg:py-16 space-y-10">
    <header class="flex flex-wrap items-end justify-between gap-6">
      <div class="space-y-3">
        <span
          class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-elevated text-toned text-xs font-mono uppercase tracking-[0.08em]"
        >
          <span class="size-1.5 rounded-full bg-primary" />
          Library
        </span>
        <h1
          class="text-4xl sm:text-5xl font-semibold tracking-[-0.02em] leading-[1.05] text-highlighted"
        >
          Your <span class="font-pixel-circle text-primary">library</span>
        </h1>
        <p class="text-sm text-muted max-w-xl">
          Games you've purchased from Glitch. Completed orders unlock the receipt; pending orders
          are waiting on the bank app.
        </p>
      </div>

      <dl
        v-if="stats"
        class="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-3 text-left sm:text-right"
      >
        <div class="space-y-1">
          <dt class="text-[10px] font-mono uppercase tracking-[0.08em] text-toned">Owned</dt>
          <dd class="text-2xl font-semibold text-highlighted">
            {{ stats.byStatus.completed }}
          </dd>
        </div>
        <div class="space-y-1">
          <dt class="text-[10px] font-mono uppercase tracking-[0.08em] text-toned">Pending</dt>
          <dd class="text-2xl font-semibold text-highlighted">
            {{ stats.byStatus.pending }}
          </dd>
        </div>
        <div class="space-y-1">
          <dt class="text-[10px] font-mono uppercase tracking-[0.08em] text-toned">Failed</dt>
          <dd class="text-2xl font-semibold text-highlighted">
            {{ stats.byStatus.failed }}
          </dd>
        </div>
        <div class="space-y-1">
          <dt class="text-[10px] font-mono uppercase tracking-[0.08em] text-toned">Spent</dt>
          <dd class="text-2xl font-semibold text-primary">{{ formatPrice(stats.totalSpent) }}</dd>
        </div>
      </dl>
    </header>

    <div class="flex flex-wrap gap-2" role="tablist" aria-label="Filter by status">
      <button
        v-for="status in STATUS_FILTERS"
        :key="status"
        type="button"
        role="tab"
        :aria-selected="selectedStatus === status"
        class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-mono uppercase tracking-[0.08em] transition-colors ring-1"
        :class="
          selectedStatus === status
            ? 'bg-primary text-inverted ring-primary'
            : 'bg-elevated text-toned ring-default hover:text-default'
        "
        @click="selectedStatus = status"
      >
        {{ statusLabel[status] }}
        <span
          v-if="status !== 'All' && stats"
          class="text-[10px] opacity-70"
          :class="selectedStatus === status ? 'text-inverted' : 'text-dimmed'"
        >
          {{ stats.byStatus[status] }}
        </span>
      </button>
    </div>

    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      title="Could not load library"
      :description="error.message"
    />

    <div v-else-if="pending && items.length === 0" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <USkeleton v-for="i in 6" :key="i" class="aspect-[16/9] rounded-xl" />
      <USkeleton v-for="i in 6" :key="`b-${i}`" class="h-24 rounded-xl" />
    </div>

    <UEmpty
      v-else-if="items.length === 0"
      icon="i-lucide-library"
      :title="
        selectedStatus === 'All'
          ? 'No purchases yet'
          : `No ${statusLabel[selectedStatus].toLowerCase()} orders`
      "
      :description="
        selectedStatus === 'All'
          ? 'Games you buy will show up here once the bank app confirms payment.'
          : 'Try a different filter to see other orders.'
      "
      :actions="
        selectedStatus === 'All'
          ? [{ label: 'Browse catalog', color: 'primary', to: '/catalog' }]
          : [
              {
                label: 'Show all',
                color: 'neutral',
                variant: 'outline',
                onClick: () => {
                  selectedStatus = 'All';
                },
              },
            ]
      "
    />

    <div v-else class="space-y-8">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <LibraryCard v-for="item in items" :key="item.id" :item="item" />
      </div>

      <UPagination
        v-if="pageCount > 1"
        v-model:page="page"
        :total="total"
        :items-per-page="PAGE_SIZE"
        :sibling-count="1"
        color="primary"
        active-variant="solid"
        show-controls
        class="justify-center"
      />
    </div>
  </UContainer>
</template>
