<template>
    <div class="language-switcher">
        <Button 
            v-for="locale in availableLocales" 
            :key="locale.code"
            :label="locale.name"
            :severity="locale.code === $i18n.locale ? 'primary' : 'secondary'"
            text
            size="small"
            @click="switchLanguage(locale.code)"
        />
    </div>
</template>

<script setup>
import { useI18n } from '#i18n';
import { useRouter } from 'vue-router';

const { locales, locale } = useI18n();
const router = useRouter();

const availableLocales = computed(() => {
    return locales.value;
});

const switchLanguage = async (localeCode) => {
    // Set the locale
    locale.value = localeCode;
    
    // Get current route
    const route = router.currentRoute.value;
    
    // Navigate to the same route with new locale
    await router.replace({
        ...route,
        name: route.name,
        params: {
            ...route.params,
            locale: localeCode
        }
    });
};
</script>

<style scoped>
.language-switcher {
    display: flex;
    gap: 0.5rem;
    align-items: center;
}
</style>
