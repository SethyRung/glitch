<script setup lang="ts">
defineProps<{
  game: GameSummary;
}>();

const platformIcons: Record<string, string> = {
  windows: "i-lucide-monitor",
  mac: "i-lucide-apple",
  linux: "i-lucide-terminal",
};
</script>

<template>
  <NuxtLink
    :to="`/games/${game.id}`"
    :aria-label="`View ${game.name}`"
    class="group block rounded-xl bg-default ring-1 ring-default overflow-hidden transition-all hover:ring-primary hover:-translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
  >
    <div class="relative aspect-video overflow-hidden bg-muted">
      <img
        :src="game.imageUrl"
        :alt="`${game.name} cover art`"
        loading="lazy"
        class="w-full h-full object-cover"
      />
      <span
        v-if="game.discountPercent"
        class="absolute top-3 left-3 rounded-full bg-primary-deep text-inverted text-[10px] font-mono uppercase tracking-[0.08em] px-2 py-0.5"
      >
        -{{ game.discountPercent }}%
      </span>
      <span
        v-if="game.metacriticScore"
        class="absolute top-3 right-3 rounded-full bg-success text-inverted text-[10px] font-mono uppercase tracking-[0.08em] px-2 py-0.5"
      >
        {{ game.metacriticScore }}
      </span>
    </div>

    <div class="p-5 space-y-3">
      <div class="space-y-1">
        <h3 class="text-base font-semibold text-highlighted line-clamp-1">
          {{ game.name }}
        </h3>
        <p class="text-xs font-mono text-toned line-clamp-1">
          {{ game.developer }} · {{ game.category }}
        </p>
      </div>

      <div class="flex items-end justify-between">
        <div class="flex items-baseline gap-2">
          <PriceTag
            :original-price="game.originalPrice ? formatPrice(game.originalPrice) : undefined"
            >{{ formatPrice(game.price) }}</PriceTag
          >
        </div>
        <UIcon
          name="i-lucide-arrow-right"
          class="size-4 text-toned group-hover:text-primary transition-colors"
        />
      </div>

      <div class="flex flex-wrap gap-1.5 pt-1">
        <span
          v-for="p in game.platforms"
          :key="p"
          class="inline-flex items-center gap-1 rounded-full bg-elevated ring-1 ring-default px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-[0.08em] text-toned"
        >
          <UIcon :name="platformIcons[p] ?? 'i-lucide-gamepad'" class="size-3 text-primary" />
          {{ p }}
        </span>
      </div>
    </div>
  </NuxtLink>
</template>
