<template>
  <div class="langchain-prompts">
    <LangChainDemo
      :title="t('langchain.prompts.title')"
      icon="pi pi-file-edit"
      mode="prompts"
      :show-config="true"
      :config-options="promptOptions"
      :input-placeholder="t('langchain.prompts.description')"
    />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const promptOptions = [
  {
    key: 'template',
    label: 'Template Type',
    type: 'select',
    options: [
      { label: t('langchain.prompts.types.basic'), value: 'basic' },
      { label: t('langchain.prompts.types.few-shot'), value: 'few-shot' },
      { label: t('langchain.prompts.types.structured'), value: 'structured' },
      { label: t('langchain.prompts.types.chat'), value: 'chat' },
      { label: t('langchain.prompts.types.pipeline'), value: 'pipeline' }
    ],
    placeholder: 'Select a template type'
  }
];
</script>
