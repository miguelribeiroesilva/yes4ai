<template>
    <div class="crag-page">
        <div class="card mb-4">
            <h1 class="text-3xl font-bold mb-2">{{ t('crag.pageTitle') }}</h1>
            <p class="text-500">
                {{ t('crag.pageDescription') }}
            </p>
        </div>
        
        <Crag />
    </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>
