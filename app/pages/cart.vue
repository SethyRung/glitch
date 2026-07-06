<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { CartItem } from "~/composables/useCart";

definePageMeta({
  auth: {
    only: "user",
    redirectUserTo: "/login",
  },
});

useHead({ title: "Cart · Glitch" });

const { items, increment, decrement, clear } = useCart();

const count = computed(() => items.value.reduce((sum, item) => sum + item.qty, 0));
const subtotal = computed(() =>
  items.value.reduce((sum, item) => sum + Number(item.price) * item.qty, 0),
);
const subtotalDisplay = computed(() => formatPrice(subtotal.value.toFixed(2)));

const columns: TableColumn<CartItem>[] = [
  { accessorKey: "name", header: "Game" },
  { accessorKey: "qty", header: "Qty" },
  { accessorKey: "price", header: "Price" },
  { id: "line", header: "Line" },
];

const lineTotal = (item: CartItem) => formatPrice((Number(item.price) * item.qty).toFixed(2));
</script>

<template>
  <UContainer class="py-12 lg:py-16 space-y-10">
    <header class="space-y-3">
      <span
        class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-elevated text-toned text-xs font-mono uppercase tracking-[0.08em]"
      >
        <span class="size-1.5 rounded-full bg-primary" />
        Cart
      </span>
      <h1
        class="text-4xl sm:text-5xl font-semibold tracking-[-0.02em] leading-[1.05] text-highlighted"
      >
        Your <span class="font-pixel-circle text-primary">cart</span>
      </h1>
      <p class="text-sm text-muted">
        <ClientOnly>
          <span class="font-mono text-toned">{{ count }}</span>
          {{ count === 1 ? "item" : "items" }}
        </ClientOnly>
        ready for checkout.
      </p>
    </header>

    <ClientOnly>
      <UEmpty
        v-if="items.length === 0"
        icon="i-lucide-shopping-cart"
        title="Your cart is empty"
        description="Browse the catalog and add a game to get started."
        :actions="[{ label: 'Browse catalog', color: 'primary', to: '/catalog' }]"
      />

      <div v-else class="grid gap-8 lg:grid-cols-[3fr_2fr] items-start">
        <UTable
          :data="items"
          :columns="columns"
          :ui="{
            root: 'w-full ring-1 ring-default',
            th: 'font-normal text-[10px] font-mono uppercase',
          }"
        >
          <template #name-cell="{ row }">
            <NuxtLink
              :to="`/games/${row.original.gameId}`"
              class="flex items-center gap-4 group p-5 min-w-0 max-w-full"
            >
              <img
                :src="row.original.imageUrl"
                :alt="`${row.original.name} cover art`"
                loading="lazy"
                class="w-20 h-12 rounded-md object-cover ring-1 ring-default shrink-0"
              />
              <div class="min-w-0 space-y-0.5">
                <h3
                  class="text-sm font-semibold text-highlighted line-clamp-1 group-hover:text-primary transition-colors"
                >
                  {{ row.original.name }}
                </h3>
                <p class="text-[11px] font-mono text-toned">
                  {{ formatPrice(row.original.price) }}
                  <span v-if="row.original.originalPrice" class="ml-1 text-dimmed line-through">
                    {{ formatPrice(row.original.originalPrice) }}
                  </span>
                </p>
              </div>
            </NuxtLink>
          </template>

          <template #qty-cell="{ row }">
            <div class="flex items-center gap-1 px-3 py-4 justify-end sm:justify-center">
              <UButton
                icon="i-lucide-minus"
                size="sm"
                color="neutral"
                variant="outline"
                :aria-label="`Decrease ${row.original.name} quantity`"
                @click="decrement(row.original.gameId)"
              />
              <span
                class="w-8 text-center text-sm font-mono tabular-nums text-default"
                :aria-label="`Quantity: ${row.original.qty}`"
              >
                {{ row.original.qty }}
              </span>
              <UButton
                icon="i-lucide-plus"
                size="sm"
                color="neutral"
                variant="outline"
                :aria-label="`Increase ${row.original.name} quantity`"
                @click="increment(row.original.gameId)"
              />
            </div>
          </template>

          <template #price-cell="{ row }">
            <span
              class="block px-3 py-4 text-right text-sm text-default font-mono whitespace-nowrap"
            >
              {{ formatPrice(row.original.price) }}
            </span>
          </template>

          <template #line-cell="{ row }">
            <span
              class="block px-3 py-4 text-right text-sm font-semibold text-default font-mono whitespace-nowrap"
            >
              {{ lineTotal(row.original) }}
            </span>
          </template>
        </UTable>

        <aside class="space-y-4 lg:sticky lg:top-20">
          <div class="rounded-xl bg-default ring-1 ring-default divide-y divide-default">
            <div class="px-5 py-4 flex items-center justify-between">
              <span class="text-xs font-mono uppercase tracking-[0.08em] text-toned">Subtotal</span>
              <span class="text-2xl font-semibold text-primary">{{ subtotalDisplay }}</span>
            </div>
            <div class="px-5 py-4 flex items-center justify-between">
              <span class="text-xs font-mono uppercase tracking-[0.08em] text-toned">Items</span>
              <span class="text-sm text-default font-mono">{{ count }}</span>
            </div>
          </div>

          <UButton
            to="/checkout"
            color="primary"
            size="lg"
            block
            icon="i-lucide-credit-card"
            label="Continue to checkout"
          />

          <UButton
            color="error"
            variant="ghost"
            block
            icon="i-lucide-trash-2"
            label="Clear cart"
            @click="clear()"
          />
        </aside>
      </div>
    </ClientOnly>
  </UContainer>
</template>
