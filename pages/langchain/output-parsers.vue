<template>
  <div class="langchain-output-parsers">
    <LangChainDemo
      :title="t('langchain.output-parsers.title')"
      icon="pi pi-code"
      mode="output-parsers"
      :show-config="true"
      :config-options="parserOptions"
      :input-placeholder="t('langchain.output-parsers.description')"
    />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const parserOptions = [
  {
    key: 'format',
    label: 'Parser Type',
    type: 'select',
    options: [
      { label: t('langchain.output-parsers.types.structured'), value: 'structured' },
      { label: t('langchain.output-parsers.types.list'), value: 'list' },
      { label: t('langchain.output-parsers.types.datetime'), value: 'datetime' },
      { label: t('langchain.output-parsers.types.regex'), value: 'regex' },
      { label: t('langchain.output-parsers.types.custom'), value: 'custom' }
    ],
    placeholder: 'Select a parser type'
  }
];
</script>
