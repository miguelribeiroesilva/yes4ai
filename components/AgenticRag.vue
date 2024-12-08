<template>
    <div class="agentic-rag">
        <div class="grid">
            <!-- Main Query Panel -->
            <div class="col-12 lg:col-8">
                <div class="card">
                    <!-- Query Input -->
                    <div class="mb-4">
                        <h2 class="text-xl font-bold mb-3">{{ t('agenticRag.query.title') }}</h2>
                        <span class="p-float-label">
                            <Textarea
                                v-model="queryInput"
                                :placeholder="t('agenticRag.query.placeholder')"
                                rows="3"
                                class="w-full"
                                :disabled="isProcessing"
                            />
                            <label>{{ t('agenticRag.query.label') }}</label>
                        </span>
                        <div class="flex justify-content-end gap-2 mt-2">
                            <Button :label="t('agenticRag.actions.reset')" icon="pi pi-refresh" severity="secondary" @click="resetProcess" :disabled="isProcessing" />
                            <Button :label="t('agenticRag.actions.search')" icon="pi pi-search" severity="primary" @click="startSearch" :loading="isProcessing" />
                        </div>
                    </div>

                    <!-- Retrieved Documents -->
                    <div v-if="agentState.documents.length" class="documents-panel mb-4">
                        <h3 class="text-lg font-semibold mb-3">{{ t('agenticRag.documents.title') }}</h3>
                        <div v-for="doc in agentState.documents" :key="doc.id" class="doc-card p-3 surface-ground border-round mb-2">
                            <div class="flex align-items-center mb-2">
                                <i class="pi pi-file-pdf text-primary mr-2"></i>
                                <span class="font-medium">{{ doc.source }}</span>
                                <Tag :value="`${(doc.metadata.relevance * 100).toFixed(1)}%`" severity="info" class="ml-auto" />
                            </div>
                            <p class="m-0 text-600 mb-2">{{ doc.content }}</p>
                            <div v-if="doc.metadata.critique" class="critique-section p-2 surface-card border-round mt-2">
                                <div class="flex align-items-center mb-1">
                                    <i class="pi pi-comment text-orange-500 mr-2"></i>
                                    <span class="font-medium">{{ t('agenticRag.documents.critique') }}</span>
                                </div>
                                <p class="m-0 text-600">{{ doc.metadata.critique }}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Document Critiques -->
                    <div v-if="agentState.critiques.length" class="critiques-panel mb-4">
                        <h3 class="text-lg font-semibold mb-3">{{ t('agenticRag.critiques.title') }}</h3>
                        <div v-for="critique in agentState.critiques" :key="critique.id" class="critique-card p-3 surface-ground border-round mb-2">
                            <div class="flex align-items-center mb-2">
                                <i class="pi pi-exclamation-circle text-orange-500 mr-2"></i>
                                <span class="font-medium">{{ t('agenticRag.critiques.observation') }}</span>
                                <Tag :value="critique.severity" :severity="getCritiqueSeverity(critique.severity)" class="ml-auto" />
                            </div>
                            <p class="m-0 text-600 mb-2">{{ critique.content }}</p>
                            <div v-if="critique.suggestion" class="suggestion-section p-2 surface-card border-round mt-2">
                                <div class="flex align-items-center mb-1">
                                    <i class="pi pi-lightbulb text-yellow-500 mr-2"></i>
                                    <span class="font-medium">{{ t('agenticRag.critiques.suggestion') }}</span>
                                </div>
                                <p class="m-0 text-600">{{ critique.suggestion }}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Generated Answer -->
                    <div v-if="agentState.answer" class="answer-panel surface-ground p-3 border-round">
                        <h3 class="text-lg font-semibold mb-3">{{ t('agenticRag.answer.title') }}</h3>
                        <div class="answer p-3 surface-card border-round">
                            <div class="flex align-items-center mb-2">
                                <i class="pi pi-check-circle text-success mr-2"></i>
                                <span class="font-semibold">{{ t('agenticRag.answer.generated') }}</span>
                                <Tag :value="getConfidenceLevel(agentState.answer.confidence)" :severity="getConfidenceSeverity(agentState.answer.confidence)" class="ml-auto" />
                            </div>
                            <p class="m-0 line-height-3 mb-3">{{ agentState.answer.text }}</p>

                            <!-- Citations -->
                            <div class="citations p-2 surface-ground border-round mb-3">
                                <div class="text-sm font-medium mb-1">{{ t('agenticRag.answer.citations') }}:</div>
                                <div class="flex flex-wrap gap-2">
                                    <Tag v-for="citation in agentState.answer.citations"
                                         :key="citation"
                                         :value="getDocumentLabel(citation)"
                                         severity="info" />
                                </div>
                            </div>

                            <!-- Reasoning -->
                            <div class="reasoning p-2 surface-ground border-round mb-3">
                                <div class="text-sm font-medium mb-1">{{ t('agenticRag.answer.reasoning') }}:</div>
                                <p class="m-0 text-600">{{ agentState.answer.reasoning }}</p>
                            </div>

                            <!-- Improvements -->
                            <div v-if="agentState.answer.improvements?.length" class="improvements p-2 surface-ground border-round">
                                <div class="text-sm font-medium mb-1">{{ t('agenticRag.answer.improvements') }}:</div>
                                <ul class="m-0 list-none p-0">
                                    <li v-for="(improvement, index) in agentState.answer.improvements"
                                        :key="index"
                                        class="flex align-items-center mb-1">
                                        <i class="pi pi-arrow-right text-primary mr-2"></i>
                                        <span class="text-600">{{ improvement }}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Status Panel -->
            <div class="col-12 lg:col-4">
                <div class="card">
                    <h3 class="text-xl font-bold mb-4">{{ t('agenticRag.status.title') }}</h3>

                    <!-- Process Status -->
                    <div class="mb-4">
                        <div class="status-card p-3 surface-ground border-round">
                            <div class="flex align-items-center mb-2">
                                <i :class="getStatusIcon(agentState.status)" class="mr-2"></i>
                                <span class="font-medium">{{ getStatusText(agentState.status) }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Process Timeline -->
                    <div class="process-timeline mb-4">
                        <Timeline :value="processSteps" class="w-full">
                            <template #content="slotProps">
                                <div :class="['timeline-item p-3 surface-card border-round', {'border-primary': isCurrentStep(slotProps.item.status)}]">
                                    <div class="flex align-items-center">
                                        <i :class="getStepIcon(slotProps.item.status)" class="mr-2"></i>
                                        <span class="font-medium">{{ slotProps.item.label }}</span>
                                        <Tag :value="getStepStatus(slotProps.item.status)" :severity="getStepSeverity(slotProps.item.status)" class="ml-auto" />
                                    </div>
                                    <p class="m-0 mt-2 text-500">{{ slotProps.item.description }}</p>
                                </div>
                            </template>
                        </Timeline>
                    </div>

                    <!-- Error Display -->
                    <div v-if="agentState.error" class="mb-4">
                        <Message severity="error">{{ agentState.error }}</Message>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAgenticRag } from '~/composables/useAgenticRag';

const { t } = useI18n();
const { agentState, isProcessing, processQuery } = useAgenticRag();

// Local state
const queryInput = ref('');

// Computed
const processSteps = computed(() => [
    {
        status: 'retrieving',
        label: t('agenticRag.steps.retrieving'),
        description: t('agenticRag.steps.retrievingDesc')
    },
    {
        status: 'critiquing',
        label: t('agenticRag.steps.critiquing'),
        description: t('agenticRag.steps.critiquingDesc')
    },
    {
        status: 'generating',
        label: t('agenticRag.steps.generating'),
        description: t('agenticRag.steps.generatingDesc')
    }
]);

// Methods
const startSearch = async () => {
    if (!queryInput.value.trim()) return;
    await processQuery(queryInput.value.trim());
};

const resetProcess = () => {
    queryInput.value = '';
    Object.assign(agentState, {
        status: 'idle',
        query: '',
        documents: [],
        critiques: [],
        answer: null,
        error: null
    });
};

const getStatusIcon = (status) => {
    const icons = {
        idle: 'pi pi-clock text-500',
        retrieving: 'pi pi-search text-blue-500',
        critiquing: 'pi pi-comments text-orange-500',
        generating: 'pi pi-cog text-green-500',
        complete: 'pi pi-check-circle text-success',
        error: 'pi pi-times-circle text-danger'
    };
    return icons[status] || 'pi pi-circle-fill';
};

const getStatusText = (status) => {
    return t(`agenticRag.status.${status}`);
};

const getStepIcon = (status) => {
    const icons = {
        retrieving: 'pi pi-search text-blue-500',
        critiquing: 'pi pi-comments text-orange-500',
        generating: 'pi pi-cog text-green-500'
    };
    return icons[status] || 'pi pi-circle-fill';
};

const getStepStatus = (status) => {
    if (status === agentState.status) return t('agenticRag.steps.inProgress');
    if (getStepOrder(status) < getStepOrder(agentState.status)) return t('agenticRag.steps.completed');
    return t('agenticRag.steps.pending');
};

const getStepSeverity = (status) => {
    if (status === agentState.status) return 'warning';
    if (getStepOrder(status) < getStepOrder(agentState.status)) return 'success';
    return 'secondary';
};

const getStepOrder = (status) => {
    const order = {
        idle: 0,
        retrieving: 1,
        critiquing: 2,
        generating: 3,
        complete: 4,
        error: 5
    };
    return order[status] || 0;
};

const isCurrentStep = (status) => {
    return status === agentState.status;
};

const getConfidenceLevel = (score) => {
    if (score >= 0.9) return t('agenticRag.confidence.high');
    if (score >= 0.7) return t('agenticRag.confidence.medium');
    return t('agenticRag.confidence.low');
};

const getConfidenceSeverity = (score) => {
    if (score >= 0.9) return 'success';
    if (score >= 0.7) return 'warning';
    return 'danger';
};

const getCritiqueSeverity = (severity) => {
    const severities = {
        low: 'info',
        medium: 'warning',
        high: 'danger'
    };
    return severities[severity] || 'info';
};

const getDocumentLabel = (docId) => {
    const document = agentState.documents.find(doc => doc.id === docId);
    return document ? document.source : docId;
};
</script>

<style scoped>
.agentic-rag {
    padding: 1rem;
}

.doc-card,
.critique-card,
.answer,
.timeline-item {
    transition: all 0.3s ease;
}

.timeline-item {
    margin-bottom: 1rem;
}

.critique-section,
.suggestion-section {
    background-color: var(--surface-section);
}
</style>
