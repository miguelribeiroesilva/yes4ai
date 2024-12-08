<template>
    <div class="rewoo-simulation">
        <div class="grid">
            <!-- Main Simulation Area -->
            <div class="col-12 lg:col-8">
                <div class="card">
                    <div class="flex justify-content-between align-items-center mb-4">
                        <h2 class="text-xl font-bold m-0">{{ t('rewoo.title') }}</h2>
                        <div class="flex gap-2">
                            <Button :label="t('rewoo.actions.reset')" icon="pi pi-refresh" severity="secondary" @click="resetSimulation" />
                            <Button :label="t('rewoo.actions.run')" severity="primary" @click="runSimulation" :loading="isRunning" />
                        </div>
                    </div>

                    <!-- Simulation Steps Display -->
                    <div class="simulation-steps surface-ground p-3 border-round" style="height: 400px; overflow-y: auto;">
                        <div v-for="(step, index) in simulationSteps" :key="index" class="mb-3">
                            <div class="surface-card p-3 border-round">
                                <div class="flex align-items-center gap-2 mb-2">
                                    <i :class="getStepIcon(step.type)" class="text-primary"></i>
                                    <span class="font-semibold">{{ getStepTitle(step.type) }}</span>
                                </div>
                                <div class="step-content">
                                    <pre class="whitespace-pre-wrap">{{ step.content }}</pre>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Input Area -->
                    <div class="mt-3">
                        <span class="p-float-label">
                            <Textarea
                                v-model="userInput"
                                :placeholder="t('rewoo.input.placeholder')"
                                rows="3"
                                class="w-full"
                                :disabled="isRunning"
                            />
                            <label>{{ t('rewoo.input.label') }}</label>
                        </span>
                    </div>
                </div>
            </div>

            <!-- Configuration Panel -->
            <div class="col-12 lg:col-4">
                <div class="card">
                    <h3 class="text-xl font-bold mb-4">{{ t('rewoo.config.title') }}</h3>

                    <!-- Reasoning Steps -->
                    <div class="mb-4">
                        <h4 class="font-medium mb-2">{{ t('rewoo.config.steps') }}</h4>
                        <div v-for="(step, index) in reasoningSteps" :key="index" class="field-checkbox mb-2">
                            <Checkbox :id="'step' + index" v-model="step.enabled" :binary="true" />
                            <label :for="'step' + index" class="ml-2">{{ step.label }}</label>
                        </div>
                    </div>

                    <!-- Model Configuration -->
                    <div class="mb-4">
                        <h4 class="font-medium mb-2">{{ t('rewoo.config.model') }}</h4>
                        <div class="field mb-2">
                            <label class="block mb-1">{{ t('rewoo.config.temperature') }}</label>
                            <Slider v-model="modelConfig.temperature" :min="0" :max="1" :step="0.1" />
                            <small class="text-500">{{ modelConfig.temperature }}</small>
                        </div>
                        <div class="field">
                            <label class="block mb-1">{{ t('rewoo.config.maxTokens') }}</label>
                            <InputNumber v-model="modelConfig.maxTokens" :min="1" :max="2000" class="w-full" />
                        </div>
                    </div>

                    <!-- Output Format -->
                    <div class="mb-4">
                        <h4 class="font-medium mb-2">{{ t('rewoo.config.output') }}</h4>
                        <Dropdown
                            v-model="selectedOutputFormat"
                            :options="outputFormats"
                            optionLabel="name"
                            class="w-full"
                        />
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
const userInput = ref('');
const simulationSteps = ref([]);

// Model Configuration
const modelConfig = ref({
    temperature: 0.7,
    maxTokens: 1000
});

// Reasoning Steps
const reasoningSteps = ref([
    { label: t('rewoo.steps.parse'), enabled: true, type: 'parse' },
    { label: t('rewoo.steps.reason'), enabled: true, type: 'reason' },
    { label: t('rewoo.steps.validate'), enabled: true, type: 'validate' },
    { label: t('rewoo.steps.generate'), enabled: true, type: 'generate' }
]);

// Output Formats
const outputFormats = ref([
    { name: 'JSON', id: 'json' },
    { name: 'YAML', id: 'yaml' },
    { name: 'Plain Text', id: 'text' }
]);
const selectedOutputFormat = ref(outputFormats.value[0]);

// Methods
const getStepIcon = (type) => {
    const icons = {
        parse: 'pi pi-code',
        reason: 'pi pi-sitemap',
        validate: 'pi pi-check-circle',
        generate: 'pi pi-file-export'
    };
    return icons[type] || 'pi pi-circle';
};

const getStepTitle = (type) => {
    return t(`rewoo.steps.${type}`);
};

const runSimulation = async () => {
    if (!userInput.value.trim()) return;

    isRunning.value = true;
    simulationSteps.value = [];

    // Simulate the ReWOO process
    const enabledSteps = reasoningSteps.value.filter(step => step.enabled);
    
    for (const step of enabledSteps) {
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        simulationSteps.value.push({
            type: step.type,
            content: `Simulated ${step.label} output for input: ${userInput.value}\nUsing temperature: ${modelConfig.temperature}`
        });
    }

    isRunning.value = false;
};

const resetSimulation = () => {
    userInput.value = '';
    simulationSteps.value = [];
    isRunning.value = false;
};
</script>

<style scoped>
.rewoo-simulation {
    padding: 1rem;
}

.step-content {
    font-family: monospace;
    font-size: 0.9em;
    background: var(--surface-ground);
    padding: 0.5rem;
    border-radius: 4px;
}
</style>
