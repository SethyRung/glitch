<script setup lang="ts">
import type { ApiResponse, CreatePurchasesData } from "#shared/types";

definePageMeta({
  auth: {
    only: "user",
    redirectUserTo: "/login",
  },
});

useHead({ title: "Checkout · Glitch" });

const { items, increment, decrement, remove, clear } = useCart();
const wallet = useWalletBridge();
const toast = useToast();

onMounted(() => {
  if (items.value.length === 0) {
    navigateTo("/cart", { replace: true });
  }
});

const count = computed(() => items.value.reduce((sum, item) => sum + item.qty, 0));
const subtotal = computed(() =>
  items.value.reduce((sum, item) => sum + Number(item.price) * item.qty, 0),
);
const subtotalDisplay = computed(() => formatPrice(subtotal.value.toFixed(2)));
const currency = "USD" as const;

const submitting = ref(false);

async function onPay() {
  if (submitting.value || items.value.length === 0) return;
  submitting.value = true;
  const idempotencyKey = `ck_${crypto.randomUUID()}`;
  try {
    const res = await $fetch<ApiResponse<CreatePurchasesData>>("/api/purchases", {
      method: "POST",
      body: {
        items: items.value.map((item) => ({ gameId: item.gameId, qty: item.qty })),
        idempotencyKey,
      },
    });
    if (!isSuccessResponse(res)) {
      throw new Error(res.status.message || "Could not create order");
    }
    const first = res.data.purchases[0];
    if (!first) throw new Error("Order is empty");

    const result = await wallet.pay({
      orderGroupId: res.data.orderGroupId,
      purchaseId: first.id,
      currency,
      total: res.data.subtotal,
      items: items.value.map((item) => ({
        gameId: item.gameId,
        name: item.name,
        qty: item.qty,
        lineTotal: (Number(item.price) * item.qty).toFixed(2),
      })),
      merchant: { code: "glitch-store", name: "Glitch Store" },
      externalReference: res.data.orderGroupId,
    });

    if (result.status === "completed" || result.status === "failed") {
      clear();
    }

    await navigateTo({
      path: "/checkout/return",
      query: {
        purchaseId: first.id,
        status: result.status,
        orderGroupId: res.data.orderGroupId,
      },
    });
  } catch (error) {
    toast.add({
      title: "Checkout failed",
      description: error instanceof Error ? error.message : String(error),
      color: "error",
      icon: "i-lucide-circle-alert",
    });
    submitting.value = false;
  }
}
</script>

<template>
  <UContainer class="py-12 lg:py-16 space-y-10">
    <header class="space-y-3">
      <span
        class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-elevated text-toned text-xs font-mono uppercase tracking-[0.08em]"
      >
        <span class="size-1.5 rounded-full bg-primary" />
        Checkout
      </span>
      <h1
        class="text-4xl sm:text-5xl font-semibold tracking-[-0.02em] leading-[1.05] text-highlighted"
      >
        Hand off to <PixelAccent>EasyPay</PixelAccent>
      </h1>
      <p class="text-sm text-muted max-w-2xl">
        Tap pay to forward this order to your EasyPay wallet through
        <span class="font-mono text-toned">WebViewJavascriptBridge</span>.
        <span v-if="!wallet.available.value">
          Bridge runtime not detected —
          <span class="text-toned">web fallback</span>
          will mark the order complete immediately so you can walk the demo on desktop.
        </span>
      </p>
    </header>

    <div class="grid gap-8 lg:grid-cols-[3fr_2fr] items-start">
      <section class="rounded-xl bg-default ring-1 ring-default divide-y divide-default">
        <div
          class="hidden sm:grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3 text-[10px] font-mono uppercase tracking-[0.08em] text-toned"
        >
          <span>Game</span>
          <span class="w-20 text-center">Qty</span>
          <span class="w-20 text-right">Price</span>
          <span class="w-8" />
        </div>

        <article
          v-for="item in items"
          :key="item.gameId"
          class="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-4 items-center"
        >
          <div class="flex items-center gap-4 min-w-0">
            <img
              :src="item.imageUrl"
              :alt="`${item.name} cover art`"
              loading="lazy"
              class="w-20 h-12 rounded-md object-cover ring-1 ring-default shrink-0"
            />
            <div class="min-w-0 space-y-0.5">
              <h3 class="text-sm font-semibold text-highlighted line-clamp-1">
                {{ item.name }}
              </h3>
              <p class="text-[11px] font-mono text-toned">
                {{ formatPrice(item.price) }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-1 sm:w-20 sm:justify-center">
            <UButton
              icon="i-lucide-minus"
              size="sm"
              color="neutral"
              variant="outline"
              :aria-label="`Decrease ${item.name} quantity`"
              @click="decrement(item.gameId)"
            />
            <span
              class="w-8 text-center text-sm font-mono tabular-nums text-default"
              :aria-label="`Quantity: ${item.qty}`"
            >
              {{ item.qty }}
            </span>
            <UButton
              icon="i-lucide-plus"
              size="sm"
              color="neutral"
              variant="outline"
              :aria-label="`Increase ${item.name} quantity`"
              @click="increment(item.gameId)"
            />
          </div>

          <span
            class="hidden sm:block w-20 text-right text-sm font-semibold text-default font-mono"
          >
            {{ formatPrice((Number(item.price) * item.qty).toFixed(2)) }}
          </span>
          <UButton
            icon="i-lucide-x"
            size="sm"
            color="neutral"
            variant="ghost"
            :aria-label="`Remove ${item.name}`"
            @click="remove(item.gameId)"
          />
        </article>
      </section>

      <aside class="space-y-4 lg:sticky lg:top-20">
        <AnswerBlock>
          <div class="px-5 py-4 flex items-center justify-between">
            <span class="text-xs font-mono uppercase tracking-[0.08em] text-toned">Total</span>
            <PriceTag>{{ subtotalDisplay }}</PriceTag>
          </div>
          <div class="px-5 py-4 flex items-center justify-between">
            <span class="text-xs font-mono uppercase tracking-[0.08em] text-toned">Items</span>
            <span class="text-sm text-default font-mono">{{ count }}</span>
          </div>
          <div class="px-5 py-4 flex items-center justify-between">
            <span class="text-xs font-mono uppercase tracking-[0.08em] text-toned">Wallet</span>
            <span class="text-sm font-mono">
              <span
                v-if="wallet.available.value"
                class="inline-flex items-center gap-1.5 text-success"
              >
                <span class="size-1.5 rounded-full bg-success" />
                bridge ready
              </span>
              <span v-else class="inline-flex items-center gap-1.5 text-toned">
                <span class="size-1.5 rounded-full bg-toned" />
                web fallback
              </span>
            </span>
          </div>
        </AnswerBlock>

        <UButton
          color="primary"
          size="lg"
          block
          icon="i-lucide-credit-card"
          :label="wallet.available.value ? 'Pay with EasyPay' : 'Pay (web fallback)'"
          :loading="submitting"
          :disabled="submitting || items.length === 0"
          @click="onPay"
        />
        <UButton
          to="/cart"
          color="neutral"
          variant="ghost"
          block
          icon="i-lucide-arrow-left"
          label="Back to cart"
        />
      </aside>
    </div>
  </UContainer>
</template>
