<script setup lang="ts">
useHead({ title: "Glitch · WebBridge demo game store" });

const FEATURED_LIMIT = 4;

const { data, pending } = await useFetch<GamesListResponse>("/api/games", {
  query: { limit: FEATURED_LIMIT },
});

const featured = computed(() => {
  const items = data.value?.items ?? [];
  return [...items].sort((a, b) => {
    const scoreA = a.metacriticScore ?? 0;
    const scoreB = b.metacriticScore ?? 0;
    if (scoreB !== scoreA) return scoreB - scoreA;
    return a.name.localeCompare(b.name);
  });
});
</script>

<template>
  <div>
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
              A <span class="font-pixel-circle text-primary">glitch</span> in the
              <span class="font-pixel-circle text-primary">checkout</span> flow.
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
              Top picks <span class="font-pixel-circle text-primary">this week</span>
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

        <div
          v-if="pending"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <USkeleton v-for="i in FEATURED_LIMIT" :key="i" class="aspect-video rounded-xl" />
          <USkeleton v-for="i in FEATURED_LIMIT" :key="`b-${i}`" class="h-24 rounded-xl" />
        </div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <GameCard v-for="game in featured" :key="game.id" :game="game" />
        </div>
      </UContainer>
    </section>

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
            From catalog to <span class="font-pixel-circle text-primary">bank app</span>, in one
            tap.
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
