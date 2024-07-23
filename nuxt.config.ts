// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxtjs/supabase',
    '@nuxtjs/tailwindcss',
    'nuxt-primevue',
    '@nuxt/image'
  ],
  runtimeConfig: {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_KEY: process.env.SUPABASE_KEY,

    DATABASE_URL: process.env.DATABASE_URL,

    HIVEMQ_USERNAME: process.env.HIVEMQ_USERNAME,
    HIVEMQ_PASSWORD: process.env.HIVEMQ_PASSWORD,
    HIVEMQ_CLUSTER_URL: process.env.HIVEMQ_CLUSTER_URL,

    public: {
      SUPABASE_REFERENCE_ID: process.env.SUPABASE_REFERENCE_ID // for localStorage
    }
  },
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
        { property: 'og:image', content: 'https://yistouxrjuhsnljhyzdz.supabase.co/storage/v1/object/public/logo/gcgmmc-logo-abbreviation.png' },
        { property: 'og:ttl', content: '604800' }
      ],
      link: [
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },
  supabase: { redirect: false },
  primevue: {
    components: {
      include: '*'
    },
    options: {
      ripple: true
    }
  },
  nitro: {
    experimental: {
      websocket: true
    }
  },
  css: [
    'assets/css/tailwind.css',
    'assets/css/base.css',
    'primevue/resources/themes/aura-light-amber/theme.css',
    'primevue/resources/primevue.min.css',
    'primeicons/primeicons.css'
  ],
  image: {
    cloudinary: {
      baseURL: 'https://res.cloudinary.com/dtcgyjwzt/image/upload/v1709782922/'
    },
    screens: {
      'xs': 320,
      'sm': 640,
      'md': 768,
      'lg': 1024,
      'xl': 1280,
      'xxl': 1536,
      '2xl': 1536
    },
  },
  devtools: { enabled: true }
});