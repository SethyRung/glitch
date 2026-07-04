<script setup lang="ts">
const year = new Date().getFullYear();
</script>

<template>
  <footer class="border-t border-default bg-default">
    <div
      class="mx-auto max-w-7xl px-6 py-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div class="flex items-center gap-3 text-xs font-mono text-dimmed">
        <BrandMark size="sm" />
        <span>·</span>
        <span>WebBridge demo · © {{ year }}</span>
      </div>

      <div class="flex items-center gap-4 text-xs font-mono text-dimmed">
        <NuxtLink to="/catalog" class="hover:text-default transition-colors"> Catalog </NuxtLink>
        <NuxtLink to="/cart" class="hover:text-default transition-colors"> Cart </NuxtLink>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener"
          class="inline-flex items-center gap-1 hover:text-default transition-colors"
        >
          Source
          <UIcon name="i-lucide-arrow-up-right" class="size-3 text-primary" />
        </a>
      </div>
    </div>
  </footer>
</template>
