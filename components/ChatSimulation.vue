<template>
    <div class="chat-simulation">
        <div class="grid">
            <!-- Chat Area -->
            <div class="col-12 lg:col-8">
                <div class="card">
                    <div class="flex justify-content-between align-items-center mb-4">
                        <h2 class="text-xl font-bold m-0">{{ t('chat.title') }}</h2>
                        <div class="flex gap-2">
                            <Button icon="pi pi-refresh" severity="secondary" text @click="resetChat" />
                            <Button :label="t('chat.start')" severity="primary" @click="startSimulation" :disabled="isRunning" />
                            <Button :label="t('chat.stop')" severity="danger" @click="stopSimulation" :disabled="!isRunning" />
                        </div>
                    </div>
                    
                    <div class="chat-container surface-ground p-3 border-round" style="height: 500px; overflow-y: auto;">
                        <div v-for="(message, index) in messages" :key="index" class="mb-3">
                            <div :class="['flex gap-2', message.sender === 'user' ? 'justify-content-end' : '']">
                                <div v-if="message.sender !== 'user'" class="w-2rem h-2rem border-circle bg-primary flex align-items-center justify-content-center">
                                    <i class="pi pi-user text-white"></i>
                                </div>
                                <div :class="['message p-3 border-round', message.sender === 'user' ? 'surface-card' : 'bg-primary text-white']"
                                     style="max-width: 80%;">
                                    <div class="font-semibold mb-2">{{ message.sender === 'user' ? t('chat.you') : message.sender }}</div>
                                    <div>{{ message.content }}</div>
                                </div>
                                <div v-if="message.sender === 'user'" class="w-2rem h-2rem border-circle surface-card flex align-items-center justify-content-center">
                                    <i class="pi pi-user"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="mt-3 flex gap-2">
                        <InputText v-model="newMessage" class="flex-1" :placeholder="t('chat.inputPlaceholder')"
                                 @keyup.enter="sendMessage" :disabled="!isRunning" />
                        <Button icon="pi pi-send" severity="primary" @click="sendMessage" :disabled="!isRunning" />
                    </div>
                </div>
            </div>

            <!-- Configuration Panel -->
            <div class="col-12 lg:col-4">
                <div class="card">
                    <h3 class="text-xl font-bold mb-4">{{ t('chat.config.title') }}</h3>
                    
                    <div class="mb-3">
                        <label class="block font-medium mb-2">{{ t('chat.config.agents') }}</label>
                        <div v-for="(agent, index) in agents" :key="index" class="field-checkbox mb-2">
                            <Checkbox :id="'agent' + index" v-model="agent.active" :binary="true" />
                            <label :for="'agent' + index" class="ml-2">{{ agent.name }}</label>
                        </div>
                    </div>

                    <div class="mb-3">
                        <label class="block font-medium mb-2">{{ t('chat.config.scenario') }}</label>
                        <Dropdown v-model="selectedScenario" :options="scenarios" optionLabel="name"
                                class="w-full" :disabled="isRunning" />
                    </div>

                    <div class="mb-3">
                        <label class="block font-medium mb-2">{{ t('chat.config.duration') }}</label>
                        <InputNumber v-model="duration" :min="1" :max="60" suffix=" min"
                                   class="w-full" :disabled="isRunning" />
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
const messages = ref([]);
const newMessage = ref('');
const isRunning = ref(false);
const duration = ref(5);
const selectedScenario = ref(null);

// Agents configuration
const agents = ref([
    { name: 'Customer Service', active: true, role: 'support' },
    { name: 'Technical Expert', active: true, role: 'tech' },
    { name: 'Sales Representative', active: true, role: 'sales' }
]);

// Available scenarios
const scenarios = ref([
    { name: 'Product Inquiry', id: 'product' },
    { name: 'Technical Support', id: 'tech' },
    { name: 'Sales Process', id: 'sales' }
]);

// Initialize first scenario
selectedScenario.value = scenarios.value[0];

// Methods
const startSimulation = () => {
    isRunning.value = true;
    messages.value = [];
    // Add initial message based on scenario
    messages.value.push({
        sender: 'System',
        content: t('chat.welcome', { scenario: selectedScenario.value.name })
    });
};

const stopSimulation = () => {
    isRunning.value = false;
};

const resetChat = () => {
    messages.value = [];
    isRunning.value = false;
};

const sendMessage = () => {
    if (!newMessage.value.trim()) return;

    // Add user message
    messages.value.push({
        sender: 'user',
        content: newMessage.value
    });

    // Simulate agent response
    const activeAgents = agents.value.filter(a => a.active);
    if (activeAgents.length > 0) {
        setTimeout(() => {
            const agent = activeAgents[Math.floor(Math.random() * activeAgents.length)];
            messages.value.push({
                sender: agent.name,
                content: `This is a simulated response from ${agent.name}`
            });
        }, 1000);
    }

    newMessage.value = '';
};
</script>

<style scoped>
.chat-simulation {
    padding: 1rem;
}

.message {
    word-break: break-word;
}
</style>
