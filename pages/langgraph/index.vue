<template>
    <div>
        <!-- Hero Section -->
        <section class="hero px-4 py-8 md:px-6 lg:px-8">
            <div class="grid">
                <div class="col-12 md:col-6 flex flex-column align-items-center md:align-items-start justify-content-center gap-4">
                    <h1 class="text-6xl font-bold m-0 text-center md:text-left">{{ t('hero.title') }}</h1>
                    <p class="text-xl line-height-3 text-center md:text-left">{{ t('hero.subtitle') }}</p>
                    <div class="flex gap-3">
                        <Button :label="t('hero.startButton')" severity="primary" size="large" @click="navigateToAdmin" />
                        <Button :label="t('hero.demoButton')" severity="secondary" size="large" text @click="navigateToAdmin" />
                    </div>
                    <div class="flex gap-5 mt-4">
                        <div class="flex flex-column align-items-center md:align-items-start">
                            <span class="text-4xl font-bold mb-2">{{ t('hero.stats.satisfaction.value') }}</span>
                            <span class="text-sm">{{ t('hero.stats.satisfaction.label') }}</span>
                        </div>
                        <div class="flex flex-column align-items-center md:align-items-start">
                            <span class="text-4xl font-bold mb-2">{{ t('hero.stats.support.value') }}</span>
                            <span class="text-sm">{{ t('hero.stats.support.label') }}</span>
                        </div>
                        <div class="flex flex-column align-items-center md:align-items-start">
                            <span class="text-4xl font-bold mb-2">{{ t('hero.stats.users.value') }}</span>
                            <span class="text-sm">{{ t('hero.stats.users.label') }}</span>
                        </div>
                    </div>
                </div>
                <div class="col-12 md:col-6 flex align-items-center justify-content-center py-5">
                    <div class="dashboard-preview surface-card p-4 border-round-xl shadow-2">
                        <div class="flex justify-content-between align-items-center mb-4">
                            <div class="flex align-items-center gap-3">
                                <div class="w-3rem h-3rem border-circle bg-primary-100 flex align-items-center justify-content-center">
                                    <i class="pi pi-inbox text-primary text-2xl"></i>
                                </div>
                                <div>
                                    <h3 class="m-0 font-semibold">{{ t('dashboard.unifiedInbox.title') }}</h3>
                                    <span class="text-500">{{ t('dashboard.unifiedInbox.description') }}</span>
                                </div>
                            </div>
                            <Button icon="pi pi-ellipsis-v" text rounded />
                        </div>
                        <div class="messages">
                            <div v-for="i in 3" :key="i" class="message surface-ground p-3 border-round mb-3">
                                <div class="flex justify-content-between align-items-center mb-2">
                                    <div class="flex align-items-center gap-2">
                                        <div class="w-2rem h-2rem border-circle bg-primary flex align-items-center justify-content-center">
                                            <i class="pi pi-whatsapp text-white text-sm"></i>
                                        </div>
                                        <span class="font-medium">{{ t('dashboard.message.author') }}</span>
                                    </div>
                                    <span class="text-500 text-sm">{{ t('dashboard.message.time') }}</span>
                                </div>
                                <p class="m-0 line-height-3">{{ t('dashboard.message.content') }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Features Section -->
        <section class="features px-4 py-8 md:px-6 lg:px-8 surface-ground">
            <div class="text-center mb-6">
                <h2 class="text-4xl font-bold mb-2">{{ t('features.title') }}</h2>
                <p class="text-xl">{{ t('features.subtitle') }}</p>
            </div>
            <div class="grid">
                <div class="col-12 xl:col-6">
                    <div class="card h-full">
                        <div class="flex align-items-center justify-content-between mb-4">
                            <div>
                                <span class="block text-500 font-medium mb-3">{{ t('dashboard.unifiedInbox.title') }}</span>
                                <div class="text-900 font-medium text-xl">{{ t('dashboard.unifiedInbox.description') }}</div>
                            </div>
                        </div>
                        <div class="surface-card p-4 shadow-2 border-round">
                        </div>
                    </div>
                </div>
                <div class="col-12 md:col-4 p-3">
                    <div class="surface-card p-4 border-round h-full">
                        <i class="pi pi-users text-4xl text-primary mb-3"></i>
                        <h3 class="text-xl font-semibold mb-2">{{ t('features.collaboration.title') }}</h3>
                        <p class="line-height-3 mb-0">{{ t('features.collaboration.description') }}</p>
                    </div>
                </div>
                <div class="col-12 md:col-4 p-3">
                    <div class="surface-card p-4 border-round h-full">
                        <i class="pi pi-chart-line text-4xl text-primary mb-3"></i>
                        <h3 class="text-xl font-semibold mb-2">{{ t('features.analytics.title') }}</h3>
                        <p class="line-height-3 mb-0">{{ t('features.analytics.description') }}</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Integration Section -->
        <section class="integrations px-4 py-8 md:px-6 lg:px-8">
            <div class="text-center mb-6">
                <h2 class="text-4xl font-bold mb-2">{{ t('integrations.title') }}</h2>
                <p class="text-xl">{{ t('integrations.subtitle') }}</p>
            </div>
            <div class="flex flex-wrap justify-content-center gap-5">
                <div v-for="brand in ['WhatsApp', 'Messenger', 'Instagram', 'Slack', 'Gmail']" :key="brand"
                    class="surface-card p-3 border-round flex align-items-center">
                    <span class="font-medium">{{ brand }}</span>
                </div>
            </div>
        </section>

        <!-- CTA Section -->
        <section class="cta surface-ground px-4 py-8 md:px-6 lg:px-8 text-center">
            <div class="max-w-30rem mx-auto">
                <h2 class="text-4xl font-bold mb-3">{{ t('cta.title') }}</h2>
                <p class="text-xl line-height-3 mb-4">{{ t('cta.subtitle') }}</p>
                <Button :label="t('cta.button')" severity="primary" size="large" @click="navigateToAdmin" />
            </div>
        </section>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const { t } = useI18n();

const navigateToAdmin = () => {
    router.push('/admin');
};
</script>

<style scoped>
.hero {
    background: linear-gradient(45deg, var(--primary-color) 0%, transparent 100%);
    position: relative;
}

.hero::before {
    content: '';
    background: radial-gradient(circle at 50% 50%, var(--primary-color) 0%, transparent 50%);
    opacity: 0.1;
    position: absolute;
    height: 100%;
    width: 100%;
    top: 0;
    left: 0;
}

.features {
    position: relative;
    overflow: hidden;
}

.features::before {
    content: '';
    position: absolute;
    width: 200%;
    height: 200%;
    top: -50%;
    left: -50%;
    background: radial-gradient(circle at center, var(--primary-color) 0%, transparent 60%);
    opacity: 0.1;
    z-index: 0;
}

.features > * {
    position: relative;
    z-index: 1;
}

.dashboard-preview {
    max-width: 30rem;
    width: 100%;
}
</style>
