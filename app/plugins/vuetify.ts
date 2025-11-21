import { createVuetify } from 'vuetify'

const vuetify = createVuetify({
    ssr: true,
})

export default defineNuxtPlugin(nuxtApp => {
    nuxtApp.vueApp.use(vuetify)
})
