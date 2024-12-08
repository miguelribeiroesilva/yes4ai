<template>
    <div class="plan-execute-page">
        <div class="card mb-4">
            <h1 class="text-3xl font-bold mb-2">{{ t('planExecute.title') }}</h1>
            <p class="text-500">
                Experience an AI agent that breaks down complex tasks into manageable steps,
                creates detailed execution plans, and systematically carries them out.
            </p>
        </div>
        
        <PlanExecuteAgent />
    </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>
