<template>
    <div class="agentic-rag-page">
        <div class="card mb-4">
            <h1 class="text-3xl font-bold mb-2">{{ t('agenticRag.pageTitle') }}</h1>
            <p class="text-500">
                {{ t('agenticRag.pageDescription') }}
            </p>
        </div>
        
        <AgenticRag />
    </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>
