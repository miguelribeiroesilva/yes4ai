<template>
    <div class="crag">
        <div class="grid">
            <!-- Main Query Panel -->
            <div class="col-12 lg:col-8">
                <div class="card">
                    <!-- Query Input -->
                    <div class="mb-4">
                        <h2 class="text-xl font-bold mb-3">{{ t('crag.query.title') }}</h2>
                        <span class="p-float-label">
                            <Textarea
                                v-model="queryInput"
                                :placeholder="t('crag.query.placeholder')"
                                rows="3"
                                class="w-full"
                                :disabled="isProcessing"
                            />
                            <label>{{ t('crag.query.label') }}</label>
                        </span>
                        <div class="flex justify-content-end gap-2 mt-2">
                            <Button :label="t('crag.actions.reset')" icon="pi pi-refresh" severity="secondary" @click="resetProcess" :disabled="isProcessing" />
                            <Button :label="t('crag.actions.search')" icon="pi pi-search" severity="primary" @click="startSearch" :loading="isProcessing" />
                        </div>
                    </div>

                    <!-- Context Panel -->
                    <div v-if="cragState.contexts.length" class="context-panel mb-4">
                        <h3 class="text-lg font-semibold mb-3">{{ t('crag.context.title') }}</h3>
                        <div class="grid">
                            <div v-for="context in cragState.contexts" :key="context.id" class="col-12 md:col-6">
                                <div class="context-card p-3 surface-ground border-round mb-2">
                                    <div class="flex align-items-center mb-2">
                                        <i :class="getContextIcon(context.type)" class="mr-2"></i>
                                        <span class="font-medium">{{ getContextTypeLabel(context.type) }}</span>
                                        <Tag :value="`${(context.relevance || 0).toFixed(1)}%`" severity="info" class="ml-auto" />
                                    </div>
                                    <p class="m-0 text-600">{{ context.content }}</p>
                                    <small class="block mt-2 text-500">{{ formatTimestamp(context.timestamp) }}</small>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Expanded Query -->
                    <div v-if="queryState.expandedQuery" class="expanded-query mb-4">
                        <h3 class="text-lg font-semibold mb-2">{{ t('crag.expanded.title') }}</h3>
                        <div class="p-3 surface-ground border-round">
                            <div class="font-medium mb-2">{{ t('crag.expanded.original') }}:</div>
                            <p class="m-0 text-600 mb-3">{{ queryState.originalQuery }}</p>
                            <div class="font-medium mb-2">{{ t('crag.expanded.enhanced') }}:</div>
                            <p class="m-0 text-600">{{ queryState.expandedQuery }}</p>
                        </div>
                    </div>

                    <!-- Retrieved Documents -->
                    <div v-if="cragState.documents.length" class="documents-panel mb-4">
                        <h3 class="text-lg font-semibold mb-3">{{ t('crag.documents.title') }}</h3>
                        <div v-for="doc in cragState.documents" :key="doc.id" class="doc-card p-3 surface-ground border-round mb-2">
                            <div class="flex align-items-center mb-2">
                                <i class="pi pi-file-pdf text-primary mr-2"></i>
                                <span class="font-medium">{{ doc.source }}</span>
                                <Tag :value="`${(doc.metadata.relevance || 0).toFixed(1)}%`" severity="info" class="ml-auto" />
                            </div>
                            <p class="m-0 text-600 mb-2">{{ doc.content }}</p>
                            <div class="flex align-items-center gap-2">
                                <Tag :value="doc.metadata.type" severity="secondary" />
                                <small class="text-500">{{ doc.metadata.context }}</small>
                            </div>
                        </div>
                    </div>

                    <!-- Generated Answer -->
                    <div v-if="cragState.answer" class="answer-panel surface-ground p-3 border-round">
                        <h3 class="text-lg font-semibold mb-3">{{ t('crag.answer.title') }}</h3>
                        <div class="answer p-3 surface-card border-round">
                            <div class="flex align-items-center mb-2">
                                <i class="pi pi-check-circle text-success mr-2"></i>
                                <span class="font-semibold">{{ t('crag.answer.generated') }}</span>
                                <Tag :value="getConfidenceLevel(cragState.answer.confidence)" :severity="getConfidenceSeverity(cragState.answer.confidence)" class="ml-auto" />
                            </div>
                            <p class="m-0 line-height-3 mb-3">{{ cragState.answer.text }}</p>

                            <!-- Used Resources -->
                            <div class="used-resources p-2 surface-ground border-round">
                                <div class="mb-2">
                                    <div class="text-sm font-medium mb-1">{{ t('crag.answer.usedContexts') }}:</div>
                                    <div class="flex flex-wrap gap-2">
                                        <Tag v-for="ctxId in cragState.answer.usedContexts" 
                                             :key="ctxId"
                                             :value="getContextLabel(ctxId)"
                                             severity="warning" />
                                    </div>
                                </div>
                                <div>
                                    <div class="text-sm font-medium mb-1">{{ t('crag.answer.usedDocuments') }}:</div>
                                    <div class="flex flex-wrap gap-2">
                                        <Tag v-for="docId in cragState.answer.usedDocuments"
                                             :key="docId"
                                             :value="getDocumentLabel(docId)"
                                             severity="info" />
                                    </div>
                                </div>
                            </div>

                            <!-- Explanation -->
                            <div v-if="cragState.answer.explanation" class="mt-3">
                                <div class="text-sm font-medium mb-1">{{ t('crag.answer.explanation') }}:</div>
                                <p class="m-0 text-600">{{ cragState.answer.explanation }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Status Panel -->
            <div class="col-12 lg:col-4">
                <div class="card">
                    <h3 class="text-xl font-bold mb-4">{{ t('crag.status.title') }}</h3>

                    <!-- Process Status -->
                    <div class="mb-4">
                        <div class="status-card p-3 surface-ground border-round">
                            <div class="flex align-items-center mb-2">
                                <i :class="getStatusIcon(cragState.status)" class="mr-2"></i>
                                <span class="font-medium">{{ getStatusText(cragState.status) }}</span>
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
                                </div>
                            </template>
                        </Timeline>
                    </div>

                    <!-- Error Display -->
                    <div v-if="cragState.error" class="mb-4">
                        <Message severity="error">{{ cragState.error }}</Message>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCrag } from '~/composables/useCrag';

const { t } = useI18n();
const { queryState, cragState, isProcessing, processQuery } = useCrag();

// Local state
const queryInput = ref('');

// Computed
const processSteps = computed(() => [
    {
        status: 'expanding',
        label: t('crag.steps.expanding'),
        description: t('crag.steps.expandingDesc')
    },
    {
        status: 'retrieving',
        label: t('crag.steps.retrieving'),
        description: t('crag.steps.retrievingDesc')
    },
    {
        status: 'analyzing',
        label: t('crag.steps.analyzing'),
        description: t('crag.steps.analyzingDesc')
    },
    {
        status: 'generating',
        label: t('crag.steps.generating'),
        description: t('crag.steps.generatingDesc')
    }
]);

// Methods
const startSearch = async () => {
    if (!queryInput.value.trim()) return;
    await processQuery(queryInput.value.trim());
};

const resetProcess = () => {
    queryInput.value = '';
    queryState.value = {
        originalQuery: '',
        currentQuery: '',
        expandedQuery: null,
        contexts: []
    };
    cragState.value = {
        status: 'idle',
        contexts: [],
        documents: [],
        answer: null,
        error: null
    };
};

const getContextIcon = (type) => {
    const icons = {
        user: 'pi pi-user text-blue-500',
        system: 'pi pi-cog text-orange-500',
        historical: 'pi pi-clock text-green-500'
    };
    return icons[type] || 'pi pi-info-circle';
};

const getContextTypeLabel = (type) => {
    return t(`crag.context.types.${type}`);
};

const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
};

const getStatusIcon = (status) => {
    const icons = {
        idle: 'pi pi-clock text-500',
        expanding: 'pi pi-arrows-h text-blue-500',
        retrieving: 'pi pi-search text-orange-500',
        analyzing: 'pi pi-chart-bar text-purple-500',
        generating: 'pi pi-cog text-green-500',
        complete: 'pi pi-check-circle text-success',
        error: 'pi pi-times-circle text-danger'
    };
    return icons[status] || 'pi pi-circle-fill';
};

const getStatusText = (status) => {
    return t(`crag.status.${status}`);
};

const getStepIcon = (status) => {
    const icons = {
        expanding: 'pi pi-arrows-h text-blue-500',
        retrieving: 'pi pi-search text-orange-500',
        analyzing: 'pi pi-chart-bar text-purple-500',
        generating: 'pi pi-cog text-green-500'
    };
    return icons[status] || 'pi pi-circle-fill';
};

const getStepStatus = (status) => {
    if (status === cragState.value.status) return t('crag.steps.inProgress');
    if (getStepOrder(status) < getStepOrder(cragState.value.status)) return t('crag.steps.completed');
    return t('crag.steps.pending');
};

const getStepSeverity = (status) => {
    if (status === cragState.value.status) return 'warning';
    if (getStepOrder(status) < getStepOrder(cragState.value.status)) return 'success';
    return 'secondary';
};

const getStepOrder = (status) => {
    const order = {
        idle: 0,
        expanding: 1,
        retrieving: 2,
        analyzing: 3,
        generating: 4,
        complete: 5,
        error: 6
    };
    return order[status] || 0;
};

const isCurrentStep = (status) => {
    return status === cragState.value.status;
};

const getConfidenceLevel = (score) => {
    if (score >= 0.9) return t('crag.confidence.high');
    if (score >= 0.7) return t('crag.confidence.medium');
    return t('crag.confidence.low');
};

const getConfidenceSeverity = (score) => {
    if (score >= 0.9) return 'success';
    if (score >= 0.7) return 'warning';
    return 'danger';
};

const getContextLabel = (ctxId) => {
    const context = cragState.value.contexts.find(ctx => ctx.id === ctxId);
    return context ? `${getContextTypeLabel(context.type)} Context` : ctxId;
};

const getDocumentLabel = (docId) => {
    const document = cragState.value.documents.find(doc => doc.id === docId);
    return document ? document.source : docId;
};
</script>

<style scoped>
.crag {
    padding: 1rem;
}

.context-card,
.doc-card,
.answer,
.timeline-item {
    transition: all 0.3s ease;
}

.timeline-item {
    margin-bottom: 1rem;
}
</style>
