<template>
    <div class="self-rag-page">
        <div class="card mb-4">
            <h1 class="text-3xl font-bold mb-2">{{ t('selfRag.pageTitle') }}</h1>
            <p class="text-500">
                {{ t('selfRag.pageDescription') }}
            </p>
        </div>
        
        <SelfRag />
    </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>
