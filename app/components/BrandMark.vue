<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: "sm" | "md" | "lg";
    invert?: boolean;
  }>(),
  {
    size: "md",
    invert: false,
  },
);
</script>

<template>
  <NuxtLink
    to="/"
    class="font-mono font-bold text-toned hover:text-default transition-colors"
    :class="[size === 'sm' && 'text-xs', size === 'md' && 'text-sm', size === 'lg' && 'text-base']"
  >
    <span class="text-primary font-pixel -tracking-widest"> G </span>
    litch
  </NuxtLink>
</template>
