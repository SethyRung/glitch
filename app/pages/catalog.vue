<script setup lang="ts">
import { refDebounced } from "@vueuse/core";

useHead({ title: "Catalog · Glitch" });

const pageSize = ref<number>(10);

const pageSizeOptions = [
  { label: "10", value: 10 },
  { label: "50", value: 50 },
  { label: "100", value: 100 },
];

const search = ref("");
const debouncedSearch = refDebounced(search, 250);
const selectedCategory = ref<string>("All");
const page = ref(1);

const query = computed(() => ({
  search: debouncedSearch.value.trim() || undefined,
  category: selectedCategory.value === "All" ? undefined : selectedCategory.value,
  limit: pageSize.value,
  offset: (page.value - 1) * pageSize.value,
}));

const { data, pending, error } = await useFetch<GamesListResponse>("/api/games", {
  query,
  watch: [query],
});

const games = computed(() => data.value?.items ?? []);
const categories = computed(() => ["All", ...(data.value?.categories ?? [])]);
const total = computed(() => data.value?.total ?? 0);

watch([debouncedSearch, selectedCategory, pageSize], () => {
  page.value = 1;
});

function selectCategory(category: string) {
  selectedCategory.value = category;
}

function clearFilters() {
  search.value = "";
  selectedCategory.value = "All";
}
</script>

<template>
  <UContainer class="py-12 lg:py-16 space-y-10">
    <header class="flex flex-wrap items-end justify-between gap-6">
      <div class="space-y-3">
        <span
          class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-elevated text-toned text-xs font-mono uppercase tracking-[0.08em]"
        >
          <span class="size-1.5 rounded-full bg-primary" />
          Catalog
        </span>
        <h1
          class="text-4xl sm:text-5xl font-semibold tracking-[-0.02em] leading-[1.05] text-highlighted"
        >
          Browse the <span class="font-pixel-circle text-primary">full shelf</span>
        </h1>
        <p class="text-sm text-muted">earch by name or narrow down by category.</p>
      </div>

      <div class="flex flex-wrap items-center gap-3 w-full sm:w-auto">
        <UInput
          v-model="search"
          icon="i-lucide-search"
          placeholder="Search games…"
          autocomplete="off"
          class="w-full sm:w-64"
        />

        <USelect v-model="pageSize" :items="pageSizeOptions" class="w-20" />
      </div>
    </header>

    <div class="flex flex-wrap gap-2" role="tablist" aria-label="Filter by category">
      <button
        v-for="category in categories"
        :key="category"
        type="button"
        role="tab"
        :aria-selected="selectedCategory === category"
        class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-mono uppercase tracking-[0.08em] transition-colors ring-1"
        :class="
          selectedCategory === category
            ? 'bg-primary text-inverted ring-primary'
            : 'bg-elevated text-toned ring-default hover:text-default'
        "
        @click="selectCategory(category)"
      >
        {{ category }}
      </button>
    </div>

    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      title="Could not load catalog"
      :description="error.message"
    />

    <div
      v-else-if="pending && games.length === 0"
      class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      <USkeleton v-for="i in 8" :key="i" class="aspect-video rounded-xl" />
      <USkeleton v-for="i in 8" :key="`b-${i}`" class="h-24 rounded-xl" />
    </div>

    <UEmpty
      v-else-if="games.length === 0"
      icon="i-lucide-search-x"
      title="No games match"
      description="Try clearing the search or picking another category."
      :actions="[
        {
          label: 'Clear filters',
          color: 'neutral',
          variant: 'outline',
          onClick: clearFilters,
        },
      ]"
    />

    <div v-else class="space-y-8">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <GameCard v-for="game in games" :key="game.id" :game="game" />
      </div>

      <UPagination
        v-model:page="page"
        :total="total"
        :items-per-page="pageSize"
        :sibling-count="1"
        class="w-max mx-auto"
      />
    </div>
  </UContainer>
</template>
