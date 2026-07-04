<script setup lang="ts"></script>

<template>
  <div class="min-h-dvh flex flex-col bg-default">
    <AppHeader />
    <main class="flex-1">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
