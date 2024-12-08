<template>
    <div class="hierarchical-page">
        <div class="card mb-4">
            <h1 class="text-3xl font-bold mb-2">{{ t('hierarchical.title') }}</h1>
            <p class="text-500">
                Experience a sophisticated multi-agent system where teams of AI agents work together
                in a hierarchical structure to solve complex tasks through coordinated effort and
                specialized roles.
            </p>
        </div>
        
        <HierarchicalTeams />
    </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>
