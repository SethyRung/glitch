<script lang="ts" setup>
import type { Game } from "#shared/types";

const route = useRoute();
const cart = useCartStore();
const toast = useToast();

const { data, status } = await useApiFetch(`/api/games/${route.params.id}`);

const game = computed<Game | null>(() => data.value?.data ?? null);
const isLoading = computed(() => status.value === "pending");

function addToCart() {
  if (!game.value) return;
  cart.add(game.value);
  toast.add({
    title: "Added to cart",
    description: game.value.name,
    color: "success",
    icon: "i-lucide-check",
  });
}
</script>

<template>
  <UContainer class="py-8">
    <div v-if="isLoading" class="space-y-4">
      <USkeleton class="aspect-460/215 rounded-lg" />
      <USkeleton class="h-8 w-1/3" />
      <USkeleton class="h-4 w-1/2" />
      <USkeleton class="h-24 w-full" />
    </div>

    <div v-else-if="!game" class="text-center py-16 text-muted">
      <UIcon name="i-lucide-gamepad-2" class="size-12 mx-auto mb-4" />
      <p class="text-lg">Game not found</p>
      <UButton to="/" label="Back to store" class="mt-4" />
    </div>

    <div v-else class="space-y-6">
      <UButton
        to="/"
        color="neutral"
        variant="link"
        icon="i-lucide-arrow-left"
        label="Back to store"
        class="px-0"
      />

      <div class="relative aspect-460/215 bg-muted rounded-lg overflow-hidden">
        <img
          v-if="game.imageUrl"
          :src="game.imageUrl"
          :alt="game.name"
          class="w-full h-full object-cover"
        />
        <div v-else class="w-full h-full flex items-center justify-center">
          <UIcon name="i-lucide-image" class="text-muted size-16" />
        </div>
      </div>

      <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div class="space-y-2">
          <h1 class="text-3xl font-bold">{{ game.name }}</h1>
          <div class="flex items-center gap-2 flex-wrap">
            <UBadge v-if="game.category" color="primary">{{ game.category }}</UBadge>
            <UBadge v-if="game.stock === 0" color="error">Out of stock</UBadge>
            <UBadge v-else color="success">In stock</UBadge>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <span class="text-2xl font-bold">${{ game.price }}</span>
          <UButton
            icon="i-lucide-shopping-cart"
            label="Add to Cart"
            :disabled="game.stock === 0"
            @click="addToCart"
          />
        </div>
      </div>

      <USeparator />

      <div v-if="game.description" class="max-w-3xl">
        <h2 class="text-lg font-semibold mb-2">About this game</h2>
        <p class="text-muted leading-relaxed">{{ game.description }}</p>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <UCard :ui="{ root: 'bg-elevated/50' }">
          <div class="text-sm text-muted">Developer</div>
          <div class="font-medium truncate">{{ game.developer || "—" }}</div>
        </UCard>
        <UCard :ui="{ root: 'bg-elevated/50' }">
          <div class="text-sm text-muted">Publisher</div>
          <div class="font-medium truncate">{{ game.publisher || "—" }}</div>
        </UCard>
        <UCard :ui="{ root: 'bg-elevated/50' }">
          <div class="text-sm text-muted">Release Date</div>
          <div class="font-medium">{{ game.releaseDate || "—" }}</div>
        </UCard>
        <UCard :ui="{ root: 'bg-elevated/50' }">
          <div class="text-sm text-muted">Metacritic</div>
          <div class="font-medium">{{ game.metacriticScore || "—" }}</div>
        </UCard>
      </div>
    </div>
  </UContainer>
</template>
