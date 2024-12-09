<template>
  <div class="claude-test">
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

    <div class="mb-4">
      <Button
        label="Ask Claude"
        @click="sendMessage"
        :loading="loading"
        class="mr-2"
      />
    </div>

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
        <div v-if="message.metadata" class="text-sm text-500 mt-1">
          <div>Model: {{ message.metadata.model }}</div>
          <div>Tokens: {{ message.metadata.usage?.input_tokens }} in / {{ message.metadata.usage?.output_tokens }} out</div>
        </div>
        <div v-if="message.error" class="error-details text-red-500 mt-1">
          {{ message.error }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const userInput = ref('');
const loading = ref(false);
const messages = ref<Array<{
  role: string;
  content: string;
  metadata?: {
    model?: string;
    usage?: {
      input_tokens?: number;
      output_tokens?: number;
    };
  };
  error?: string;
}>>([]);

async function sendMessage() {
  if (!userInput.value.trim()) return;
  
  loading.value = true;
  try {
    messages.value.push({
      role: "user",
      content: userInput.value
    });

    const response = await $fetch('/api/claude', {
      method: 'POST',
      body: {
        message: userInput.value
      }
    });

    messages.value.push({
      role: "assistant",
      content: response.result,
      metadata: {
        model: response.model,
        usage: response.usage
      }
    });

    userInput.value = '';
  } catch (error: any) {
    messages.value.push({
      role: "system",
      content: "Error occurred",
      error: error.data?.message || error.message
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
