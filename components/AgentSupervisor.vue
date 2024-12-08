<template>
    <div class="agent-supervisor">
        <div class="grid">
            <!-- Main Workspace -->
            <div class="col-12 lg:col-8">
                <div class="card">
                    <!-- Header -->
                    <div class="flex justify-content-between align-items-center mb-4">
                        <h2 class="text-xl font-bold m-0">{{ t('supervisor.title') }}</h2>
                        <div class="flex gap-2">
                            <Button :label="t('supervisor.actions.reset')" icon="pi pi-refresh" severity="secondary" @click="resetSimulation" />
                            <Button :label="t('supervisor.actions.start')" icon="pi pi-play" severity="primary" @click="startSimulation" :loading="isRunning" />
                        </div>
                    </div>

                    <!-- Task Input -->
                    <div class="mb-4">
                        <span class="p-float-label">
                            <Textarea
                                v-model="taskInput"
                                :placeholder="t('supervisor.input.placeholder')"
                                rows="3"
                                class="w-full"
                                :disabled="isRunning"
                            />
                            <label>{{ t('supervisor.input.label') }}</label>
                        </span>
                    </div>

                    <!-- Supervision Dashboard -->
                    <div class="supervision-dashboard mb-4">
                        <h3 class="text-lg font-semibold mb-3">{{ t('supervisor.dashboard.title') }}</h3>
                        <div class="grid">
                            <!-- Supervisor Status -->
                            <div class="col-12">
                                <div :class="['supervisor-status p-3 border-round', getSupervisorStatus()]">
                                    <div class="flex align-items-center gap-2 mb-2">
                                        <i class="pi pi-shield text-xl"></i>
                                        <span class="font-semibold">{{ t('supervisor.dashboard.supervisor') }}</span>
                                        <Tag :value="currentPhase" severity="primary" class="ml-auto" />
                                    </div>
                                    <p class="m-0 line-height-3">{{ supervisorMessage }}</p>
                                </div>
                            </div>

                            <!-- Agent Grid -->
                            <div v-for="(agent, index) in agents" :key="index" class="col-12 md:col-6 lg:col-4">
                                <div :class="['agent-card p-3 border-round', getAgentStatus(agent)]">
                                    <div class="flex align-items-center gap-2 mb-2">
                                        <i class="pi pi-user text-xl"></i>
                                        <span class="font-semibold">{{ agent.name }}</span>
                                        <Tag :value="agent.status" :severity="getStatusSeverity(agent.status)" class="ml-auto" />
                                    </div>
                                    <p class="m-0 mb-2">{{ agent.currentTask }}</p>
                                    <ProgressBar v-if="agent.progress" :value="agent.progress" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Supervision Log -->
                    <div class="supervision-log surface-ground p-3 border-round" style="height: 300px; overflow-y: auto;">
                        <h3 class="text-lg font-semibold mb-3">{{ t('supervisor.log.title') }}</h3>
                        <Timeline :value="supervisionLog">
                            <template #content="slotProps">
                                <div :class="['log-entry p-3 border-round surface-card', {'border-primary': slotProps.item.important}]">
                                    <div class="flex align-items-center gap-2 mb-2">
                                        <i :class="getLogIcon(slotProps.item.type)"></i>
                                        <span class="font-semibold">{{ slotProps.item.actor }}</span>
                                        <small class="text-500 ml-auto">{{ slotProps.item.timestamp }}</small>
                                    </div>
                                    <div class="log-content">{{ slotProps.item.message }}</div>
                                    <div v-if="slotProps.item.feedback" class="mt-2 text-500">
                                        {{ t('supervisor.log.feedback') }}: {{ slotProps.item.feedback }}
                                    </div>
                                </div>
                            </template>
                        </Timeline>
                    </div>
                </div>
            </div>

            <!-- Configuration Panel -->
            <div class="col-12 lg:col-4">
                <div class="card">
                    <h3 class="text-xl font-bold mb-4">{{ t('supervisor.config.title') }}</h3>

                    <!-- Supervision Style -->
                    <div class="mb-4">
                        <h4 class="font-medium mb-2">{{ t('supervisor.config.style.title') }}</h4>
                        <div class="field mb-2">
                            <Dropdown
                                v-model="supervisionConfig.style"
                                :options="supervisionStyles"
                                optionLabel="name"
                                class="w-full"
                            />
                        </div>
                    </div>

                    <!-- Intervention Settings -->
                    <div class="mb-4">
                        <h4 class="font-medium mb-2">{{ t('supervisor.config.intervention.title') }}</h4>
                        <div class="field-checkbox mb-2">
                            <Checkbox v-model="supervisionConfig.autoIntervention" :binary="true" />
                            <label class="ml-2">{{ t('supervisor.config.intervention.auto') }}</label>
                        </div>
                        <div class="field mb-2">
                            <label class="block mb-1">{{ t('supervisor.config.intervention.threshold') }}</label>
                            <Slider v-model="supervisionConfig.interventionThreshold" :min="0" :max="100" :step="10" />
                            <small class="text-500">{{ supervisionConfig.interventionThreshold }}%</small>
                        </div>
                    </div>

                    <!-- Agent Management -->
                    <div class="mb-4">
                        <h4 class="font-medium mb-2">{{ t('supervisor.config.agents.title') }}</h4>
                        <div v-for="(agent, index) in agentTypes" :key="index" class="field-checkbox mb-2">
                            <Checkbox v-model="agent.enabled" :binary="true" />
                            <label class="ml-2">{{ agent.name }}</label>
                            <small class="block text-500 ml-4">{{ agent.description }}</small>
                        </div>
                    </div>

                    <!-- Performance Metrics -->
                    <div class="mb-4">
                        <h4 class="font-medium mb-2">{{ t('supervisor.config.metrics.title') }}</h4>
                        <div v-for="(metric, index) in performanceMetrics" :key="index" class="field-checkbox mb-2">
                            <Checkbox v-model="metric.enabled" :binary="true" />
                            <label class="ml-2">{{ metric.name }}</label>
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
const currentPhase = ref(t('supervisor.phases.idle'));
const supervisorMessage = ref(t('supervisor.messages.waiting'));
const supervisionLog = ref([]);

// Supervision Configuration
const supervisionStyles = ref([
    { name: t('supervisor.styles.proactive'), value: 'proactive' },
    { name: t('supervisor.styles.reactive'), value: 'reactive' },
    { name: t('supervisor.styles.balanced'), value: 'balanced' }
]);

const supervisionConfig = ref({
    style: supervisionStyles.value[2],
    autoIntervention: true,
    interventionThreshold: 70
});

// Agent Types
const agentTypes = ref([
    {
        name: t('supervisor.agentTypes.executor'),
        description: t('supervisor.agentTypes.executorDesc'),
        enabled: true
    },
    {
        name: t('supervisor.agentTypes.validator'),
        description: t('supervisor.agentTypes.validatorDesc'),
        enabled: true
    },
    {
        name: t('supervisor.agentTypes.optimizer'),
        description: t('supervisor.agentTypes.optimizerDesc'),
        enabled: true
    }
]);

// Performance Metrics
const performanceMetrics = ref([
    { name: t('supervisor.metrics.accuracy'), enabled: true },
    { name: t('supervisor.metrics.efficiency'), enabled: true },
    { name: t('supervisor.metrics.coordination'), enabled: true }
]);

// Active Agents
const agents = ref([
    {
        name: t('supervisor.agents.executor'),
        status: 'idle',
        currentTask: t('supervisor.status.waiting'),
        progress: 0
    },
    {
        name: t('supervisor.agents.validator'),
        status: 'idle',
        currentTask: t('supervisor.status.waiting'),
        progress: 0
    },
    {
        name: t('supervisor.agents.optimizer'),
        status: 'idle',
        currentTask: t('supervisor.status.waiting'),
        progress: 0
    }
]);

// Methods
const getSupervisorStatus = () => {
    if (!isRunning.value) return 'surface-card';
    return 'surface-card border-primary-500 border-2';
};

const getAgentStatus = (agent) => {
    const statusClasses = {
        idle: 'surface-card',
        working: 'surface-card border-blue-500 border-2',
        reviewing: 'surface-card border-orange-500 border-2',
        completed: 'surface-card border-green-500 border-2',
        error: 'surface-card border-red-500 border-2'
    };
    return statusClasses[agent.status] || statusClasses.idle;
};

const getStatusSeverity = (status) => {
    const severities = {
        idle: 'secondary',
        working: 'info',
        reviewing: 'warning',
        completed: 'success',
        error: 'danger'
    };
    return severities[status] || 'secondary';
};

const getLogIcon = (type) => {
    const icons = {
        assignment: 'pi pi-send text-primary',
        intervention: 'pi pi-exclamation-circle text-warning',
        completion: 'pi pi-check-circle text-success',
        error: 'pi pi-times-circle text-danger'
    };
    return icons[type] || 'pi pi-info-circle';
};

const startSimulation = async () => {
    if (!taskInput.value.trim()) return;

    isRunning.value = true;
    resetAgents();
    supervisionLog.value = [];
    currentPhase.value = t('supervisor.phases.planning');
    supervisorMessage.value = t('supervisor.messages.analyzing');

    // Simulate supervision workflow
    await simulateWorkflow();
};

const resetSimulation = () => {
    taskInput.value = '';
    isRunning.value = false;
    resetAgents();
    supervisionLog.value = [];
    currentPhase.value = t('supervisor.phases.idle');
    supervisorMessage.value = t('supervisor.messages.waiting');
};

const resetAgents = () => {
    agents.value.forEach(agent => {
        agent.status = 'idle';
        agent.currentTask = t('supervisor.status.waiting');
        agent.progress = 0;
    });
};

const simulateWorkflow = async () => {
    // Add initial log entry
    addLogEntry('supervisor', 'assignment', t('supervisor.log.taskReceived'));

    // Simulate executor agent work
    await simulateAgentWork(0, 'working', t('supervisor.tasks.executing'));
    
    // Simulate validator agent work
    await simulateAgentWork(1, 'reviewing', t('supervisor.tasks.validating'));
    
    // Simulate optimizer agent work
    await simulateAgentWork(2, 'working', t('supervisor.tasks.optimizing'));

    // Complete simulation
    currentPhase.value = t('supervisor.phases.completed');
    supervisorMessage.value = t('supervisor.messages.completed');
    isRunning.value = false;
};

const simulateAgentWork = async (agentIndex, status, task) => {
    const agent = agents.value[agentIndex];
    agent.status = status;
    agent.currentTask = task;

    // Simulate progress
    for (let i = 0; i <= 100; i += 20) {
        await new Promise(resolve => setTimeout(resolve, 500));
        agent.progress = i;
    }

    agent.status = 'completed';
    addLogEntry(agent.name, 'completion', `${task} - ${t('supervisor.log.completed')}`);
};

const addLogEntry = (actor, type, message, important = false) => {
    supervisionLog.value.push({
        actor,
        type,
        message,
        important,
        timestamp: new Date().toLocaleTimeString()
    });
};
</script>

<style scoped>
.agent-supervisor {
    padding: 1rem;
}

.agent-card {
    transition: all 0.3s ease;
}

.supervisor-status {
    transition: all 0.3s ease;
}

.log-entry {
    transition: all 0.3s ease;
}
</style>
