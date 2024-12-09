<template>
  <div class="chat-test">
    <div class="mb-4">
      <span class="p-float-label">
        <Textarea v-model="userInput" rows="3" class="w-full" :disabled="loading" />
        <label>Enter your message</label>
      </span>
    </div>

    <div class="mb-4">
      <Button label="Send Message" @click="sendMessage" :loading="loading" class="mr-2" />
      <Dropdown
        v-model="selectedModel"
        :options="modelOptions"
        optionLabel="name"
        placeholder="Select Model"
        class="w-48"
      />
    </div>

    <div class="response-section">
      <h3>Responses:</h3>
      <div v-for="(message, index) in messages" :key="index" class="message p-3 mb-2" :class="message.role">
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
import type { ChatRequest, ChatResponse } from '~/types/api';
import { ref, onMounted } from 'vue';

const userInput = ref('');
const loading = ref(false);
const messages = ref<Array<{ role: string; content: string; error?: string }>>([]);

const modelOptions = [
  { name: 'OpenAI', endpoint: '/api/chat' },
  { name: 'Claude', endpoint: '/api/claude' },
  { name: 'LangChain (OpenAI)', endpoint: '/api/langchain' }
];
const selectedModel = ref(modelOptions[0]);

// Test the API connection on component mount
onMounted(async () => {
  try {
    console.log('Testing API connection...');
    const testResponse = await $fetch('/api/test');
    console.log('Test response:', testResponse);
  } catch (error) {
    console.error('Test API error:', error);
  }
});

async function sendMessage() {
  if (!userInput.value.trim()) return;

  loading.value = true;
  const message = userInput.value;

  messages.value.push({
    role: "user",
    content: message
  });

  try {
    console.log('Sending chat request with message:', message);

    const response = await $fetch<ChatResponse>(selectedModel.value.endpoint, {
      method: 'POST',
      body: { message }
    });

    console.log('Received response:', response);

    if (response?.success && response?.result) {
      messages.value.push({
        role: "assistant",
        content: response.result
      });
      userInput.value = '';
    } else {
      console.error('Invalid response structure:', response);
      throw new Error('Invalid response from server');
    }
  } catch (error: any) {
    console.error('Chat error:', error);
    messages.value.push({
      role: "system",
      content: "Error occurred",
      error: error.data?.message || error.statusMessage || error.message || 'Unknown error'
    });
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.message {
  border-radius: 8px;
  background-color: var(--surface-card);
}

.message.user {
  background-color: var(--primary-50);
}

.message.assistant {
  background-color: var(--surface-100);
}

.message.system {
  background-color: var(--red-50);
}
</style>
