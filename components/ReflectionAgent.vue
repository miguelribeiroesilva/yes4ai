<template>
    <div class="reflection-agent">
        <div class="grid">
            <!-- Main Interaction Area -->
            <div class="col-12 lg:col-8">
                <div class="card">
                    <!-- Header -->
                    <div class="flex justify-content-between align-items-center mb-4">
                        <h2 class="text-xl font-bold m-0">{{ t('reflection.title') }}</h2>
                        <div class="flex gap-2">
                            <Button :label="t('reflection.actions.clear')" icon="pi pi-trash" severity="secondary" @click="clearConversation" />
                            <Button :label="t('reflection.actions.reflect')" icon="pi pi-sync" severity="primary" @click="triggerReflection" :loading="isReflecting" />
                        </div>
                    </div>

                    <!-- Conversation History -->
                    <div class="conversation-history surface-ground p-3 border-round mb-3" style="height: 300px; overflow-y: auto;">
                        <div v-for="(message, index) in conversationHistory" :key="index" class="mb-3">
                            <div :class="['message p-3 border-round', getMessageClass(message.type)]">
                                <div class="flex align-items-center gap-2 mb-2">
                                    <i :class="getMessageIcon(message.type)"></i>
                                    <span class="font-semibold">{{ getMessageLabel(message.type) }}</span>
                                    <small class="text-500 ml-auto">{{ message.timestamp }}</small>
                                </div>
                                <div class="message-content">
                                    {{ message.content }}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Reflection Panel -->
                    <div v-if="reflectionInsights.length > 0" class="reflection-panel mb-3">
                        <h3 class="text-lg font-semibold mb-2">{{ t('reflection.insights.title') }}</h3>
                        <div class="surface-ground p-3 border-round">
                            <Timeline :value="reflectionInsights">
                                <template #content="slotProps">
                                    <div class="flex flex-column gap-2">
                                        <span class="font-semibold">{{ slotProps.item.category }}</span>
                                        <p class="m-0 line-height-3">{{ slotProps.item.content }}</p>
                                    </div>
                                </template>
                            </Timeline>
                        </div>
                    </div>

                    <!-- Input Area -->
                    <div class="input-area">
                        <span class="p-float-label">
                            <Textarea
                                v-model="userInput"
                                :placeholder="t('reflection.input.placeholder')"
                                rows="3"
                                class="w-full"
                                :disabled="isReflecting"
                                @keyup.enter="sendMessage"
                            />
                            <label>{{ t('reflection.input.label') }}</label>
                        </span>
                        <div class="flex justify-content-end mt-2">
                            <Button :label="t('reflection.actions.send')" icon="pi pi-send" @click="sendMessage" :disabled="!userInput.trim() || isReflecting" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Configuration Panel -->
            <div class="col-12 lg:col-4">
                <div class="card">
                    <h3 class="text-xl font-bold mb-4">{{ t('reflection.config.title') }}</h3>

                    <!-- Reflection Triggers -->
                    <div class="mb-4">
                        <h4 class="font-medium mb-2">{{ t('reflection.config.triggers') }}</h4>
                        <div v-for="(trigger, index) in reflectionTriggers" :key="index" class="field-checkbox mb-2">
                            <Checkbox :id="'trigger' + index" v-model="trigger.enabled" :binary="true" />
                            <label :for="'trigger' + index" class="ml-2">{{ trigger.label }}</label>
                        </div>
                    </div>

                    <!-- Reflection Depth -->
                    <div class="mb-4">
                        <h4 class="font-medium mb-2">{{ t('reflection.config.depth.title') }}</h4>
                        <div class="field">
                            <label class="block mb-1">{{ t('reflection.config.depth.level') }}</label>
                            <Slider v-model="reflectionDepth" :min="1" :max="5" :step="1" />
                            <small class="text-500">{{ t('reflection.config.depth.description', { level: reflectionDepth }) }}</small>
                        </div>
                    </div>

                    <!-- Memory Settings -->
                    <div class="mb-4">
                        <h4 class="font-medium mb-2">{{ t('reflection.config.memory.title') }}</h4>
                        <div class="field">
                            <label class="block mb-1">{{ t('reflection.config.memory.retention') }}</label>
                            <InputNumber v-model="memoryRetention" :min="1" :max="100" suffix=" messages" class="w-full" />
                        </div>
                    </div>

                    <!-- Visualization -->
                    <div class="mb-4">
                        <h4 class="font-medium mb-2">{{ t('reflection.config.visualization') }}</h4>
                        <div class="field">
                            <Dropdown
                                v-model="selectedVisualization"
                                :options="visualizationOptions"
                                optionLabel="name"
                                class="w-full"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

// State
const isReflecting = ref(false);
const userInput = ref('');
const conversationHistory = ref([]);
const reflectionInsights = ref([]);
const reflectionDepth = ref(3);
const memoryRetention = ref(50);

// Reflection Triggers
const reflectionTriggers = ref([
    { label: t('reflection.triggers.messageCount'), enabled: true, type: 'count' },
    { label: t('reflection.triggers.timeInterval'), enabled: true, type: 'time' },
    { label: t('reflection.triggers.emotionalShift'), enabled: true, type: 'emotion' },
    { label: t('reflection.triggers.topicChange'), enabled: true, type: 'topic' }
]);

// Visualization Options
const visualizationOptions = ref([
    { name: t('reflection.visualization.timeline'), id: 'timeline' },
    { name: t('reflection.visualization.graph'), id: 'graph' },
    { name: t('reflection.visualization.mindmap'), id: 'mindmap' }
]);
const selectedVisualization = ref(visualizationOptions.value[0]);

// Methods
const getMessageClass = (type) => {
    const classes = {
        user: 'surface-card',
        agent: 'bg-primary text-white',
        reflection: 'surface-card border-primary-500 border-2'
    };
    return classes[type] || 'surface-card';
};

const getMessageIcon = (type) => {
    const icons = {
        user: 'pi pi-user',
        agent: 'pi pi-comments',
        reflection: 'pi pi-sync'
    };
    return icons[type] || 'pi pi-circle';
};

const getMessageLabel = (type) => {
    return t(`reflection.messageTypes.${type}`);
};

const sendMessage = () => {
    if (!userInput.value.trim()) return;

    // Add user message
    conversationHistory.value.push({
        type: 'user',
        content: userInput.value,
        timestamp: new Date().toLocaleTimeString()
    });

    // Simulate agent response
    setTimeout(() => {
        conversationHistory.value.push({
            type: 'agent',
            content: `Simulated response to: ${userInput.value}`,
            timestamp: new Date().toLocaleTimeString()
        });
    }, 1000);

    userInput.value = '';
};

const triggerReflection = async () => {
    isReflecting.value = true;

    // Simulate reflection process
    await new Promise(resolve => setTimeout(resolve, 2000));

    reflectionInsights.value = [
        {
            category: t('reflection.insights.patterns'),
            content: 'Identified recurring themes in conversation'
        },
        {
            category: t('reflection.insights.emotions'),
            content: 'Detected emotional patterns and shifts'
        },
        {
            category: t('reflection.insights.topics'),
            content: 'Analyzed topic transitions and connections'
        }
    ];

    conversationHistory.value.push({
        type: 'reflection',
        content: 'Generated reflection insights based on conversation analysis',
        timestamp: new Date().toLocaleTimeString()
    });

    isReflecting.value = false;
};

const clearConversation = () => {
    conversationHistory.value = [];
    reflectionInsights.value = [];
};
</script>

<style scoped>
.reflection-agent {
    padding: 1rem;
}

.message-content {
    white-space: pre-wrap;
    word-break: break-word;
}

:deep(.p-timeline-event-content) {
    line-height: 1.5;
}
</style>
