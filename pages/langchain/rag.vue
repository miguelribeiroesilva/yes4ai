<template>
  <div class="p-4 max-w-4xl mx-auto">
    <div class="mb-6">
      <h1 class="text-3xl font-bold mb-2 text-primary">RAG Demo</h1>
      <p class="text-secondary">
        This demo uses RAG (Retrieval Augmented Generation) to answer questions about the LangChain.js documentation.
        The content is retrieved from the LangChain Expression Language Cookbook page.
      </p>
    </div>

    <!-- Chat Messages -->
    <div class="bg-surface-0 dark:bg-surface-900 rounded-lg shadow mb-4 p-4 h-[500px] overflow-y-auto">
      <div v-for="(message, index) in messages" :key="index" class="mb-4">
        <div :class="[
          'p-3 rounded-lg max-w-[80%]',
          message.type === 'human'
            ? 'bg-primary-100 dark:bg-primary-900 text-primary-900 dark:text-primary-100 ml-auto'
            : 'bg-surface-100 dark:bg-surface-800 text-surface-900 dark:text-surface-100'
        ]">
          <p class="whitespace-pre-wrap">{{ message.content }}</p>
        </div>
      </div>
      <div v-if="loading" class="flex items-center gap-2 text-secondary">
        <i class="pi pi-spin pi-spinner" />
        Retrieving and processing information...
      </div>
    </div>

    <!-- Input Area -->
    <div class="flex gap-2">
      <InputText
        v-model="question"
        placeholder="Ask a question about LangChain Expression Language..."
        class="flex-grow"
        @keyup.enter="sendQuestion"
      />
      <Button
        icon="pi pi-send"
        @click="sendQuestion"
        :loading="loading"
        :disabled="!question.trim()"
      />
    </div>

    <!-- Example Questions -->
    <div class="mt-4">
      <h3 class="text-lg font-semibold mb-2 text-primary">Example Questions:</h3>
      <ul class="list-disc pl-5 space-y-2">
        <li>
          <button
            class="text-primary hover:text-primary-600 dark:hover:text-primary-400 hover:underline"
            @click="setQuestion('What is retrieval in LangChain?')"
          >
            What is retrieval in LangChain?
          </button>
        </li>
        <li>
          <button
            class="text-primary hover:text-primary-600 dark:hover:text-primary-400 hover:underline"
            @click="setQuestion('How can I use RunnableSequence with retrieval?')"
          >
            How can I use RunnableSequence with retrieval?
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Message {
  type: 'human' | 'ai'
  content: string
}

const question = ref('')
const loading = ref(false)
const messages = ref<Message[]>([])

const sendQuestion = async () => {
  const currentQuestion = question.value.trim()
  if (!currentQuestion || loading.value) return

  // Add user message
  messages.value.push({
    type: 'human',
    content: currentQuestion
  })

  loading.value = true
  question.value = ''

  try {
    const response = await fetch('/api/langchain/rag', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        question: currentQuestion
      })
    })

    if (!response.ok) {
      throw new Error('Failed to get response')
    }

    const data = await response.json()
    
    // Add AI response
    messages.value.push({
      type: 'ai',
      content: data.response
    })
  } catch (error) {
    console.error('Error:', error)
    messages.value.push({
      type: 'ai',
      content: 'Sorry, I encountered an error while processing your request.'
    })
  } finally {
    loading.value = false
  }
}

const setQuestion = (q: string) => {
  question.value = q
}
</script>

<style>
.text-primary {
  @apply text-primary-700 dark:text-primary-300;
}

.text-secondary {
  @apply text-surface-600 dark:text-surface-400;
}

/* Ensure proper contrast in dark mode for input fields */
.p-inputtext {
  @apply bg-surface-0 dark:bg-surface-900 text-surface-900 dark:text-surface-100;
}

/* Improve button contrast in dark mode */
.p-button {
  @apply dark:bg-primary-700 dark:hover:bg-primary-600;
}
</style>
