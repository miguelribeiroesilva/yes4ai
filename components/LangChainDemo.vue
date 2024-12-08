<template>
  <div class="langchain-demo">
    <div class="card">
      <!-- Header -->
      <div class="flex items-center justify-between mb-3 pb-2 border-b surface-border">
        <div class="flex items-center">
          <i :class="['pi mr-2 text-xl', icon]"></i>
          <h2 class="text-xl font-bold m-0">{{ title }}</h2>
        </div>
        <div class="flex items-center gap-2">
          <Button v-if="showOptions" 
                 icon="pi pi-cog" 
                 class="p-button-text"
                 @click="optionsVisible = true" />
          <Button icon="pi pi-refresh" 
                 class="p-button-text" 
                 @click="resetDemo" />
        </div>
      </div>

      <!-- Configuration Panel -->
      <div v-if="showConfig" class="config-panel mb-3 p-3 surface-ground border-round">
        <div class="grid">
          <div v-for="option in configOptions" 
               :key="option.key" 
               class="col-12 md:col-6 lg:col-4">
            <div class="field">
              <label :for="option.key" class="block mb-2">{{ option.label }}</label>
              <Dropdown v-if="option.type === 'select'"
                       v-model="selectedOptions[option.key]"
                       :options="option.options"
                       :placeholder="option.placeholder"
                       class="w-full" />
              <InputText v-else-if="option.type === 'text'"
                        v-model="selectedOptions[option.key]"
                        :placeholder="option.placeholder"
                        class="w-full" />
            </div>
          </div>
        </div>
      </div>

      <!-- Messages -->
      <div class="messages-container mb-3" ref="messagesContainer">
        <div v-for="(message, index) in messages" 
             :key="index" 
             :class="['message mb-3', `message-${message.role}`]">
          <div class="flex items-start">
            <div class="message-avatar mr-2">
              <i :class="getMessageIcon(message)"></i>
            </div>
            <div class="message-content">
              <div v-if="message.metadata" class="message-metadata text-sm text-500 mb-1">
                {{ formatMetadata(message.metadata) }}
              </div>
              <div class="message-text">{{ message.content }}</div>
              <div class="message-time text-xs text-500 mt-1">
                {{ formatTime(message.timestamp) }}
              </div>
            </div>
          </div>
        </div>
        <div v-if="isProcessing" class="processing-indicator">
          <i class="pi pi-spin pi-spinner"></i>
          {{ t('langchain.processing') }}
        </div>
      </div>

      <!-- Input -->
      <div class="demo-input">
        <div class="p-inputgroup">
          <InputText v-model="currentInput" 
                    :placeholder="inputPlaceholder"
                    @keyup.enter="processInput"
                    :disabled="isProcessing" />
          <Button :label="t('langchain.run')"
                  icon="pi pi-play"
                  @click="processInput"
                  :disabled="!currentInput.trim() || isProcessing" />
        </div>
      </div>
    </div>

    <!-- Options Dialog -->
    <Dialog v-model:visible="optionsVisible" 
            :header="t('langchain.options')"
            :modal="true"
            :style="{ width: '50vw' }">
      <div class="options-content">
        <!-- Options content based on demo type -->
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { useLangChain } from '~/composables/useLangChain';

const props = defineProps<{
  title: string;
  icon: string;
  mode: 'chains' | 'agents' | 'memory' | 'retrieval' | 'prompts' | 'output-parsers';
  showConfig?: boolean;
  showOptions?: boolean;
  configOptions?: Array<{
    key: string;
    label: string;
    type: 'select' | 'text';
    options?: Array<{ label: string; value: any }>;
    placeholder?: string;
  }>;
  inputPlaceholder?: string;
}>();

const { t } = useI18n();
const messagesContainer = ref<HTMLElement | null>(null);
const currentInput = ref('');
const optionsVisible = ref(false);
const selectedOptions = ref<Record<string, any>>({});

const {
  messages,
  isProcessing,
  processChain,
  runAgent,
  useMemory,
  performRetrieval,
  usePromptTemplate,
  parseOutput,
  clearMessages
} = useLangChain();

const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

const processInput = async () => {
  if (!currentInput.value.trim() || isProcessing.value) return;

  const input = currentInput.value.trim();
  currentInput.value = '';
  await scrollToBottom();

  switch (props.mode) {
    case 'chains':
      await processChain(input, selectedOptions.value.chainType || 'default');
      break;
    case 'agents':
      await runAgent(input, selectedOptions.value.agentType || 'default');
      break;
    case 'memory':
      await useMemory(input, selectedOptions.value.memoryType || 'default');
      break;
    case 'retrieval':
      await performRetrieval(input, selectedOptions.value.retrievalType || 'default');
      break;
    case 'prompts':
      await usePromptTemplate(input, selectedOptions.value.template || 'default');
      break;
    case 'output-parsers':
      await parseOutput(input, selectedOptions.value.format || 'default');
      break;
  }

  await scrollToBottom();
};

const resetDemo = () => {
  clearMessages();
  currentInput.value = '';
  selectedOptions.value = {};
};

const getMessageIcon = (message: { role: string; metadata?: any }) => {
  if (message.role === 'user') return 'pi pi-user';
  if (message.role === 'system') return 'pi pi-info-circle';
  return 'pi pi-comments';
};

const formatMetadata = (metadata: Record<string, any>) => {
  const key = Object.keys(metadata).find(k => k !== 'type');
  return key ? `Using ${metadata[key]}` : '';
};

const formatTime = (timestamp: Date) => {
  return new Intl.DateTimeFormat('default', {
    hour: 'numeric',
    minute: 'numeric'
  }).format(timestamp);
};

onMounted(() => {
  scrollToBottom();
});
</script>

<style scoped>
.langchain-demo {
  height: 100%;
  padding: 1rem;
}

.messages-container {
  height: 400px;
  overflow-y: auto;
  padding: 1rem;
  background-color: var(--surface-ground);
  border-radius: var(--border-radius);
}

.message {
  padding: 0.5rem;
  border-radius: var(--border-radius);
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--surface-d);
  display: flex;
  align-items: center;
  justify-content: center;
}

.message-user {
  background-color: var(--primary-color);
  color: var(--primary-color-text);
  margin-left: 2rem;
}

.message-assistant {
  background-color: var(--surface-card);
  margin-right: 2rem;
}

.message-system {
  background-color: var(--surface-hover);
  margin: 0 3rem;
  text-align: center;
  font-style: italic;
}

.message-content {
  flex: 1;
}

.processing-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-color-secondary);
  font-style: italic;
  padding: 0.5rem;
}

.demo-input {
  margin-top: 1rem;
}

.options-content {
  max-height: 60vh;
  overflow-y: auto;
}
</style>
