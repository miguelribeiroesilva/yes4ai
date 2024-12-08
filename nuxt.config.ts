// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    'nuxt-primevue',
    '@nuxtjs/i18n'
  ],

  primevue: {
    options: {
      ripple: true,
      unstyled: false,
      idMode: 'static'
    },
    components: {
      include: '*'
    },
    directives: {
      include: '*'
    }
  },

  experimental: {
    scanPageMeta: true
  },

  i18n: {
    baseUrl: 'http://localhost:3000',
    defaultLocale: 'en',
    langDir: 'locales',
    lazy: false,
    strategy: 'prefix_except_default',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root'
    },
    locales: [
      {
        code: 'en',
        iso: 'en-US',
        file: 'en.json',
        name: 'English'
      },
      {
        code: 'es',
        iso: 'es-ES',
        file: 'es.json',
        name: 'Español'
      },
      {
        code: 'pt',
        iso: 'pt-PT',
        file: 'pt.json',
        name: 'Português'
      }
    ]
  },

  css: [
    'primevue/resources/themes/aura-light-blue/theme.css',
    'primevue/resources/themes/aura-dark-blue/theme.css',
    'primeicons/primeicons.css',
    'primeflex/primeflex.css',
    '@/assets/css/theme.css'
  ],

  compatibilityDate: '2024-12-08'
})