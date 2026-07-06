<script setup lang="ts">
const route = useRoute();
const id = computed(() => route.params.id as string);

const { data, pending, error } = await useFetch<ApiResponse<Game>>(() => `/api/games/${id.value}`);

const envelope = computed(() => (isSuccessResponse(data.value) ? data.value : null));
const game = computed(() => envelope.value?.data ?? null);
const notFound = computed(
  () =>
    data.value !== null &&
    data.value !== undefined &&
    data.value.status.code === ApiResponseCode.NotFound,
);

useHead(() => ({
  title: game.value ? `${game.value.name} · Glitch` : "Game · Glitch",
}));

const { user } = useUserSession();
const { add: addToCart } = useCart();
const toast = useToast();

const platformIcons: Record<string, string> = {
  windows: "i-lucide-monitor",
  mac: "i-lucide-apple",
  linux: "i-lucide-terminal",
};

const totalReviews = computed(() => {
  if (!game.value) return 0;
  return game.value.positiveReviews + game.value.negativeReviews;
});

const positivePercent = computed(() => {
  if (!game.value || totalReviews.value === 0) return null;
  return Math.round((game.value.positiveReviews / totalReviews.value) * 100);
});

const releasedAt = computed(() => {
  if (!game.value?.releaseDate) return "—";
  const d = new Date(game.value.releaseDate);
  if (Number.isNaN(d.getTime())) return game.value.releaseDate;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

function handleAddToCart() {
  if (!game.value) return;
  if (!user.value) {
    void navigateTo(`/login?redirect=/games/${game.value.id}`);
    return;
  }
  addToCart({
    gameId: game.value.id,
    name: game.value.name,
    price: game.value.price,
    originalPrice: game.value.originalPrice,
    imageUrl: game.value.imageUrl,
  });
  toast.add({
    title: `${game.value.name} added to cart`,
    icon: "i-lucide-shopping-cart",
    color: "success",
  });
}
</script>

<template>
  <UContainer class="py-10 lg:py-14 space-y-10">
    <NuxtLink
      to="/catalog"
      class="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-[0.08em] text-toned hover:text-default transition-colors"
    >
      <UIcon name="i-lucide-arrow-left" class="size-3.5" />
      Back to catalog
    </NuxtLink>

    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      title="Could not load game"
      :description="error.message"
    />

    <UEmpty
      v-else-if="notFound"
      icon="i-lucide-gamepad-off"
      title="Game not found"
      description="This title isn't in the catalog — it may have been removed."
      :actions="[
        { label: 'Back to catalog', to: '/catalog', color: 'neutral', variant: 'outline' },
      ]"
    />

    <div v-else-if="pending" class="space-y-6">
      <USkeleton class="aspect-video rounded-xl" />
      <USkeleton class="h-12 w-2/3" />
      <USkeleton class="h-40" />
    </div>

    <article v-else-if="game" class="space-y-12">
      <section class="grid gap-8 lg:grid-cols-[3fr_2fr] items-start">
        <div class="relative rounded-xl ring-1 ring-default overflow-hidden bg-muted aspect-video">
          <img
            :src="game.imageUrl"
            :alt="`${game.name} cover art`"
            class="w-full h-full object-cover"
          />
          <span
            v-if="game.discountPercent"
            class="absolute top-4 left-4 rounded-full bg-primary-deep text-inverted text-xs font-mono uppercase tracking-[0.08em] px-3 py-1"
          >
            -{{ game.discountPercent }}%
          </span>
          <span
            v-if="game.metacriticScore"
            class="absolute top-4 right-4 rounded-full bg-success text-inverted text-xs font-mono uppercase tracking-[0.08em] px-3 py-1"
          >
            Metacritic {{ game.metacriticScore }}
          </span>
        </div>

        <div class="space-y-6">
          <div class="space-y-3">
            <span
              class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-elevated text-toned text-xs font-mono uppercase tracking-[0.08em]"
            >
              <span class="size-1.5 rounded-full bg-primary" />
              {{ game.category }}
            </span>
            <h1
              class="text-4xl sm:text-5xl font-semibold tracking-[-0.02em] leading-[1.05] text-highlighted"
            >
              {{ game.name }}
            </h1>
            <p class="text-sm font-mono text-toned">
              {{ game.developer }} · published by {{ game.publisher }}
            </p>
          </div>

          <div class="flex items-baseline gap-3">
            <span class="text-4xl font-semibold text-primary">
              {{ formatPrice(game.price) }}
            </span>
            <span v-if="game.originalPrice" class="text-base text-dimmed line-through">
              {{ formatPrice(game.originalPrice) }}
            </span>
          </div>

          <div class="flex flex-wrap gap-2">
            <UButton
              color="primary"
              size="lg"
              icon="i-lucide-shopping-cart"
              label="Add to cart"
              @click="handleAddToCart"
            />
            <UButton
              :to="`/cart?game=${game.id}`"
              color="neutral"
              variant="outline"
              size="lg"
              icon="i-lucide-eye"
              label="View cart"
            />
          </div>

          <dl class="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
            <div class="space-y-1">
              <dt class="text-[10px] font-mono uppercase tracking-[0.08em] text-toned">Released</dt>
              <dd class="text-default">{{ releasedAt }}</dd>
            </div>
            <div class="space-y-1">
              <dt class="text-[10px] font-mono uppercase tracking-[0.08em] text-toned">In stock</dt>
              <dd class="text-default">
                <span v-if="game.stock > 0" class="inline-flex items-center gap-2">
                  <span class="size-1.5 rounded-full bg-success" />
                  {{ game.stock.toLocaleString() }} units
                </span>
                <span v-else class="inline-flex items-center gap-2">
                  <span class="size-1.5 rounded-full bg-error" />
                  Out of stock
                </span>
              </dd>
            </div>
            <div v-if="positivePercent !== null" class="space-y-1">
              <dt class="text-[10px] font-mono uppercase tracking-[0.08em] text-toned">Reviews</dt>
              <dd class="text-default">
                {{ positivePercent }}% positive
                <span class="text-toned">·</span>
                <span class="text-toned font-mono text-xs">{{
                  totalReviews.toLocaleString()
                }}</span>
              </dd>
            </div>
            <div v-if="game.metacriticScore" class="space-y-1">
              <dt class="text-[10px] font-mono uppercase tracking-[0.08em] text-toned">Critics</dt>
              <dd class="text-default">{{ game.metacriticScore }} / 100</dd>
            </div>
          </dl>
        </div>
      </section>

      <section class="grid gap-10 lg:grid-cols-[2fr_3fr] items-start">
        <div class="space-y-3">
          <h2 class="text-2xl font-semibold tracking-[-0.02em] leading-[1.05] text-highlighted">
            About this <span class="font-pixel-circle text-primary">game</span>
          </h2>
          <p class="text-default leading-relaxed whitespace-pre-line">{{ game.description }}</p>
        </div>

        <div class="space-y-8">
          <div v-if="game.platforms.length" class="space-y-3">
            <h3 class="text-xs font-mono uppercase tracking-[0.08em] text-toned">Platforms</h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="p in game.platforms"
                :key="p"
                class="inline-flex items-center gap-1.5 rounded-full bg-elevated ring-1 ring-default px-3 py-1 text-xs font-mono uppercase tracking-[0.08em] text-toned"
              >
                <UIcon :name="platformIcons[p] ?? 'i-lucide-gamepad'" class="size-3 text-primary" />
                {{ p }}
              </span>
            </div>
          </div>

          <div v-if="game.tags.length" class="space-y-3">
            <h3 class="text-xs font-mono uppercase tracking-[0.08em] text-toned">Tags</h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="tag in game.tags"
                :key="tag"
                class="inline-flex items-center rounded-full bg-elevated ring-1 ring-default px-3 py-1 text-xs font-mono uppercase tracking-[0.08em] text-toned"
              >
                {{ tag }}
              </span>
            </div>
          </div>

          <div v-if="game.videoUrl" class="space-y-3">
            <h3 class="text-xs font-mono uppercase tracking-[0.08em] text-toned">Trailer</h3>
            <div
              class="relative aspect-video rounded-xl overflow-hidden ring-1 ring-default bg-muted"
            >
              <iframe
                :src="game.videoUrl"
                :title="`${game.name} trailer`"
                loading="lazy"
                class="absolute inset-0 w-full h-full"
                allow="
                  accelerometer;
                  autoplay;
                  clipboard-write;
                  encrypted-media;
                  gyroscope;
                  picture-in-picture;
                "
                allowfullscreen
              />
            </div>
          </div>

          <div v-if="game.screenshots.length" class="space-y-3">
            <h3 class="text-xs font-mono uppercase tracking-[0.08em] text-toned">Screenshots</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <img
                v-for="src in game.screenshots"
                :key="src"
                :src="src"
                :alt="`${game.name} screenshot`"
                loading="lazy"
                class="aspect-video w-full rounded-lg ring-1 ring-default object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </article>
  </UContainer>
</template>
