<script lang="ts" setup>
const searchInput = ref();
const search = refDebounced(searchInput, 500);
const category = ref();
const page = ref(1);
const limit = 20;

const { data, pending } = await useFetchApi("/api/games", {
  query: {
    search: search.value,
    category: category.value,
    limit,
    offset: (page.value - 1) * limit,
  },
  watch: [search, category],
});

const games = computed(() => (data.value && isSuccessResponse(data.value) ? data.value.data : []) ?? []);
const total = computed(() => (data.value && isSuccessResponse(data.value) ? data.value.meta?.total : 0) ?? 0);

const categories = computed(() => {
  const set = new Set(games.value.map((g) => g.category).filter(Boolean));
  return Array.from(set);
});

function clearFilters() {
  searchInput.value = undefined;
  category.value = undefined;
  page.value = 1;
}
</script>

<template>
  <UContainer class="py-8">
    <UPageHero
      title="Glitch Game Store"
      description="Discover your next favorite game. Browse our curated catalog of video games."
      :links="[{ label: 'Browse games', to: '#games', icon: 'i-lucide-arrow-down' }]"
    />

    <div id="games" class="mt-8 space-y-6">
      <div class="flex flex-col sm:flex-row gap-3">
        <UInput
          v-model="searchInput"
          icon="i-lucide:search"
          placeholder="Search games..."
          class="flex-1"
          @keyup.enter="page = 1"
        />

        <USelect
          v-model="category"
          :items="categories"
          placeholder="All categories"
          class="w-full sm:w-48"
          @update:model-value="page = 1"
        />

        <UButton
          v-if="searchInput || category"
          color="neutral"
          variant="ghost"
          icon="i-lucide-x"
          label="Clear"
          @click="clearFilters"
        />
      </div>

      <div
        v-if="pending"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        <USkeleton v-for="i in 8" :key="i" class="aspect-460/300 rounded-lg" />
      </div>

      <div v-else-if="games.length === 0" class="text-center py-16 text-muted">
        <UIcon name="i-lucide-search-x" class="size-12 mx-auto mb-4" />
        <p class="text-lg">No games found</p>
        <UButton
          v-if="searchInput || category"
          color="neutral"
          variant="ghost"
          label="Clear filters"
          @click="clearFilters"
          class="mt-2"
        />
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <GameCard v-for="game in games" :key="game.id" :game="game" />
      </div>

      <div v-if="total > limit" class="flex justify-center pt-4">
        <UPagination v-model:page="page" :total="total" :items-per-page="limit" show-edges />
      </div>
    </div>
  </UContainer>
</template>
