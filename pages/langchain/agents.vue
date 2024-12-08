<template>
  <div class="langchain-agents">
    <LangChainDemo
      :title="t('langchain.agents.title')"
      icon="pi pi-user"
      mode="agents"
      :show-config="true"
      :config-options="agentOptions"
      :input-placeholder="t('langchain.agents.description')"
    />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const agentOptions = [
  {
    key: 'agentType',
    label: 'Agent Type',
    type: 'select',
    options: [
      { label: t('langchain.agents.types.zero-shot'), value: 'zero-shot' },
      { label: t('langchain.agents.types.react'), value: 'react' },
      { label: t('langchain.agents.types.structured'), value: 'structured' },
      { label: t('langchain.agents.types.openai'), value: 'openai' },
      { label: t('langchain.agents.types.plan-and-execute'), value: 'plan-and-execute' }
    ],
    placeholder: 'Select an agent type'
  }
];
</script>
