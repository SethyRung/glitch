<script setup lang="ts">
const props = defineProps<{
  item: LibraryItem;
}>();

const statusLabel: Record<PurchaseStatus, string> = {
  pending: "Pending",
  completed: "Owned",
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
  const d = new Date(props.item.createdAt);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
});
</script>

<template>
  <NuxtLink
    :to="`/library/${item.id}`"
    class="group block rounded-xl bg-default ring-1 ring-default overflow-hidden transition-all hover:ring-primary hover:-translate-y-px"
  >
    <div class="relative aspect-video overflow-hidden bg-muted">
      <img
        :src="item.game.imageUrl"
        :alt="`${item.game.name} cover art`"
        loading="lazy"
        class="w-full h-full object-cover"
      />
      <UBadge
        :color="statusColor[item.status]"
        variant="solid"
        :ui="{
          base: 'absolute top-3 left-3 px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.08em]',
        }"
        :label="statusLabel[item.status]"
      />
    </div>

    <div class="p-5 space-y-3">
      <div class="space-y-1">
        <h3 class="text-base font-semibold text-highlighted line-clamp-1">
          {{ item.game.name }}
        </h3>
        <p class="text-xs font-mono text-toned line-clamp-1">
          {{ item.game.developer }} · {{ item.game.category }}
        </p>
      </div>

      <div class="flex items-end justify-between">
        <div class="space-y-0.5">
          <PriceTag>{{ formatPrice(item.pricePaid) }}</PriceTag>
          <div class="text-[11px] font-mono text-toned uppercase tracking-[0.08em]">
            Purchased {{ purchasedAt }}
          </div>
        </div>
        <UIcon
          name="i-lucide-arrow-right"
          class="size-4 text-toned group-hover:text-primary transition-colors"
        />
      </div>
    </div>
  </NuxtLink>
</template>
