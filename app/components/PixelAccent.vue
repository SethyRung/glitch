<script setup lang="ts">
// PixelAccent — inline span that swaps `font-pixel-circle` + violet for one
// word inside an otherwise sans-serif headline. Per DESIGN.md L418-420:
// always inside an H1 or H2, never inside a paragraph, badge, or button label.
</script>

<template>
  <span class="font-pixel-circle text-primary">
    <slot />
  </span>
</template>
