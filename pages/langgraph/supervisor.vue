<template>
    <div class="supervisor-page">
        <div class="card mb-4">
            <h1 class="text-3xl font-bold mb-2">{{ t('supervisor.title') }}</h1>
            <p class="text-500">
                Experience an advanced agent supervision system that monitors and coordinates
                multiple AI agents, ensuring efficient task execution through proactive
                intervention and performance optimization.
            </p>
        </div>
        
        <AgentSupervisor />
    </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>
