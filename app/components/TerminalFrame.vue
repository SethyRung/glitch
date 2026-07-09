<script setup lang="ts">
// TerminalFrame — a three-row composite: bg-muted chrome with three
// traffic-light dots (bg-primary/30 → /50 → /80), bg-default body for the
// WebBridge mock transcript, bg-muted footer with a status line. Per
// DESIGN.md L401-404. Always mono, always sentence case.
</script>

<template>
  <div class="overflow-hidden rounded-xl ring-1 ring-default font-mono">
    <header class="flex h-8 items-center gap-1.5 bg-muted px-4">
      <span class="size-2.5 rounded-full bg-primary/30" />
      <span class="size-2.5 rounded-full bg-primary/50" />
      <span class="size-2.5 rounded-full bg-primary/80" />
      <slot name="chrome" />
    </header>
    <div class="bg-default">
      <slot />
    </div>
    <footer v-if="$slots.footer" class="flex h-7 items-center bg-muted px-4 text-xs text-dimmed">
      <slot name="footer" />
    </footer>
  </div>
</template>
