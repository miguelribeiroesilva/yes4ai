<template>
  <div class="autogen-chat">
    <div class="card">
      <!-- Chat Header -->
      <div class="flex items-center justify-between mb-3 pb-2 border-b surface-border">
        <div class="flex items-center">
          <i :class="['pi mr-2 text-xl', icon]"></i>
          <h2 class="text-xl font-bold m-0">{{ title }}</h2>
        </div>
        <div class="flex items-center gap-2">
          <Button v-if="showAgentList" 
                 icon="pi pi-users" 
                 class="p-button-text"
                 @click="agentListVisible = true" />
          <Button icon="pi pi-refresh" 
                 class="p-button-text" 
                 @click="resetChat" />
        </div>
      </div>

      <!-- Chat Messages -->
      <div class="chat-container mb-3" ref="chatContainer">
        <div v-for="(message, index) in messages" 
             :key="index" 
             :class="['message mb-3', `message-${message.role}`]">
          <div class="flex items-start">
            <div class="message-avatar mr-2">
              <i :class="getMessageIcon(message)"></i>
            </div>
            <div class="message-content">
              <div v-if="message.agentName" class="message-agent text-sm text-500 mb-1">
                {{ message.agentName }}
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
          {{ t('autogen.processing') }}
        </div>
      </div>

      <!-- Chat Input -->
      <div class="chat-input">
        <div class="p-inputgroup">
          <InputText v-model="currentMessage" 
                    :placeholder="t('autogen.inputPlaceholder')"
                    @keyup.enter="sendMessage"
                    :disabled="isProcessing" />
          <Button :label="t('autogen.send')"
                  icon="pi pi-send"
                  @click="sendMessage"
                  :disabled="!currentMessage.trim() || isProcessing" />
        </div>
      </div>
    </div>

    <!-- Agent List Dialog -->
    <Dialog v-model:visible="agentListVisible" 
            :header="t('autogen.agentList')"
            :modal="true"
            :style="{ width: '50vw' }">
      <div class="agent-list">
        <div v-for="agent in agents" 
             :key="agent.name" 
             class="agent-item p-3 mb-2 surface-ground border-round">
          <div class="font-medium mb-1">{{ agent.name }}</div>
          <div class="text-500 text-sm mb-1">{{ agent.role }}</div>
          <div class="text-sm">{{ agent.description }}</div>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAutoGen } from '~/composables/useAutoGen';

const props = defineProps<{
  title: string;
  icon: string;
  showAgentList?: boolean;
  mode?: 'basic' | 'multi' | 'group' | 'task';
}>();

const { t } = useI18n();
const chatContainer = ref<HTMLElement | null>(null);
const currentMessage = ref('');
const agentListVisible = ref(false);

const {
  messages,
  agents,
  isProcessing,
  processMessage,
  processMultiAgentChat,
  processGroupChat,
  solveTask,
  clearMessages
} = useAutoGen();

const scrollToBottom = async () => {
  await nextTick();
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  }
};

const sendMessage = async () => {
  if (!currentMessage.value.trim() || isProcessing.value) return;

  const message = currentMessage.value.trim();
  currentMessage.value = '';
  await scrollToBottom();

  switch (props.mode) {
    case 'multi':
      await processMultiAgentChat(message);
      break;
    case 'group':
      await processGroupChat(message);
      break;
    case 'task':
      await solveTask(message);
      break;
    default:
      await processMessage(message);
  }

  await scrollToBottom();
};

const resetChat = () => {
  clearMessages();
  currentMessage.value = '';
};

const getMessageIcon = (message: { role: string; agentName?: string }) => {
  if (message.role === 'user') return 'pi pi-user';
  if (message.role === 'system') return 'pi pi-info-circle';
  return 'pi pi-comments';
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
.autogen-chat {
  height: 100%;
  padding: 1rem;
}

.chat-container {
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

.chat-input {
  margin-top: 1rem;
}

.agent-list {
  max-height: 60vh;
  overflow-y: auto;
}
</style>
