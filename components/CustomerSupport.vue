<template>
    <div class="customer-support">
        <div class="grid">
            <div class="col-12">
                <div class="card">
                    <!-- Chat Header -->
                    <div class="flex items-center justify-between mb-3 pb-2 border-b surface-border">
                        <div class="flex items-center">
                            <i class="pi pi-comments text-xl mr-2"></i>
                            <h2 class="text-xl font-bold m-0">{{ t('customerSupport.title') }}</h2>
                        </div>
                        <div class="flex items-center">
                            <Button icon="pi pi-refresh" 
                                   class="p-button-text" 
                                   @click="resetChat" />
                        </div>
                    </div>

                    <!-- Chat Messages -->
                    <div class="chat-container mb-3" ref="chatContainer">
                        <div v-for="(message, index) in messages" 
                             :key="index" 
                             :class="['message mb-3', message.type === 'user' ? 'user-message' : 'assistant-message']">
                            <div class="flex items-start">
                                <div class="message-avatar mr-2">
                                    <i :class="[message.type === 'user' ? 'pi pi-user' : 'pi pi-comments']"></i>
                                </div>
                                <div class="message-content">
                                    <div class="message-text">{{ message.content }}</div>
                                    <div v-if="message.type === 'assistant' && message.suggestedActions?.length" 
                                         class="suggested-actions mt-2">
                                        <Button v-for="action in message.suggestedActions" 
                                               :key="action"
                                               class="p-button-sm p-button-outlined mr-2 mb-2"
                                               @click="handleSuggestedAction(action)">
                                            {{ action }}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div v-if="isProcessing" class="processing-indicator">
                            <i class="pi pi-spin pi-spinner"></i>
                            {{ t('customerSupport.processing') }}
                        </div>
                    </div>

                    <!-- Chat Input -->
                    <div class="chat-input">
                        <div class="p-inputgroup">
                            <InputText v-model="currentMessage" 
                                     :placeholder="t('customerSupport.inputPlaceholder')"
                                     @keyup.enter="sendMessage"
                                     :disabled="isProcessing" />
                            <Button :label="t('customerSupport.send')"
                                    icon="pi pi-send"
                                    @click="sendMessage"
                                    :disabled="!currentMessage.trim() || isProcessing" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCustomerSupport } from '~/composables/useCustomerSupport';

const { t } = useI18n();
const chatContainer = ref<HTMLElement | null>(null);
const currentMessage = ref('');
const isProcessing = ref(false);

interface Message {
    type: 'user' | 'assistant';
    content: string;
    suggestedActions?: string[];
}

const messages = ref<Message[]>([
    {
        type: 'assistant',
        content: t('customerSupport.welcome'),
        suggestedActions: [
            t('customerSupport.actions.help'),
            t('customerSupport.actions.features'),
            t('customerSupport.actions.pricing')
        ]
    }
]);

const { processMessage } = useCustomerSupport();

const scrollToBottom = async () => {
    await nextTick();
    if (chatContainer.value) {
        chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
};

const sendMessage = async () => {
    if (!currentMessage.value.trim() || isProcessing.value) return;

    const userMessage = currentMessage.value.trim();
    messages.value.push({
        type: 'user',
        content: userMessage
    });
    currentMessage.value = '';
    await scrollToBottom();

    await processMessage(userMessage);
};

const resetChat = () => {
    messages.value = [
        {
            type: 'assistant',
            content: t('customerSupport.welcome'),
            suggestedActions: [
                t('customerSupport.actions.help'),
                t('customerSupport.actions.features'),
                t('customerSupport.actions.pricing')
            ]
        }
    ];
    currentMessage.value = '';
    isProcessing.value = false;
};

const handleSuggestedAction = (action: string) => {
    processMessage(action);
};

onMounted(() => {
    scrollToBottom();
});
</script>

<style scoped>
.customer-support {
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

.user-message {
    background-color: var(--primary-color);
    color: var(--primary-color-text);
    margin-left: 2rem;
}

.assistant-message {
    background-color: var(--surface-card);
    margin-right: 2rem;
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
</style>
