<script setup lang="ts">
// AnswerBlock — wrapper for a list of rows separated by divide-y divide-default.
// Per DESIGN.md L408-410: bg-default + ring ring-default + divide-y
// divide-default. Renders three named slots when present: a question row on
// bg-muted (mono), a default row for the answer, and a source-chip row.
//
// Most current usages only need the default slot for the row list; the named
// slots are available for the full question/answer/source composition
// described in DESIGN.md.
</script>

<template>
  <div class="rounded-xl bg-default ring-1 ring-default divide-y divide-default">
    <div v-if="$slots.question" class="bg-muted px-4 py-3 font-mono text-sm text-toned">
      <slot name="question" />
    </div>
    <div class="px-4 py-3">
      <slot />
    </div>
    <div v-if="$slots.source" class="px-4 py-2">
      <slot name="source" />
    </div>
  </div>
</template>
