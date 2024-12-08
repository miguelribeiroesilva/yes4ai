<template>
    <div class="collaboration-page">
        <div class="card mb-4">
            <h1 class="text-3xl font-bold mb-2">{{ t('collaboration.pageTitle') }}</h1>
            <p class="text-500">
                {{ t('collaboration.pageDescription') }}
            </p>
        </div>
        
        <AgentCollaboration />
    </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>
