<template>
  <div class="p-4 max-w-4xl mx-auto">
    <div class="mb-6">
      <h1 class="text-3xl font-bold mb-2 text-primary">Query Analysis Demo</h1>
      <p class="text-secondary">
        This demo shows how to analyze a query before searching for relevant documents.
        The analysis helps determine the most relevant search strategy and parameters.
      </p>
    </div>

    <!-- Query Analysis Section -->
    <div v-if="analysis" class="mb-6 p-4 bg-surface-0 dark:bg-surface-900 rounded-lg shadow">
      <h2 class="text-xl font-semibold mb-3 text-primary">Query Analysis</h2>
      <div class="space-y-2">
        <div>
          <span class="font-semibold">Query Type:</span>
          <span class="ml-2">{{ analysis.queryType }}</span>
        </div>
        <div>
          <span class="font-semibold">Keywords:</span>
          <span class="ml-2">{{ analysis.keywords.join(', ') }}</span>
        </div>
        <div>
          <span class="font-semibold">Reasoning:</span>
          <p class="mt-1">{{ analysis.reasoning }}</p>
        </div>
      </div>
    </div>

    <!-- Chat Messages -->
    <div class="bg-surface-0 dark:bg-surface-900 rounded-lg shadow mb-4 p-4 h-[400px] overflow-y-auto" ref="chatContainer">
      <div v-if="messages.length === 0" class="flex flex-col items-center justify-center h-full text-secondary">
        <i class="pi pi-search text-4xl mb-2"></i>
        <p>Ask a question to see how it's analyzed before searching</p>
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
        <span>Analyzing query and searching...</span>
      </div>
    </div>

    <!-- Input Area -->
    <div class="flex gap-2">
      <InputText
        v-model="question"
        placeholder="Ask a question..."
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
            @click="setQuestion('What are the key features of RoboAssist?')"
          >
            What are the key features of RoboAssist?
          </button>
        </li>
        <li>
          <button
            class="text-primary hover:text-primary-600 dark:hover:text-primary-400 hover:underline"
            @click="setQuestion('Compare the growth of Acme in 2022 vs 2023')"
          >
            Compare the growth of Acme in 2022 vs 2023
          </button>
        </li>
        <li>
          <button
            class="text-primary hover:text-primary-600 dark:hover:text-primary-400 hover:underline"
            @click="setQuestion('Who is the founder of Acme Corporation?')"
          >
            Who is the founder of Acme Corporation?
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

interface Analysis {
  queryType: string
  keywords: string[]
  reasoning: string
}

const question = ref('')
const loading = ref(false)
const messages = ref<Message[]>([])
const analysis = ref<Analysis | null>(null)
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
  analysis.value = null

  try {
    const response = await fetch('/api/langchain/query-analysis', {
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
    
    // Update analysis
    analysis.value = data.analysis

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

.bg-surface-0 {
  @apply bg-white dark:bg-gray-900;
}
</style>
