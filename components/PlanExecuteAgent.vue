<template>
    <div class="plan-execute-agent">
        <div class="grid">
            <!-- Main Workspace -->
            <div class="col-12 lg:col-8">
                <div class="card">
                    <!-- Header -->
                    <div class="flex justify-content-between align-items-center mb-4">
                        <h2 class="text-xl font-bold m-0">{{ t('planExecute.title') }}</h2>
                        <div class="flex gap-2">
                            <Button :label="t('planExecute.actions.reset')" icon="pi pi-refresh" severity="secondary" @click="resetWorkspace" />
                            <Button :label="t('planExecute.actions.execute')" icon="pi pi-play" severity="primary" @click="startExecution" :loading="isExecuting" />
                        </div>
                    </div>

                    <!-- Task Input -->
                    <div class="mb-4">
                        <span class="p-float-label">
                            <Textarea
                                v-model="taskInput"
                                :placeholder="t('planExecute.input.placeholder')"
                                rows="3"
                                class="w-full"
                                :disabled="isExecuting"
                            />
                            <label>{{ t('planExecute.input.label') }}</label>
                        </span>
                    </div>

                    <!-- Execution Timeline -->
                    <div class="execution-timeline surface-ground p-3 border-round mb-4" style="height: 400px; overflow-y: auto;">
                        <Timeline :value="executionSteps" class="customized-timeline">
                            <template #marker="slotProps">
                                <span :class="getStepIcon(slotProps.item.status)"></span>
                            </template>
                            <template #content="slotProps">
                                <div :class="['timeline-item p-3 border-round', getStepClass(slotProps.item.status)]">
                                    <div class="flex justify-content-between align-items-center mb-2">
                                        <span class="font-semibold">{{ slotProps.item.type }}</span>
                                        <Tag :value="slotProps.item.status" :severity="getStepSeverity(slotProps.item.status)" />
                                    </div>
                                    <div class="step-content">
                                        <div v-if="slotProps.item.type === 'plan'" class="mb-2">
                                            <ul class="m-0 pl-3">
                                                <li v-for="(step, index) in slotProps.item.content.steps" :key="index" class="mb-2">
                                                    {{ step }}
                                                </li>
                                            </ul>
                                        </div>
                                        <div v-else>
                                            {{ slotProps.item.content }}
                                        </div>
                                    </div>
                                    <small v-if="slotProps.item.result" class="block mt-2 text-500">
                                        {{ t('planExecute.result') }}: {{ slotProps.item.result }}
                                    </small>
                                </div>
                            </template>
                        </Timeline>
                    </div>

                    <!-- Current Status -->
                    <div v-if="currentStatus" class="status-panel p-3 border-round surface-ground">
                        <h3 class="text-lg font-semibold mb-2">{{ t('planExecute.status.title') }}</h3>
                        <div class="grid">
                            <div class="col-6">
                                <div class="text-500 mb-1">{{ t('planExecute.status.step') }}</div>
                                <div class="font-medium">{{ currentStatus.currentStep }}/{{ currentStatus.totalSteps }}</div>
                            </div>
                            <div class="col-6">
                                <div class="text-500 mb-1">{{ t('planExecute.status.phase') }}</div>
                                <div class="font-medium">{{ currentStatus.phase }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Configuration Panel -->
            <div class="col-12 lg:col-4">
                <div class="card">
                    <h3 class="text-xl font-bold mb-4">{{ t('planExecute.config.title') }}</h3>

                    <!-- Planning Settings -->
                    <div class="mb-4">
                        <h4 class="font-medium mb-2">{{ t('planExecute.config.planning.title') }}</h4>
                        <div class="field mb-2">
                            <label class="block mb-1">{{ t('planExecute.config.planning.maxSteps') }}</label>
                            <InputNumber v-model="planningConfig.maxSteps" :min="1" :max="10" class="w-full" />
                        </div>
                        <div class="field">
                            <label class="block mb-1">{{ t('planExecute.config.planning.detail') }}</label>
                            <Dropdown
                                v-model="planningConfig.detailLevel"
                                :options="detailLevels"
                                optionLabel="name"
                                class="w-full"
                            />
                        </div>
                    </div>

                    <!-- Execution Settings -->
                    <div class="mb-4">
                        <h4 class="font-medium mb-2">{{ t('planExecute.config.execution.title') }}</h4>
                        <div class="field-checkbox mb-2">
                            <Checkbox v-model="executionConfig.stopOnError" :binary="true" />
                            <label class="ml-2">{{ t('planExecute.config.execution.stopOnError') }}</label>
                        </div>
                        <div class="field-checkbox mb-2">
                            <Checkbox v-model="executionConfig.validateResults" :binary="true" />
                            <label class="ml-2">{{ t('planExecute.config.execution.validate') }}</label>
                        </div>
                    </div>

                    <!-- Tools -->
                    <div class="mb-4">
                        <h4 class="font-medium mb-2">{{ t('planExecute.config.tools.title') }}</h4>
                        <div v-for="(tool, index) in availableTools" :key="index" class="field-checkbox mb-2">
                            <Checkbox v-model="tool.enabled" :binary="true" />
                            <label class="ml-2">{{ tool.name }}</label>
                            <small class="block text-500 ml-4">{{ tool.description }}</small>
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
const isExecuting = ref(false);
const taskInput = ref('');
const executionSteps = ref([]);
const currentStatus = ref(null);

// Planning Configuration
const detailLevels = ref([
    { name: t('planExecute.detailLevels.high'), value: 'high' },
    { name: t('planExecute.detailLevels.medium'), value: 'medium' },
    { name: t('planExecute.detailLevels.low'), value: 'low' }
]);

const planningConfig = ref({
    maxSteps: 5,
    detailLevel: detailLevels.value[1]
});

// Execution Configuration
const executionConfig = ref({
    stopOnError: true,
    validateResults: true
});

// Available Tools
const availableTools = ref([
    {
        name: t('planExecute.tools.search'),
        description: t('planExecute.tools.searchDesc'),
        enabled: true
    },
    {
        name: t('planExecute.tools.calculate'),
        description: t('planExecute.tools.calculateDesc'),
        enabled: true
    },
    {
        name: t('planExecute.tools.transform'),
        description: t('planExecute.tools.transformDesc'),
        enabled: true
    }
]);

// Methods
const getStepIcon = (status) => {
    const icons = {
        pending: 'pi pi-clock text-500',
        running: 'pi pi-spin pi-spinner text-primary',
        completed: 'pi pi-check text-success',
        error: 'pi pi-times text-danger'
    };
    return icons[status] || icons.pending;
};

const getStepClass = (status) => {
    const classes = {
        pending: 'surface-card',
        running: 'surface-card border-primary-500 border-2',
        completed: 'surface-card border-green-500 border-2',
        error: 'surface-card border-red-500 border-2'
    };
    return classes[status] || classes.pending;
};

const getStepSeverity = (status) => {
    const severities = {
        pending: 'info',
        running: 'primary',
        completed: 'success',
        error: 'danger'
    };
    return severities[status] || 'info';
};

const startExecution = async () => {
    if (!taskInput.value.trim()) return;

    isExecuting.value = true;
    executionSteps.value = [];
    currentStatus.value = {
        currentStep: 0,
        totalSteps: 0,
        phase: t('planExecute.phases.planning')
    };

    // Simulate planning phase
    await new Promise(resolve => setTimeout(resolve, 1500));
    const plan = {
        type: 'plan',
        status: 'completed',
        content: {
            steps: [
                'Analyze input requirements',
                'Gather necessary data',
                'Process information',
                'Generate results'
            ]
        }
    };
    executionSteps.value.push(plan);
    currentStatus.value.totalSteps = plan.content.steps.length;

    // Simulate execution of each step
    for (let i = 0; i < plan.content.steps.length; i++) {
        currentStatus.value.currentStep = i + 1;
        currentStatus.value.phase = t('planExecute.phases.executing');

        const step = {
            type: 'execution',
            status: 'running',
            content: plan.content.steps[i]
        };
        executionSteps.value.push(step);

        // Simulate step execution
        await new Promise(resolve => setTimeout(resolve, 2000));
        step.status = 'completed';
        step.result = `Completed step ${i + 1} successfully`;
    }

    currentStatus.value.phase = t('planExecute.phases.completed');
    isExecuting.value = false;
};

const resetWorkspace = () => {
    taskInput.value = '';
    executionSteps.value = [];
    currentStatus.value = null;
    isExecuting.value = false;
};
</script>

<style scoped>
.plan-execute-agent {
    padding: 1rem;
}

.step-content {
    white-space: pre-wrap;
    word-break: break-word;
}

:deep(.customized-timeline) {
    .p-timeline-event-marker {
        width: 1.5rem;
        height: 1.5rem;
        line-height: 1.5rem;
        text-align: center;
    }
}

.timeline-item {
    transition: all 0.3s ease;
}
</style>
