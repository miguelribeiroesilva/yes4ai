<template>
    <div class="agent-collaboration">
        <div class="grid">
            <!-- Main Workspace -->
            <div class="col-12 lg:col-8">
                <div class="card">
                    <!-- Header -->
                    <div class="flex justify-content-between align-items-center mb-4">
                        <h2 class="text-xl font-bold m-0">{{ t('collaboration.title') }}</h2>
                        <div class="flex gap-2">
                            <Button :label="t('collaboration.actions.reset')" icon="pi pi-refresh" severity="secondary" @click="resetSimulation" />
                            <Button :label="t('collaboration.actions.start')" icon="pi pi-play" severity="primary" @click="startSimulation" :loading="isRunning" />
                        </div>
                    </div>

                    <!-- Task Input -->
                    <div class="mb-4">
                        <span class="p-float-label">
                            <Textarea
                                v-model="taskInput"
                                :placeholder="t('collaboration.input.placeholder')"
                                rows="3"
                                class="w-full"
                                :disabled="isRunning"
                            />
                            <label>{{ t('collaboration.input.label') }}</label>
                        </span>
                    </div>

                    <!-- Collaboration Network -->
                    <div class="collaboration-network surface-ground p-3 border-round mb-4">
                        <h3 class="text-lg font-semibold mb-3">{{ t('collaboration.network.title') }}</h3>
                        <div class="network-visualization" style="height: 300px;">
                            <!-- Agent Network Visualization -->
                            <div class="grid">
                                <div v-for="(agent, index) in agents" :key="index" class="col-4">
                                    <div :class="['agent-node p-3 border-round text-center', getAgentStatus(agent)]">
                                        <i :class="getAgentIcon(agent.role)" class="text-xl mb-2"></i>
                                        <div class="font-semibold mb-2">{{ agent.name }}</div>
                                        <Tag :value="agent.status" :severity="getStatusSeverity(agent.status)" />
                                        <div class="mt-2 text-500">{{ agent.currentTask }}</div>
                                    </div>
                                    <!-- Connection Lines (simplified) -->
                                    <div v-if="agent.connections" class="connections">
                                        <div v-for="conn in agent.connections" :key="conn" 
                                             class="connection-line" :class="{'active': isConnectionActive(agent.id, conn)}">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Communication Panel -->
                    <div class="communication-panel surface-ground p-3 border-round mb-4" style="height: 300px; overflow-y: auto;">
                        <h3 class="text-lg font-semibold mb-3">{{ t('collaboration.communication.title') }}</h3>
                        <Timeline :value="communications">
                            <template #content="slotProps">
                                <div :class="['message-card p-3 border-round surface-card', {'border-primary': slotProps.item.important}]">
                                    <div class="flex align-items-center gap-2 mb-2">
                                        <i :class="getCommunicationIcon(slotProps.item.type)"></i>
                                        <span class="font-semibold">{{ slotProps.item.from }}</span>
                                        <i class="pi pi-arrow-right"></i>
                                        <span class="font-semibold">{{ slotProps.item.to }}</span>
                                        <small class="text-500 ml-auto">{{ slotProps.item.timestamp }}</small>
                                    </div>
                                    <div class="message-content">{{ slotProps.item.message }}</div>
                                    <div v-if="slotProps.item.response" class="mt-2 text-500">
                                        {{ t('collaboration.communication.response') }}: {{ slotProps.item.response }}
                                    </div>
                                </div>
                            </template>
                        </Timeline>
                    </div>

                    <!-- Progress Tracking -->
                    <div class="progress-tracking p-3 border-round surface-ground">
                        <h3 class="text-lg font-semibold mb-3">{{ t('collaboration.progress.title') }}</h3>
                        <div class="grid">
                            <div v-for="(metric, index) in progressMetrics" :key="index" class="col-4">
                                <div class="metric-card p-3 border-round surface-card">
                                    <div class="font-semibold mb-2">{{ metric.name }}</div>
                                    <ProgressBar :value="metric.value" :class="getProgressClass(metric.value)" />
                                    <small class="block mt-2 text-500">{{ metric.description }}</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Configuration Panel -->
            <div class="col-12 lg:col-4">
                <div class="card">
                    <h3 class="text-xl font-bold mb-4">{{ t('collaboration.config.title') }}</h3>

                    <!-- Collaboration Mode -->
                    <div class="mb-4">
                        <h4 class="font-medium mb-2">{{ t('collaboration.config.mode.title') }}</h4>
                        <div class="field mb-2">
                            <Dropdown
                                v-model="collaborationConfig.mode"
                                :options="collaborationModes"
                                optionLabel="name"
                                class="w-full"
                            />
                        </div>
                    </div>

                    <!-- Communication Settings -->
                    <div class="mb-4">
                        <h4 class="font-medium mb-2">{{ t('collaboration.config.communication.title') }}</h4>
                        <div class="field-checkbox mb-2">
                            <Checkbox v-model="communicationConfig.broadcastEnabled" :binary="true" />
                            <label class="ml-2">{{ t('collaboration.config.communication.broadcast') }}</label>
                        </div>
                        <div class="field-checkbox mb-2">
                            <Checkbox v-model="communicationConfig.realtime" :binary="true" />
                            <label class="ml-2">{{ t('collaboration.config.communication.realtime') }}</label>
                        </div>
                    </div>

                    <!-- Agent Roles -->
                    <div class="mb-4">
                        <h4 class="font-medium mb-2">{{ t('collaboration.config.roles.title') }}</h4>
                        <div v-for="(role, index) in agentRoles" :key="index" class="field-checkbox mb-2">
                            <Checkbox v-model="role.enabled" :binary="true" />
                            <label class="ml-2">{{ role.name }}</label>
                            <small class="block text-500 ml-4">{{ role.description }}</small>
                        </div>
                    </div>

                    <!-- Task Distribution -->
                    <div class="mb-4">
                        <h4 class="font-medium mb-2">{{ t('collaboration.config.distribution.title') }}</h4>
                        <div class="field mb-2">
                            <Dropdown
                                v-model="distributionConfig.strategy"
                                :options="distributionStrategies"
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
const isRunning = ref(false);
const taskInput = ref('');
const communications = ref([]);

// Configuration
const collaborationModes = ref([
    { name: t('collaboration.modes.cooperative'), value: 'cooperative' },
    { name: t('collaboration.modes.competitive'), value: 'competitive' },
    { name: t('collaboration.modes.hybrid'), value: 'hybrid' }
]);

const collaborationConfig = ref({
    mode: collaborationModes.value[0]
});

const communicationConfig = ref({
    broadcastEnabled: true,
    realtime: true
});

const distributionStrategies = ref([
    { name: t('collaboration.distribution.round'), value: 'round-robin' },
    { name: t('collaboration.distribution.skill'), value: 'skill-based' },
    { name: t('collaboration.distribution.load'), value: 'load-balanced' }
]);

const distributionConfig = ref({
    strategy: distributionStrategies.value[1]
});

// Agent Roles
const agentRoles = ref([
    {
        name: t('collaboration.roles.coordinator'),
        description: t('collaboration.roles.coordinatorDesc'),
        enabled: true
    },
    {
        name: t('collaboration.roles.specialist'),
        description: t('collaboration.roles.specialistDesc'),
        enabled: true
    },
    {
        name: t('collaboration.roles.evaluator'),
        description: t('collaboration.roles.evaluatorDesc'),
        enabled: true
    }
]);

// Active Agents
const agents = ref([
    {
        id: 'coordinator',
        name: t('collaboration.agents.coordinator'),
        role: 'coordinator',
        status: 'idle',
        currentTask: t('collaboration.status.waiting'),
        connections: ['specialist1', 'specialist2']
    },
    {
        id: 'specialist1',
        name: t('collaboration.agents.specialist1'),
        role: 'specialist',
        status: 'idle',
        currentTask: t('collaboration.status.waiting'),
        connections: ['coordinator', 'evaluator']
    },
    {
        id: 'specialist2',
        name: t('collaboration.agents.specialist2'),
        role: 'specialist',
        status: 'idle',
        currentTask: t('collaboration.status.waiting'),
        connections: ['coordinator', 'evaluator']
    }
]);

// Progress Metrics
const progressMetrics = ref([
    {
        name: t('collaboration.metrics.completion'),
        value: 0,
        description: t('collaboration.metrics.completionDesc')
    },
    {
        name: t('collaboration.metrics.efficiency'),
        value: 0,
        description: t('collaboration.metrics.efficiencyDesc')
    },
    {
        name: t('collaboration.metrics.quality'),
        value: 0,
        description: t('collaboration.metrics.qualityDesc')
    }
]);

// Methods
const getAgentStatus = (agent) => {
    const statusClasses = {
        idle: 'surface-card',
        active: 'surface-card border-primary-500 border-2',
        communicating: 'surface-card border-orange-500 border-2',
        processing: 'surface-card border-blue-500 border-2',
        completed: 'surface-card border-green-500 border-2'
    };
    return statusClasses[agent.status] || statusClasses.idle;
};

const getAgentIcon = (role) => {
    const icons = {
        coordinator: 'pi pi-star text-primary',
        specialist: 'pi pi-cog text-orange',
        evaluator: 'pi pi-check-circle text-green'
    };
    return icons[role] || 'pi pi-user';
};

const getStatusSeverity = (status) => {
    const severities = {
        idle: 'secondary',
        active: 'primary',
        communicating: 'warning',
        processing: 'info',
        completed: 'success'
    };
    return severities[status] || 'secondary';
};

const getCommunicationIcon = (type) => {
    const icons = {
        request: 'pi pi-send text-primary',
        response: 'pi pi-reply text-success',
        broadcast: 'pi pi-megaphone text-warning',
        update: 'pi pi-sync text-info'
    };
    return icons[type] || 'pi pi-comment';
};

const getProgressClass = (value) => {
    if (value >= 80) return 'success';
    if (value >= 50) return 'info';
    return 'warning';
};

const isConnectionActive = (from, to) => {
    return communications.value.some(comm => 
        (comm.from === from && comm.to === to) || (comm.from === to && comm.to === from)
    );
};

const startSimulation = async () => {
    if (!taskInput.value.trim()) return;

    isRunning.value = true;
    resetSimulation(false);

    // Simulate collaboration workflow
    await simulateWorkflow();
};

const simulateWorkflow = async () => {
    // Simulate coordinator assigning tasks
    await updateAgentStatus('coordinator', 'active', t('collaboration.tasks.assigning'));
    addCommunication('coordinator', 'specialist1', 'request', t('collaboration.messages.taskAssignment'));
    
    // Simulate specialist1 working
    await updateAgentStatus('specialist1', 'processing', t('collaboration.tasks.processing'));
    await simulateProgress();
    
    // Simulate specialist2 assisting
    await updateAgentStatus('specialist2', 'active', t('collaboration.tasks.supporting'));
    addCommunication('specialist2', 'specialist1', 'update', t('collaboration.messages.assistance'));
    
    // Simulate completion
    await updateAgentStatus('specialist1', 'completed', t('collaboration.tasks.completed'));
    addCommunication('specialist1', 'coordinator', 'response', t('collaboration.messages.completion'));
    
    isRunning.value = false;
};

const updateAgentStatus = async (agentId, status, task) => {
    const agent = agents.value.find(a => a.id === agentId);
    if (agent) {
        agent.status = status;
        agent.currentTask = task;
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
};

const simulateProgress = async () => {
    for (let metric of progressMetrics.value) {
        for (let i = 0; i <= 100; i += 20) {
            await new Promise(resolve => setTimeout(resolve, 500));
            metric.value = i;
        }
    }
};

const addCommunication = (from, to, type, message) => {
    communications.value.push({
        from,
        to,
        type,
        message,
        timestamp: new Date().toLocaleTimeString(),
        important: type === 'request'
    });
};

const resetSimulation = (resetTask = true) => {
    if (resetTask) taskInput.value = '';
    communications.value = [];
    agents.value.forEach(agent => {
        agent.status = 'idle';
        agent.currentTask = t('collaboration.status.waiting');
    });
    progressMetrics.value.forEach(metric => {
        metric.value = 0;
    });
};
</script>

<style scoped>
.agent-collaboration {
    padding: 1rem;
}

.agent-node {
    transition: all 0.3s ease;
}

.connection-line {
    height: 2px;
    background: var(--surface-border);
    margin: 1rem 0;
    transition: all 0.3s ease;
}

.connection-line.active {
    background: var(--primary-color);
    height: 3px;
}

.message-card {
    transition: all 0.3s ease;
}
</style>
