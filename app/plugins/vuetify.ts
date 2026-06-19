import { createVuetify } from 'vuetify'

const vuetify = createVuetify({
    ssr: true,
    theme: {
        defaultTheme: 'light',
    },
    defaults: {
        // Shrink component boxes (buttons, app bar, inputs, lists, …) a notch.
        // Pairs with the reduced root font size in assets/main.scss, which
        // scales the text/labels.
        global: {
            density: 'compact',
        },
    },
})

export default defineNuxtPlugin(nuxtApp => {
    nuxtApp.vueApp.use(vuetify)
})
