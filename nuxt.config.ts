// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxtjs/supabase',
    '@nuxtjs/tailwindcss',
    'nuxt-primevue'
  ],
  app: {
    head: {
      title: 'Human Capital Management',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Human Capital Management of Gov. Celestino Gallares Memorial Medical Center.' },

        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: 'Gov. Celestino Gallares Memorial Medical Center - Human Capital Management' },
        { property: 'og:url', content: 'http://pylon.gcgmmc.app/' },
        { property: 'og:description', content: 'Human Capital Management of Gov. Celestino Gallares Memorial Medical Center.' },
        { property: 'og:image', content: 'https://www.primefaces.org/static/social/primevue-preview.jpg' },
        { property: 'og:ttl', content: '604800' }
      ],
      link: [
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' }
      ]
    }
  },
  supabase: {
    redirect: false
  },
  primevue: {
    options: {
      unstyled: true,
      ripple: true
    },
    importPT: { as: 'Wind', from: '~/presets/wind/' }
  },
  tailwindcss: {
    config: {
      content: [
        "presets/**/*.{js,vue,ts}"
      ],
      theme: {
        extend: {
          colors: {
            'primary-50': 'rgb(var(--primary-50))',
            'primary-100': 'rgb(var(--primary-100))',
            'primary-200': 'rgb(var(--primary-200))',
            'primary-300': 'rgb(var(--primary-300))',
            'primary-400': 'rgb(var(--primary-400))',
            'primary-500': 'rgb(var(--primary-500))',
            'primary-600': 'rgb(var(--primary-600))',
            'primary-700': 'rgb(var(--primary-700))',
            'primary-800': 'rgb(var(--primary-800))',
            'primary-900': 'rgb(var(--primary-900))',
            'primary-950': 'rgb(var(--primary-950))',
            'surface-0': 'rgb(var(--surface-0))',
            'surface-50': 'rgb(var(--surface-50))',
            'surface-100': 'rgb(var(--surface-100))',
            'surface-200': 'rgb(var(--surface-200))',
            'surface-300': 'rgb(var(--surface-300))',
            'surface-400': 'rgb(var(--surface-400))',
            'surface-500': 'rgb(var(--surface-500))',
            'surface-600': 'rgb(var(--surface-600))',
            'surface-700': 'rgb(var(--surface-700))',
            'surface-800': 'rgb(var(--surface-800))',
            'surface-900': 'rgb(var(--surface-900))',
            'surface-950': 'rgb(var(--surface-950))'
          }
        }
      }
    }
  },
  css: [
    '~/assets/css/base.css',
    '/node_modules/primeicons/primeicons.css'
  ],
  devtools: { enabled: true }
});