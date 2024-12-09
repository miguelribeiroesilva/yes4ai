<template>
  <div class="card">
    <h2>LangChain Test</h2>
    
    <!-- Input Section -->
    <div class="mb-4">
      <span class="p-float-label">
        <Textarea
          v-model="userInput"
          rows="3"
          class="w-full"
          :disabled="loading"
        />
        <label>Enter your message</label>
      </span>
    </div>

    <!-- Test Chain Button -->
    <div class="mb-4">
      <Button
        label="Test Chain"
        @click="testChain"
        :loading="loading"
        class="mr-2"
      />
    </div>

    <!-- Response Display -->
    <div class="response-section">
      <h3>Responses:</h3>
      <div
        v-for="(message, index) in messages"
        :key="index"
        class="message p-3 mb-2"
        :class="message.role"
      >
        <div class="font-bold mb-1">{{ message.role }}:</div>
        <div class="message-content">{{ message.content }}</div>
        <div v-if="message.error" class="error-details text-red-500 mt-1">
          {{ message.error }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useLangChainConfig } from '~/composables/useLangChainConfig';

const userInput = ref('');
const { processChain } = useLangChainConfig();
const loading = ref(false);
const messages = ref<Array<{ role: string; content: string; error?: string }>>([]);

async function testChain() {
  loading.value = true;
  try {
    const template = "Tell me a fun fact about {topic}";
    const variables = { topic: userInput.value };
    
    messages.value.push({
      role: "user",
      content: `Testing chain with topic: ${variables.topic}`
    });

    const response = await processChain(template, variables);
    messages.value.push({
      role: "assistant",
      content: response
    });
  } catch (error: any) {
    messages.value.push({
      role: "system",
      content: "Error occurred",
      error: error.message
    });
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.message {
  border-radius: 6px;
}

.message.user {
  background: var(--primary-50);
}

.message.assistant {
  background: var(--surface-100);
}

.message.system {
  background: var(--red-50);
}

.message-content {
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
