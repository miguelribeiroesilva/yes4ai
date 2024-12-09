<template>
  <div class="layout-menu-container">
    <div class="search-container mb-3">
      <span class="p-input-icon-left w-full">
        <i class="pi pi-search" />
        <InputText v-model="searchQuery" class="w-full" :placeholder="t('menu.search')" />
      </span>
    </div>

    <Tree :value="filteredMenuItems" :filter="true" :filterMode="'strict'" class="layout-menu">
      <template #default="{ node }">
        <div class="menu-item">
          <router-link v-if="node.to" :to="node.to" class="menu-item-link">
            {{ node.label }}
          </router-link>
          <span v-else>{{ node.label }}</span>
        </div>
      </template>
    </Tree>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const { t } = useI18n();
const router = useRouter();
const searchQuery = ref('');

const filterMenuItems = (items, query) => {
  if (!query) return items;

  return items.filter(item => {
    const matchesQuery = item.label.toLowerCase().includes(query.toLowerCase());

    if (item.children) {
      item.children = filterMenuItems(item.children, query);
      return item.children.length > 0 || matchesQuery;
    }

    return matchesQuery;
  });
};

const menuItems = computed(() => [
  {
    key: 'dashboard',
    label: t('menu.dashboard'),
    to: '/'
  },
  {
    key: 'administration',
    label: t('menu.administration'),
    children: [
      {
        key: 'users',
        label: t('menu.users'),
        to: '/admin/users'
      },
      {
        key: 'roles',
        label: t('menu.roles'),
        to: '/admin/roles'
      },
      {
        key: 'permissions',
        label: t('menu.permissions'),
        to: '/admin/permissions'
      }
    ]
  },
  {
    key: 'ai-examples',
    label: t('menu.aiExamples'),
    children: [
      {
        key: 'LangChain',
        label: 'LangChain',
        children: [
          {
            key: 'chains',
            label: 'Chains',
            to: '/langchain/chains'
          },
          {
            key: 'agents',
            label: 'Agents',
            to: '/langchain/agents'
          },
          {
            key: 'memory',
            label: 'Memory',
            to: '/langchain/memory'
          },
          {
            key: 'retrieval',
            label: 'Retrieval',
            to: '/langchain/retrieval'
          },
          {
            key: 'prompts',
            label: 'Prompts',
            to: '/langchain/prompts'
          },
          {
            key: 'output-parsers',
            label: 'Output Parsers',
            to: '/langchain/output-parsers'
          }
        ]
      },
      {
        key: 'LangChainTools',
        label: 'LangChain Tools',
        children: [
          {
            key: 'gmail',
            label: 'Gmail Tool',
            to: '/langchain/gmail'
          },
          {
            key: 'calendar',
            label: 'Calendar Tool',
            to: '/langchain/calendar'
          },
          {
            key: 'test',
            label: t('menu.langchain.test'),
            to: '/langchain/test'
          }
        ]
      },
      {
        key: 'LangGraph',
        label: 'LangGraph',
        to: '/langgraph',
        children: [
          {
            key: 'customer-support',
            label: t('menu.customerSupport'),
            to: '/langgraph/customer-support'
          },
          {
            key: 'agentic-rag',
            label: t('menu.agenticRag'),
            to: '/langgraph/agentic-rag'
          },
          {
            key: 'self-rag',
            label: t('menu.selfRag'),
            to: '/langgraph/self-rag'
          },
          {
            key: 'crag',
            label: t('menu.crag'),
            to: '/langgraph/crag'
          },
          {
            key: 'collaboration',
            label: t('menu.collaboration'),
            to: '/langgraph/agent-collaboration'
          },
          {
            key: 'supervisor',
            label: t('menu.supervisor'),
            to: '/langgraph/agent-supervisor'
          },
          {
            key: 'hierarchical',
            label: t('menu.hierarchical'),
            to: '/langgraph/hierarchical-teams'
          },
          {
            key: 'plan-execute',
            label: t('menu.plan-execute'),
            to: '/langgraph/plan-execute'
          },
          {
            key: 'reflection',
            label: t('menu.reflection'),
            to: '/langgraph/reflection'
          },
          {
            key: 'rewoo',
            label: t('menu.rewoo'),
            to: '/langgraph/rewoo'
          },
          {
            key: 'chat-simulation',
            label: t('menu.chat-simulation'),
            to: '/langgraph/chat-simulation'
          }
        ]
      },
      {
        key: 'AutoGen',
        label: 'AutoGen',
        children: [
          {
            key: 'basic-chat',
            label: 'Basic Chat',
            to: '/autogen/basic-chat'
          },
          {
            key: 'multi-agent',
            label: 'Multi-Agent Chat',
            to: '/autogen/multi-agent'
          },
          {
            key: 'group-chat',
            label: 'Group Chat',
            to: '/autogen/group-chat'
          },
          {
            key: 'task-solving',
            label: 'Task Solving',
            to: '/autogen/task-solving'
          }
        ]
      },

    ]
  },

  {
    key: 'settings',
    label: t('menu.settings'),
    to: '/settings'
  }
]);

const filteredMenuItems = computed(() => {
  return filterMenuItems(JSON.parse(JSON.stringify(menuItems.value)), searchQuery.value);
});

const handleNodeClick = (node) => {
  if (node.to) {
    router.push(node.to);
  }
};
</script>

<style scoped>
.layout-menu-container {
  height: 100%;
  padding: 1rem;
}

.search-container {
  padding: 0.5rem;
}

:deep(.layout-menu) {
  border: none;
  padding: 0;
}

.menu-item-link {
  text-decoration: none;
  color: var(--text-color);
  transition: color 0.2s;
  padding: 0.125rem;
}

.menu-item-link:hover {
  color: var(--primary-color);
}

:deep(.p-tree) {
  padding: 0;
  border: none;
  background: transparent;
}

:deep(.p-tree-container) {
  padding: 0;
}

:deep(.p-treenode) {
  padding: 0;
}

:deep(.p-treenode-content) {
  padding: 0 !important;
  min-height: 1.5rem;
}

:deep(.p-treenode .p-treenode-leaf) {
  margin: 0 !important;
}

:deep(.p-tree-toggler) {
  width: 1.5rem;
  height: 1.5rem;
  margin-right: 0.25rem;
}
</style>
