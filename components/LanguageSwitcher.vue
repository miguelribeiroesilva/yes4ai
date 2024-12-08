<template>
    <div class="language-switcher">
        <Dropdown
            v-model="selectedLocale"
            :options="availableLocales"
            optionLabel="name"
            optionValue="code"
            :placeholder="currentLocaleName"
            class="w-full md:w-14rem"
            @change="switchLanguage"
            id="language-selector"
            :pt="{
                root: { id: 'language-selector' },
                panel: { id: 'language-selector-panel' }
            }"
        />
    </div>
</template>

<script setup>
import { useI18n } from '#i18n';
import { useRouter } from 'vue-router';
import { ref, computed } from 'vue';

const { locales, locale } = useI18n();
const router = useRouter();

const selectedLocale = ref(locale.value);

const availableLocales = computed(() => {
    return locales.value;
});

const currentLocaleName = computed(() => {
    const current = availableLocales.value.find(l => l.code === locale.value);
    return current ? current.name : '';
});

const switchLanguage = async (event) => {
    const localeCode = event.value;
    // Set the locale
    locale.value = localeCode;
    
    // Get current route
    const route = router.currentRoute.value;
    
    // Navigate to the same route with new locale
    await router.push({
        path: route.path,
        query: route.query
    });
};
</script>

<style scoped>
.language-switcher {
    display: flex;
    align-items: center;
}
</style>
