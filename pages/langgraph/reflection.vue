<template>
    <div class="reflection-page">
        <div class="card mb-4">
            <h1 class="text-3xl font-bold mb-2">{{ t('reflection.title') }}</h1>
            <p class="text-500">
                Experience an AI agent that can reflect on conversations, identify patterns,
                and generate insights through continuous learning and analysis.
            </p>
        </div>
        
        <ReflectionAgent />
    </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>
