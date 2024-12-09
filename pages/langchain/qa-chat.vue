<template>
  <div class="p-4 max-w-4xl mx-auto">
    <div class="mb-6">
      <h1 class="text-3xl font-bold mb-2 text-primary">Acme Corporation Assistant</h1>
      <p class="text-secondary">
        Chat with our AI assistant about Acme Corporation. The assistant remembers your conversation
        and provides contextual responses about our company, products, and services.
      </p>
    </div>

    <!-- Chat Messages -->
    <div class="bg-surface-0 dark:bg-surface-900 rounded-lg shadow mb-4 p-4 h-[500px] overflow-y-auto" ref="chatContainer">
      <div v-if="messages.length === 0" class="flex flex-col items-center justify-center h-full text-secondary">
        <i class="pi pi-comments text-4xl mb-2"></i>
        <p>Start a conversation by asking a question about Acme Corporation</p>
      </div>
      
      <div v-else v-for="(message, index) in messages" :key="index" class="mb-4">
        <div :class="[
          'p-3 rounded-lg max-w-[80%]',
          message.type === 'human'
            ? 'bg-primary-100 dark:bg-primary-900 text-primary-900 dark:text-primary-100 ml-auto'
            : 'bg-surface-100 dark:bg-surface-800 text-surface-900 dark:text-surface-100'
        ]">
          <div class="text-xs mb-1 text-surface-600 dark:text-surface-400">
            {{ message.type === 'human' ? 'You' : 'Assistant' }}
          </div>
          <p class="whitespace-pre-wrap">{{ message.content }}</p>
        </div>
      </div>

      <div v-if="loading" class="flex items-center gap-2 text-secondary p-3 bg-surface-100 dark:bg-surface-800 rounded-lg">
        <i class="pi pi-spin pi-spinner" />
        <span>Assistant is thinking...</span>
      </div>
    </div>

    <!-- Input Area -->
    <div class="flex gap-2">
      <InputText
        v-model="question"
        placeholder="Ask about Acme Corporation..."
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
      <h3 class="text-lg font-semibold mb-2 text-primary">Try asking:</h3>
      <ul class="list-disc pl-5 space-y-2">
        <li>
          <button
            class="text-primary hover:text-primary-600 dark:hover:text-primary-400 hover:underline"
            @click="setQuestion('When was Acme Corporation founded and by whom?')"
          >
            When was Acme Corporation founded and by whom?
          </button>
        </li>
        <li>
          <button
            class="text-primary hover:text-primary-600 dark:hover:text-primary-400 hover:underline"
            @click="setQuestion('What is RoboAssist?')"
          >
            What is RoboAssist?
          </button>
        </li>
        <li>
          <button
            class="text-primary hover:text-primary-600 dark:hover:text-primary-400 hover:underline"
            @click="setQuestion('Tell me about the company\'s growth')"
          >
            Tell me about the company's growth
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

interface Message {
  type: 'human' | 'ai'
  content: string
}

const question = ref('')
const loading = ref(false)
const messages = ref<Message[]>([])
const chatContainer = ref<HTMLElement | null>(null)

// Scroll to bottom when messages change
watch(messages, async () => {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}, { deep: true })

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
    const response = await fetch('/api/langchain/qa-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        question: currentQuestion,
        chatHistory: messages.value // Send the entire chat history
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
      content: 'I apologize, but I encountered an error while processing your request. Please try again.'
    })
  } finally {
    loading.value = false
  }
}

const setQuestion = (q: string) => {
  question.value = q
  sendQuestion()
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

/* Smooth scrolling for chat container */
.overflow-y-auto {
  scroll-behavior: smooth;
}
</style>
