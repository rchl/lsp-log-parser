import { createVuetify } from 'vuetify'

const vuetify = createVuetify({
    ssr: true,
    theme: {
        defaultTheme: 'light',
    },
})

export default defineNuxtPlugin(nuxtApp => {
    nuxtApp.vueApp.use(vuetify)
})
