<template>
  <div class="langchain-retrieval">
    <LangChainDemo
      :title="t('langchain.retrieval.title')"
      icon="pi pi-search"
      mode="retrieval"
      :show-config="true"
      :config-options="retrievalOptions"
      :input-placeholder="t('langchain.retrieval.description')"
    />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const retrievalOptions = [
  {
    key: 'retrievalType',
    label: 'Retrieval Type',
    type: 'select',
    options: [
      { label: t('langchain.retrieval.types.similarity'), value: 'similarity' },
      { label: t('langchain.retrieval.types.mmr'), value: 'mmr' },
      { label: t('langchain.retrieval.types.hybrid'), value: 'hybrid' },
      { label: t('langchain.retrieval.types.contextual'), value: 'contextual' },
      { label: t('langchain.retrieval.types.time-weighted'), value: 'time-weighted' }
    ],
    placeholder: 'Select a retrieval type'
  }
];
</script>
