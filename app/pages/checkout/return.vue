<script setup lang="ts">
import type { ApiResponse, Purchase, PurchaseStatus } from "#shared/types";

definePageMeta({
  auth: {
    only: "user",
    redirectUserTo: "/login",
  },
});

const POLL_INTERVAL_MS = 1500;
const MAX_POLLS = 20;

const route = useRoute();
const purchaseId = computed(() => {
  const raw = route.query.purchaseId;
  return typeof raw === "string" ? raw : "";
});
const initialStatus = computed<PurchaseStatus | "">(() => {
  const raw = route.query.status;
  if (raw === "completed" || raw === "failed" || raw === "pending") {
    return raw as PurchaseStatus;
  }
  return "";
});

if (!purchaseId.value) {
  await navigateTo("/cart", { replace: true });
}

const data = ref<ApiResponse<Purchase> | undefined>(undefined);
const pending = ref(true);
const error = ref<Error | null>(null);
const polls = ref(0);
const status = ref<PurchaseStatus>(initialStatus.value || "pending");
let timer: ReturnType<typeof setInterval> | null = null;

async function loadOnce() {
  try {
    const res = await $fetch<ApiResponse<Purchase>>(`/api/purchases/${purchaseId.value}`);
    data.value = res;
    if (isSuccessResponse(res)) {
      status.value = res.data.status;
    }
    error.value = null;
  } catch (e) {
    error.value = e instanceof Error ? e : new Error(String(e));
  } finally {
    pending.value = false;
  }
}

function startPolling() {
  stopPolling();
  polls.value = 0;
  timer = setInterval(async () => {
    polls.value += 1;
    await loadOnce();
    if (
      !data.value ||
      !isSuccessResponse(data.value) ||
      data.value.data.status !== "pending" ||
      polls.value >= MAX_POLLS
    ) {
      stopPolling();
    }
  }, POLL_INTERVAL_MS);
}

function stopPolling() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

onMounted(async () => {
  await loadOnce();
  const env = data.value;
  if (!env || !isSuccessResponse(env)) {
    return;
  }
  if (env.data.status === "pending") {
    startPolling();
  }
});

onBeforeUnmount(stopPolling);

const purchase = computed(() => (isSuccessResponse(data.value) ? data.value.data : null));
const timedOut = computed(
  () => polls.value >= MAX_POLLS && status.value === "pending" && !pending.value,
);
const pollTimedOutState = computed(() => timedOut.value);

const statusLabel: Record<PurchaseStatus, string> = {
  pending: "Awaiting wallet confirmation",
  completed: "Payment confirmed",
  failed: "Payment failed",
  refunded: "Refunded",
};

const statusColor: Record<PurchaseStatus, "warning" | "success" | "error" | "neutral"> = {
  pending: "warning",
  completed: "success",
  failed: "error",
  refunded: "neutral",
};
</script>

<template>
  <UContainer class="py-12 lg:py-16 space-y-10">
    <NuxtLink
      to="/cart"
      class="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-[0.08em] text-toned hover:text-default transition-colors"
    >
      <UIcon name="i-lucide-arrow-left" class="size-3.5" />
      Back to cart
    </NuxtLink>

    <header class="space-y-3">
      <span
        class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-elevated text-toned text-xs font-mono uppercase tracking-[0.08em]"
      >
        <span class="size-1.5 rounded-full bg-primary" />
        Checkout · bridge.js
      </span>
      <h1
        class="text-4xl sm:text-5xl font-semibold tracking-[-0.02em] leading-[1.05] text-highlighted"
      >
        <PixelAccent>Bridge</PixelAccent> handoff
      </h1>
      <UBadge
        :color="statusColor[status]"
        variant="solid"
        :ui="{ base: 'px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-[0.08em]' }"
        :label="statusLabel[status]"
      />
    </header>

    <section class="rounded-xl ring-1 ring-default overflow-hidden bg-muted">
      <div class="flex items-center gap-2 px-4 h-9 bg-muted border-b border-default">
        <span class="size-2.5 rounded-full bg-primary/30" />
        <span class="size-2.5 rounded-full bg-primary/50" />
        <span class="size-2.5 rounded-full bg-primary/80" />
        <span class="ml-3 text-[11px] font-mono text-toned uppercase tracking-[0.08em]">
          wallet.log
        </span>
      </div>
      <div class="bg-default p-5 space-y-2 font-mono text-sm">
        <p class="text-muted">
          <span class="text-primary">▸</span> bridge.pay({ orderGroupId:
          <span class="text-highlighted">"{{ purchase?.id ?? "?" }}"</span> })
        </p>
        <p v-if="status === 'pending' && !pollTimedOutState" class="text-muted">
          <span class="text-primary">▸</span> ↔ awaiting native confirmation
          <span class="text-toned">({{ polls }}/{{ MAX_POLLS }})</span>
        </p>
        <p v-if="status === 'completed'" class="text-muted">
          <span class="text-primary">▸</span> ← bank.app: payment
          <span class="text-success">confirmed</span>
        </p>
        <p v-else-if="status === 'failed'" class="text-muted">
          <span class="text-primary">▸</span> ← bank.app:
          <span class="text-error">declined</span>
        </p>
        <p v-if="pollTimedOutState" class="text-muted">
          <span class="text-primary">▸</span> wallet did not respond within
          <span class="text-toned">{{ (MAX_POLLS * POLL_INTERVAL_MS) / 1000 }}s</span>. Check the
          EasyPay app or contact support.
        </p>
        <p v-if="purchase?.paymentReference" class="text-muted">
          <span class="text-primary">▸</span> ↳ reference
          <span class="text-highlighted">{{ purchase.paymentReference }}</span>
        </p>
      </div>
      <div
        class="px-4 h-8 flex items-center bg-muted border-t border-default text-[11px] font-mono text-dimmed gap-2"
      >
        <span
          class="size-1.5 rounded-full"
          :class="
            status === 'pending'
              ? 'bg-warning animate-pulse'
              : status === 'completed'
                ? 'bg-success'
                : 'bg-error'
          "
        />
        <span>
          {{
            status === "pending"
              ? `polling · ${pollTimedOutState ? "timed out" : "in progress"}`
              : status === "completed"
                ? "payment confirmed"
                : "harness stopped"
          }}
        </span>
      </div>
    </section>

    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      title="Could not load purchase"
      :description="error.message"
    />

    <div v-else-if="pending && !purchase" class="space-y-4">
      <USkeleton class="aspect-video rounded-xl max-w-3xl" />
      <USkeleton class="h-32 rounded-xl" />
    </div>

    <article v-else-if="purchase" class="grid gap-10 lg:grid-cols-[2fr_3fr]">
      <div class="space-y-4">
        <div class="rounded-xl ring-1 ring-default overflow-hidden bg-muted aspect-video">
          <img
            :src="purchase.game.imageUrl"
            :alt="`${purchase.game.name} cover art`"
            class="w-full h-full object-cover"
          />
        </div>
        <UButton
          v-if="status === 'completed'"
          :to="`/library/${purchase.id}`"
          color="primary"
          block
          icon="i-lucide-receipt"
          label="View receipt"
        />
        <UButton
          v-else-if="status === 'failed' || pollTimedOutState"
          to="/cart"
          color="neutral"
          variant="outline"
          block
          icon="i-lucide-rotate-cw"
          label="Back to cart"
        />
      </div>

      <div class="space-y-8">
        <header class="space-y-2">
          <h2 class="text-2xl font-semibold text-highlighted">{{ purchase.game.name }}</h2>
          <p class="text-sm font-mono text-toned">
            {{ purchase.game.developer }} · {{ purchase.game.category }}
          </p>
        </header>

        <AnswerBlock>
          <div class="px-5 py-4 flex items-center justify-between">
            <span class="text-xs font-mono uppercase tracking-[0.08em] text-toned">Paid</span>
            <PriceTag>{{ formatPrice(purchase.pricePaid) }}</PriceTag>
          </div>
          <div class="px-5 py-4 flex items-center justify-between">
            <span class="text-xs font-mono uppercase tracking-[0.08em] text-toned">Status</span>
            <span class="text-sm font-mono">{{ statusLabel[status] }}</span>
          </div>
          <div class="px-5 py-4 flex items-center justify-between">
            <span class="text-xs font-mono uppercase tracking-[0.08em] text-toned">Reference</span>
            <span class="text-sm font-mono break-all text-right">
              {{ purchase.paymentReference ?? "—" }}
            </span>
          </div>
          <div class="px-5 py-4 flex items-center justify-between">
            <span class="text-xs font-mono uppercase tracking-[0.08em] text-toned">Order ID</span>
            <span class="text-sm font-mono break-all text-right">{{ purchase.id }}</span>
          </div>
        </AnswerBlock>
      </div>
    </article>
  </UContainer>
</template>
