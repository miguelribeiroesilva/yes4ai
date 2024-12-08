<template>
    <div class="landing-page">
        <div class="card">
            <h1 class="text-4xl font-bold mb-4">{{ t('landing.title') }}</h1>
            <p class="text-xl text-500 mb-6">{{ t('landing.description') }}</p>

            <div class="grid">
                <div v-for="example in aiExamples" :key="example.route" class="col-12 md:col-6 lg:col-4 xl:col-3">
                    <div class="card m-2 cursor-pointer hover:surface-hover transition-colors transition-duration-200"
                         @click="navigateTo(example.route)">
                        <div class="flex align-items-center mb-3">
                            <i :class="['text-xl mr-2', example.icon]"></i>
                            <h2 class="text-xl font-semibold m-0">{{ example.title }}</h2>
                        </div>
                        <p class="text-500 line-height-3 m-0">{{ example.description }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const { t } = useI18n();
const router = useRouter();

const aiExamples = [
    {
        title: t('menu.customerSupport'),
        description: t('landing.examples.customerSupport'),
        icon: 'pi pi-comments',
        route: '/langgraph/customer-support'
    },
    {
        title: t('menu.agenticRag'),
        description: t('landing.examples.agenticRag'),
        icon: 'pi pi-search',
        route: '/langgraph/agentic-rag'
    },
    {
        title: t('menu.selfRag'),
        description: t('landing.examples.selfRag'),
        icon: 'pi pi-refresh',
        route: '/langgraph/self-rag'
    },
    {
        title: t('menu.crag'),
        description: t('landing.examples.crag'),
        icon: 'pi pi-sitemap',
        route: '/langgraph/crag'
    },
    {
        title: t('menu.collaboration'),
        description: t('landing.examples.collaboration'),
        icon: 'pi pi-users',
        route: '/langgraph/agent-collaboration'
    },
    {
        title: t('menu.supervisor'),
        description: t('landing.examples.supervisor'),
        icon: 'pi pi-user',
        route: '/langgraph/agent-supervisor'
    },
    {
        title: t('menu.hierarchical'),
        description: t('landing.examples.hierarchical'),
        icon: 'pi pi-chart-line',
        route: '/langgraph/hierarchical-teams'
    },
    {
        title: t('menu.plan-execute'),
        description: t('landing.examples.plan-execute'),
        icon: 'pi pi-list',
        route: '/langgraph/plan-execute'
    },
    {
        title: t('menu.reflection'),
        description: t('landing.examples.reflection'),
        icon: 'pi pi-sync',
        route: '/langgraph/reflection'
    },
    {
        title: t('menu.rewoo'),
        description: t('landing.examples.rewoo'),
        icon: 'pi pi-cog',
        route: '/langgraph/rewoo'
    },
    {
        title: t('menu.chat-simulation'),
        description: t('landing.examples.chat-simulation'),
        icon: 'pi pi-comments',
        route: '/langgraph/chat-simulation'
    }
];

const navigateTo = (route) => {
    router.push(route);
};
</script>

<style scoped>
.landing-page {
    padding: 2rem;
}
</style>
