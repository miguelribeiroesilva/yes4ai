import { ref } from 'vue'
import { useCookie } from '#app'

export const useTheme = () => {
    const themeCookie = useCookie('theme', {
        default: () => 'dark',
        watch: true
    })
    
    const isDark = ref(themeCookie.value === 'dark')
    
    const toggleTheme = () => {
        isDark.value = !isDark.value
        themeCookie.value = isDark.value ? 'dark' : 'light'
    }

    const updateTheme = () => {
        const html = document.querySelector('html')
        if (isDark.value) {
            html?.classList.add('dark')
            document.documentElement.setAttribute('data-theme', 'dark')
        } else {
            html?.classList.remove('dark')
            document.documentElement.setAttribute('data-theme', 'light')
        }
    }

    const initTheme = () => {
        updateTheme()
    }

    return {
        isDark,
        toggleTheme,
        initTheme,
        updateTheme
    }
}
