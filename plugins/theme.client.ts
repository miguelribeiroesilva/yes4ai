export default defineNuxtPlugin((nuxtApp) => {
    const themeCookie = useCookie('theme')
    
    // Watch for theme changes
    watch(() => themeCookie.value, (newTheme) => {
        if (process.client) {
            const html = document.querySelector('html')
            if (newTheme === 'dark') {
                html?.classList.add('dark')
                document.documentElement.setAttribute('data-theme', 'dark')
            } else {
                html?.classList.remove('dark')
                document.documentElement.setAttribute('data-theme', 'light')
            }
        }
    }, { immediate: true })
})
