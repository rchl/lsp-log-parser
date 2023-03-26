import { resolve } from 'path'
import { defineNuxtConfig } from 'nuxt/config'
import viteVuetify from 'vite-plugin-vuetify'

export default defineNuxtConfig({
    css: [
        'vuetify/styles',
        '@mdi/font/css/materialdesignicons.css',
    ],
    ssr: false,
    generate: {
        // fallback: true,
    },
    build: {
        transpile: ['vuetify'],
        // transpile: [
        //     'vscode-jsonrpc',
        //     'vscode-languageserver-protocol',
        // ],
    },
    vite: {
      define: {
        'process.env.DEBUG': false,
      },
    },
    head: {
        title: 'LSP Log Parser',
        meta: [
            { charset: 'utf-8' },
            { name: 'viewport', content: 'width=device-width, initial-scale=1' },
            { hid: 'description', name: 'description', content: process.env.npm_package_description || '' },
        ],
        link: [
            { rel: 'icon', type: 'image/x-icon', href: '/favicon.png' },
        ],
    },
    loading: { color: '#fff' },
    loadingIndicator: {
        name: 'pulse',
        color: '#3B8070',
        background: 'white',
    },
    googleFonts: {
        download: true,
        families: {
            Roboto: [300, 400, 500],
        },
    },
    buildModules: [
        '@nuxtjs/stylelint-module',
        '@nuxtjs/vuetify',
    ],
    modules: [
        '@nuxtjs/google-fonts',
        '@vueuse/nuxt',
        (options, nuxt) => {
            nuxt.hooks.hook('vite:extendConfig', config => {
                config.plugins = config.plugins ?? []
                config.plugins.push(viteVuetify())
            })
        },
    ],
    stylelint: {
        context: resolve(__dirname),
        lintDirtyModulesOnly: true,
    },
    vuetify: {
        customVariables: ['~/assets/variables.scss'],
    },
})
