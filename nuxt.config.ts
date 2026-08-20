export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  future: {
    compatibilityVersion: 4
  },
  modules: [
    '@nuxtjs/color-mode',
    '@pinia/nuxt'
  ],
  colorMode: {
    preference: 'system',
    fallback: 'dark',
    classSuffix: '-mode'
  },
  runtimeConfig: {
    mongodbUri: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET || 'lookby-dev-secret-key-change-in-prod',
    adminEmail: process.env.ADMIN_EMAIL || 'admin@lookby.com',
    adminPassword: process.env.ADMIN_PASSWORD || 'admin123',
    resendApiKey: process.env.RESEND_API_KEY,
    public: {
      appName: 'LookBy'
    }
  },
  css: ['~/assets/css/main.css']
})