<script setup lang="ts">
useHead({ title: "Glitch · WebBridge demo game store" });

interface FeaturedGame {
  id: string;
  name: string;
  developer: string;
  publisher: string;
  price: string;
  originalPrice?: string;
  discountPercent?: number;
  imageUrl: string;
  category: string;
  releaseDate: string;
  metacriticScore?: number;
  platforms: string[];
}

const featured: FeaturedGame[] = [
  {
    id: "elden-ring",
    name: "Elden Ring",
    developer: "FromSoftware",
    publisher: "Bandai Namco",
    price: "59.99",
    imageUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header_292x136.jpg",
    category: "Action RPG",
    releaseDate: "2022-02-25",
    metacriticScore: 96,
    platforms: ["windows"],
  },
  {
    id: "baldurs-gate-3",
    name: "Baldur's Gate 3",
    developer: "Larian Studios",
    publisher: "Larian Studios",
    price: "59.99",
    originalPrice: "69.99",
    discountPercent: 14,
    imageUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1086940/header_292x136.jpg",
    category: "RPG",
    releaseDate: "2023-08-03",
    metacriticScore: 96,
    platforms: ["windows", "mac"],
  },
  {
    id: "hades",
    name: "Hades",
    developer: "Supergiant Games",
    publisher: "Supergiant Games",
    price: "24.99",
    imageUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1145360/header_292x136.jpg",
    category: "Roguelike",
    releaseDate: "2020-09-17",
    metacriticScore: 93,
    platforms: ["windows", "mac"],
  },
  {
    id: "stardew-valley",
    name: "Stardew Valley",
    developer: "ConcernedApe",
    publisher: "ConcernedApe",
    price: "14.99",
    imageUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/413150/header_292x136.jpg",
    category: "Simulation",
    releaseDate: "2016-02-26",
    metacriticScore: 89,
    platforms: ["windows", "mac", "linux"],
  },
];

function formatPrice(value: string): string {
  const n = Number(value);
  return Number.isFinite(n) ? `$${n.toFixed(2)}` : value;
}
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="py-20 lg:py-28">
      <UContainer>
        <div class="grid gap-14 lg:grid-cols-2 lg:gap-20 items-center">
          <div class="space-y-8">
            <span
              class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-elevated text-toned text-xs font-mono uppercase tracking-[0.08em]"
            >
              <span class="size-1.5 rounded-full bg-primary" />
              WebBridge demo
            </span>

            <h1
              class="text-5xl sm:text-6xl font-semibold tracking-[-0.02em] leading-[1.05] text-highlighted"
            >
              A <span class="font-pixel text-primary">glitch</span> in the
              <span class="font-pixel text-primary">checkout</span> flow.
            </h1>

            <p class="text-lg text-muted max-w-xl">
              Glitch is a tiny game-store demo that hands off to a real banking app via
              <span class="font-mono text-toned">WebViewJavascriptBridge</span>. Browse, cart, and
              pay without ever leaving the demo.
            </p>

            <div class="flex flex-wrap gap-3">
              <UButton
                to="/catalog"
                color="primary"
                size="lg"
                icon="i-lucide-gamepad-2"
                label="Browse catalog"
              />
              <UButton
                to="#how-it-works"
                color="neutral"
                variant="outline"
                size="lg"
                icon="i-lucide-zap"
                label="How it works"
              />
            </div>

            <div class="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-mono text-toned">
              <span class="inline-flex items-center gap-2">
                <span class="size-1.5 rounded-full bg-success" />
                Steam catalog · live mock
              </span>
              <span class="inline-flex items-center gap-2">
                <UIcon name="i-lucide-shield-check" class="size-3.5 text-primary" />
                Better Auth · admin plugin
              </span>
            </div>
          </div>

          <!-- Terminal mock -->
          <div class="rounded-xl ring-1 ring-default overflow-hidden bg-muted">
            <div class="flex items-center gap-2 px-4 h-9 bg-muted border-b border-default">
              <span class="size-2.5 rounded-full bg-primary/30" />
              <span class="size-2.5 rounded-full bg-primary/50" />
              <span class="size-2.5 rounded-full bg-primary/80" />
              <span class="ml-3 text-[11px] font-mono text-toned uppercase tracking-[0.08em]">
                checkout · bridge.js
              </span>
            </div>
            <div class="bg-default p-5 space-y-2 font-mono text-sm">
              <p class="text-muted">
                <span class="text-primary">▸</span> webbridge.on("pay", handler)
              </p>
              <p class="text-muted">
                <span class="text-primary">▸</span> bridge.pay({
                <span class="text-toned">amount</span>:
                <span class="text-highlighted">"59.99"</span>,
                <span class="text-toned">order</span>:
                <span class="text-highlighted">"ord_8f3a"</span> })
              </p>
              <p class="text-muted">
                <span class="text-primary">▸</span> ← bank.app: payment
                <span class="text-success">confirmed</span>
              </p>
              <p class="text-muted">
                <span class="text-primary">▸</span> redirect("/library/ord_8f3a")
              </p>
            </div>
            <div
              class="px-4 h-8 flex items-center bg-muted border-t border-default text-[11px] font-mono text-dimmed"
            >
              <span class="size-1.5 rounded-full bg-success mr-2" />
              bridge ready · 12ms
            </div>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- Featured -->
    <section class="pb-20 lg:pb-28">
      <UContainer class="space-y-10">
        <header class="flex flex-wrap items-end justify-between gap-4">
          <div class="space-y-3">
            <span
              class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-elevated text-toned text-xs font-mono uppercase tracking-[0.08em]"
            >
              <span class="size-1.5 rounded-full bg-primary" />
              Featured
            </span>
            <h2
              class="text-3xl sm:text-4xl font-semibold tracking-[-0.02em] leading-[1.05] text-highlighted"
            >
              Top picks <span class="font-pixel text-primary">this week</span>
            </h2>
            <p class="text-sm text-muted max-w-xl">
              A handful of standouts from the demo catalog. Browse the rest once you're signed in.
            </p>
          </div>
          <UButton
            to="/catalog"
            color="neutral"
            variant="ghost"
            trailing-icon="i-lucide-arrow-right"
            label="View all"
          />
        </header>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <article
            v-for="game in featured"
            :key="game.id"
            class="group rounded-xl bg-default ring-1 ring-default overflow-hidden transition-all hover:ring-primary hover:-translate-y-px"
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
                  <span class="text-2xl font-semibold text-primary">
                    {{ formatPrice(game.price) }}
                  </span>
                  <span v-if="game.originalPrice" class="text-sm text-dimmed line-through">
                    {{ formatPrice(game.originalPrice) }}
                  </span>
                </div>
                <UButton
                  :to="`/games/${game.id}`"
                  size="sm"
                  color="neutral"
                  variant="ghost"
                  trailing-icon="i-lucide-arrow-right"
                  :aria-label="`View ${game.name}`"
                />
              </div>

              <div class="flex flex-wrap gap-1.5 pt-1">
                <span
                  v-for="p in game.platforms"
                  :key="p"
                  class="inline-flex items-center gap-1 rounded-full bg-elevated ring-1 ring-default px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-[0.08em] text-toned"
                >
                  <UIcon
                    :name="
                      p === 'windows'
                        ? 'i-lucide-monitor'
                        : p === 'mac'
                          ? 'i-lucide-apple'
                          : 'i-lucide-terminal'
                    "
                    class="size-3 text-primary"
                  />
                  {{ p }}
                </span>
              </div>
            </div>
          </article>
        </div>
      </UContainer>
    </section>

    <!-- How it works -->
    <section id="how-it-works" class="pb-20 lg:pb-28 scroll-mt-20">
      <UContainer class="space-y-10">
        <header class="space-y-3 max-w-2xl">
          <span
            class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-elevated text-toned text-xs font-mono uppercase tracking-[0.08em]"
          >
            <span class="size-1.5 rounded-full bg-primary" />
            How it works
          </span>
          <h2
            class="text-3xl sm:text-4xl font-semibold tracking-[-0.02em] leading-[1.05] text-highlighted"
          >
            From catalog to <span class="font-pixel text-primary">bank app</span>, in one tap.
          </h2>
          <p class="text-base text-muted">
            The catalog runs in a normal browser. Checkout posts to
            <span class="font-mono text-toned">WebViewJavascriptBridge</span>, which the demo's
            native shell intercepts and forwards to the bundled banking app.
          </p>
        </header>

        <div class="grid gap-6 md:grid-cols-3">
          <UPageCard class="space-y-3">
            <span
              class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-elevated text-toned text-[10px] font-mono uppercase tracking-[0.08em]"
            >
              01
            </span>
            <h3 class="text-lg font-semibold text-highlighted">Browse the catalog</h3>
            <p class="text-sm text-muted">
              Sign in, scan the featured grid, and add a game or two to your cart.
            </p>
          </UPageCard>

          <UPageCard class="space-y-3">
            <span
              class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-elevated text-toned text-[10px] font-mono uppercase tracking-[0.08em]"
            >
              02
            </span>
            <h3 class="text-lg font-semibold text-highlighted">Hand off to bridge</h3>
            <p class="text-sm text-muted">
              Checkout calls
              <span class="font-mono text-toned">bridge.pay()</span>
              with the order id and amount.
            </p>
          </UPageCard>

          <UPageCard class="space-y-3">
            <span
              class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-elevated text-toned text-[10px] font-mono uppercase tracking-[0.08em]"
            >
              03
            </span>
            <h3 class="text-lg font-semibold text-highlighted">Confirm in the bank app</h3>
            <p class="text-sm text-muted">
              The native shell pushes a confirmation back; the order moves to your library.
            </p>
          </UPageCard>
        </div>
      </UContainer>
    </section>
  </div>
</template>
