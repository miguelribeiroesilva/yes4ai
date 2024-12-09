<template>
  <div class="grid">
    <div class="col-12 md:col-8 md:col-offset-2">
      <h1 class="mb-4">Chat Test</h1>
      <ChatTest />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default'
});
</script>

<style scoped>
.chat-test-page {
  padding: 2rem;
}
</style>
