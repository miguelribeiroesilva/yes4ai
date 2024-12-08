<template>
  <div class="langchain-memory">
    <LangChainDemo
      :title="t('langchain.memory.title')"
      icon="pi pi-database"
      mode="memory"
      :show-config="true"
      :config-options="memoryOptions"
      :input-placeholder="t('langchain.memory.description')"
    />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const memoryOptions = [
  {
    key: 'memoryType',
    label: 'Memory Type',
    type: 'select',
    options: [
      { label: t('langchain.memory.types.buffer'), value: 'buffer' },
      { label: t('langchain.memory.types.summary'), value: 'summary' },
      { label: t('langchain.memory.types.conversation'), value: 'conversation' },
      { label: t('langchain.memory.types.vector'), value: 'vector' },
      { label: t('langchain.memory.types.entity'), value: 'entity' }
    ],
    placeholder: 'Select a memory type'
  }
];
</script>
