<script setup lang="ts">
// PriceTag — the headline price on every game card and inside the checkout
// summary. Per DESIGN.md L392-395: text-primary text-2xl font-semibold;
// when a discount applies, the original price appears next to it in
// text-dimmed line-through at body size.

interface Props {
  /** Optional original price (pre-discount) — renders as strikethrough. */
  originalPrice?: string;
}

defineProps<Props>();
</script>

<template>
  <span class="text-2xl font-semibold text-primary">
    <slot />
    <span v-if="originalPrice" class="ml-2 text-base font-normal text-dimmed line-through">{{
      originalPrice
    }}</span>
  </span>
</template>
