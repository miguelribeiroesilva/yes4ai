<template>
  <div class="card">
    <h1>LLM Chain Example</h1>
    
    <div class="mb-4">
      <h2>Template Configuration</h2>
      <span class="p-float-label mt-4">
        <Textarea
          v-model="template"
          rows="3"
          class="w-full"
          :disabled="loading"
        />
        <label>Prompt Template</label>
      </span>
      <small class="text-gray-500">Use {product} as a variable in your template</small>
    </div>

    <div class="mb-4">
      <h2>Input</h2>
      <span class="p-float-label mt-4">
        <InputText
          v-model="productInput"
          class="w-full"
          :disabled="loading"
        />
        <label>Enter a product</label>
      </span>
    </div>

    <div class="mb-4">
      <Button
        label="Run Chain"
        @click="runChain"
        :loading="loading"
        class="mr-2"
      />
    </div>

    <div v-if="response" class="response-section">
      <h2>Response</h2>
      <div class="message p-3 mb-2">
        <div class="message-content">{{ response }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const loading = ref(false);
const template = ref('What is a good name for a company that makes {product}?');
const productInput = ref('');
const response = ref('');

async function runChain() {
  if (!productInput.value.trim()) return;

  loading.value = true;
  try {
    const result = await $fetch('/api/langchain/llm-chain', {
      method: 'POST',
      body: {
        template: template.value,
        variables: {
          product: productInput.value
        }
      }
    });

    response.value = result.result;
  } catch (error) {
    console.error('Error running chain:', error);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.response-section {
  margin-top: 2rem;
  padding: 1rem;
  background-color: var(--surface-ground);
  border-radius: 6px;
}

.message {
  background-color: var(--surface-card);
  border-radius: 6px;
}
</style>
