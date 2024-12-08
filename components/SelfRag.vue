<template>
    <div class="self-rag">
        <div class="grid">
            <!-- Main Query Panel -->
            <div class="col-12 lg:col-8">
                <div class="card">
                    <!-- Query Input -->
                    <div class="mb-4">
                        <h2 class="text-xl font-bold mb-3">{{ t('selfRag.query.title') }}</h2>
                        <span class="p-float-label">
                            <Textarea
                                v-model="queryInput"
                                :placeholder="t('selfRag.query.placeholder')"
                                rows="3"
                                class="w-full"
                                :disabled="isProcessing"
                            />
                            <label>{{ t('selfRag.query.label') }}</label>
                        </span>
                        <div class="flex justify-content-end gap-2 mt-2">
                            <Button :label="t('selfRag.actions.reset')" icon="pi pi-refresh" severity="secondary" @click="resetProcess" :disabled="isProcessing" />
                            <Button :label="t('selfRag.actions.search')" icon="pi pi-search" severity="primary" @click="startSearch" :loading="isProcessing" />
                        </div>
                    </div>

                    <!-- RAG Process Timeline -->
                    <div class="rag-timeline mb-4">
                        <h3 class="text-lg font-semibold mb-3">{{ t('selfRag.timeline.title') }}</h3>
                        <Timeline :value="processSteps" class="w-full">
                            <template #content="slotProps">
                                <div :class="['process-step p-3 surface-card border-round', {'border-primary': isCurrentStep(slotProps.item.status)}]">
                                    <div class="flex align-items-center mb-2">
                                        <i :class="getStepIcon(slotProps.item.status)" class="mr-2"></i>
                                        <span class="font-semibold">{{ slotProps.item.title }}</span>
                                        <Tag :value="slotProps.item.status" :severity="getStatusSeverity(slotProps.item.status)" class="ml-auto" />
                                    </div>
                                    <p class="m-0 line-height-3 text-600">{{ slotProps.item.description }}</p>
                                    <div v-if="slotProps.item.details" class="mt-2 p-2 surface-ground border-round">
                                        <small class="text-600">{{ slotProps.item.details }}</small>
                                    </div>
                                </div>
                            </template>
                        </Timeline>
                    </div>

                    <!-- Retrieved Documents -->
                    <div v-if="ragState.documents.length" class="retrieved-docs mb-4">
                        <h3 class="text-lg font-semibold mb-3">{{ t('selfRag.documents.title') }}</h3>
                        <div v-for="doc in ragState.documents" :key="doc.id" class="doc-item p-3 surface-ground border-round mb-2">
                            <div class="flex align-items-center mb-2">
                                <i class="pi pi-file text-primary mr-2"></i>
                                <span class="font-medium">{{ doc.source }}</span>
                                <Tag :value="`${doc.relevanceScore.toFixed(1)}%`" severity="info" class="ml-auto" />
                            </div>
                            <p class="m-0 text-600">{{ doc.content }}</p>
                        </div>
                    </div>

                    <!-- Generated Answer -->
                    <div v-if="ragState.answer" class="answer-panel surface-ground p-3 border-round">
                        <h3 class="text-lg font-semibold mb-3">{{ t('selfRag.answer.title') }}</h3>
                        <div class="answer p-3 surface-card border-round">
                            <div class="flex align-items-center mb-2">
                                <i class="pi pi-check-circle text-success mr-2"></i>
                                <span class="font-semibold">{{ t('selfRag.answer.generated') }}</span>
                                <Tag :value="getConfidenceLevel(ragState.answer.confidence)" :severity="getConfidenceSeverity(ragState.answer.confidence)" class="ml-auto" />
                            </div>
                            <p class="m-0 line-height-3">{{ ragState.answer.text }}</p>

                            <!-- Citations -->
                            <div v-if="ragState.answer.citations.length" class="mt-3">
                                <div class="text-sm font-medium mb-2">{{ t('selfRag.answer.citations') }}:</div>
                                <ul class="m-0 p-0 list-none">
                                    <li v-for="citation in ragState.answer.citations" :key="citation" class="text-600">
                                        <i class="pi pi-link mr-2"></i>{{ citation }}
                                    </li>
                                </ul>
                            </div>

                            <!-- Critique -->
                            <div v-if="ragState.answer.critique" class="mt-3 p-2 surface-ground border-round">
                                <div class="flex align-items-center mb-1">
                                    <i class="pi pi-exclamation-circle text-warning mr-2"></i>
                                    <span class="font-medium">{{ t('selfRag.answer.critique') }}</span>
                                </div>
                                <p class="m-0 text-600">{{ ragState.answer.critique }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Configuration Panel -->
            <div class="col-12 lg:col-4">
                <div class="card">
                    <h3 class="text-xl font-bold mb-4">{{ t('selfRag.config.title') }}</h3>

                    <!-- Process Status -->
                    <div class="mb-4">
                        <h4 class="font-medium mb-2">{{ t('selfRag.config.status.title') }}</h4>
                        <div class="status-card p-3 surface-ground border-round">
                            <div class="flex align-items-center mb-2">
                                <i :class="getStatusIcon(ragState.status)" class="mr-2"></i>
                                <span class="font-medium">{{ getStatusText(ragState.status) }}</span>
                            </div>
                            <div v-if="queryState.refinementCount > 0" class="mt-2">
                                <small class="text-600">
                                    {{ t('selfRag.config.status.refinements', { count: queryState.refinementCount }) }}
                                </small>
                            </div>
                        </div>
                    </div>

                    <!-- Query Evolution -->
                    <div v-if="queryState.critiquedQuery" class="mb-4">
                        <h4 class="font-medium mb-2">{{ t('selfRag.config.evolution.title') }}</h4>
                        <div class="evolution-card p-3 surface-ground border-round">
                            <div class="mb-2">
                                <div class="text-sm font-medium mb-1">{{ t('selfRag.config.evolution.original') }}:</div>
                                <div class="text-600">{{ queryState.originalQuery }}</div>
                            </div>
                            <div>
                                <div class="text-sm font-medium mb-1">{{ t('selfRag.config.evolution.refined') }}:</div>
                                <div class="text-600">{{ queryState.critiquedQuery }}</div>
                            </div>
                        </div>
                    </div>

                    <!-- Error Display -->
                    <div v-if="ragState.error" class="mb-4">
                        <Message severity="error">{{ ragState.error }}</Message>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSelfRag } from '~/composables/useSelfRag';

const { t } = useI18n();
const { queryState, ragState, isProcessing, processQuery } = useSelfRag();

// Local state
const queryInput = ref('');

// Computed
const processSteps = computed(() => {
    const steps = [
        {
            status: 'retrieving',
            title: t('selfRag.steps.retrieval'),
            description: t('selfRag.steps.retrievalDesc')
        },
        {
            status: 'generating',
            title: t('selfRag.steps.generation'),
            description: t('selfRag.steps.generationDesc')
        },
        {
            status: 'critiquing',
            title: t('selfRag.steps.critique'),
            description: t('selfRag.steps.critiqueDesc')
        }
    ];

    if (queryState.value.refinementCount > 0) {
        steps.push({
            status: 'refining',
            title: t('selfRag.steps.refinement'),
            description: t('selfRag.steps.refinementDesc'),
            details: t('selfRag.steps.refinementDetails', { count: queryState.value.refinementCount })
        });
    }

    return steps;
});

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
        critiquedQuery: null,
        needsRefinement: false,
        refinementCount: 0,
        maxRefinements: 3
    };
    ragState.value = {
        status: 'idle',
        documents: [],
        answer: null,
        error: null
    };
};

const getStepIcon = (status) => {
    const icons = {
        retrieving: 'pi pi-search text-blue-500',
        generating: 'pi pi-cog text-orange-500',
        critiquing: 'pi pi-eye text-purple-500',
        refining: 'pi pi-sync text-green-500'
    };
    return icons[status] || 'pi pi-circle-fill';
};

const getStatusSeverity = (status) => {
    const severities = {
        idle: 'secondary',
        retrieving: 'info',
        generating: 'warning',
        critiquing: 'help',
        refining: 'success',
        complete: 'success',
        error: 'danger'
    };
    return severities[status] || 'secondary';
};

const getStatusIcon = (status) => {
    const icons = {
        idle: 'pi pi-clock text-500',
        retrieving: 'pi pi-search text-blue-500',
        generating: 'pi pi-cog text-orange-500',
        critiquing: 'pi pi-eye text-purple-500',
        refining: 'pi pi-sync text-green-500',
        complete: 'pi pi-check-circle text-success',
        error: 'pi pi-times-circle text-danger'
    };
    return icons[status] || 'pi pi-circle-fill';
};

const getStatusText = (status) => {
    return t(`selfRag.status.${status}`);
};

const getConfidenceLevel = (score) => {
    if (score >= 90) return t('selfRag.confidence.high');
    if (score >= 70) return t('selfRag.confidence.medium');
    return t('selfRag.confidence.low');
};

const getConfidenceSeverity = (score) => {
    if (score >= 90) return 'success';
    if (score >= 70) return 'warning';
    return 'danger';
};

const isCurrentStep = (status) => {
    return status === ragState.value.status;
};
</script>

<style scoped>
.self-rag {
    padding: 1rem;
}

.process-step {
    transition: all 0.3s ease;
}

.doc-item {
    transition: all 0.3s ease;
}

.answer {
    transition: all 0.3s ease;
}
</style>
