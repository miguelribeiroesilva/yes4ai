<template>
  <div class="langchain-chains">
    <LangChainDemo
      :title="t('langchain.chains.title')"
      icon="pi pi-link"
      mode="chains"
      :show-config="true"
      :config-options="chainOptions"
      :input-placeholder="t('langchain.chains.description')"
    />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const chainOptions = [
  {
    key: 'chainType',
    label: 'Chain Type',
    type: 'select',
    options: [
      { label: t('langchain.chains.types.llm'), value: 'llm' },
      { label: t('langchain.chains.types.sequential'), value: 'sequential' },
      { label: t('langchain.chains.types.router'), value: 'router' },
      { label: t('langchain.chains.types.transformation'), value: 'transformation' },
      { label: t('langchain.chains.types.retrieval'), value: 'retrieval' }
    ],
    placeholder: 'Select a chain type'
  }
];
</script>
