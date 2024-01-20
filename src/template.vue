<script setup>
defineProps({
  type: String
});
</script>

<template>
  <template v-if="type === 'sharp'">
    <!-- sharp -->
  </template>
  <template v-else-if="type === 'outline'">
    <!-- outline -->
  </template>
  <template v-else>
    <!-- solid -->
  </template>
</template>
