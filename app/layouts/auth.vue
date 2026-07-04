<script setup lang="ts"></script>

<template>
  <div class="min-h-dvh flex flex-col bg-default">
    <header class="border-b border-default">
      <div class="mx-auto max-w-7xl px-6 h-14 flex items-center justify-between">
        <BrandMark />
      </div>
    </header>

    <main class="flex-1 flex items-center justify-center px-6 py-12">
      <slot />
    </main>

    <footer class="border-t border-default">
      <div
        class="mx-auto max-w-7xl px-6 h-12 flex items-center justify-between text-xs font-mono text-dimmed"
      >
        <span>Glitch · WebBridge demo</span>
        <span>v0.1.0 · alpha</span>
      </div>
    </footer>
  </div>
</template>
