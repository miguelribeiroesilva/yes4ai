<template>
    <div class="rewoo-page">
        <div class="card mb-4">
            <h1 class="text-3xl font-bold mb-2">{{ t('rewoo.title') }}</h1>
            <p class="text-500">
                ReWOO (Reasoning With Object-Oriented) simulation demonstrating structured reasoning steps
                with configurable parameters and visual feedback.
            </p>
        </div>
        
        <ReWooSimulation />
    </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>
