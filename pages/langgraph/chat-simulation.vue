<template>
    <div class="chat-simulation-page">
        <div class="card mb-4">
            <h1 class="text-3xl font-bold mb-2">{{ t('chat.title') }}</h1>
            <p class="text-500">Experience an interactive chat simulation with multiple AI agents.</p>
        </div>
        
        <ChatSimulation />
    </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>
