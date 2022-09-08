import { resolve } from 'path'
import { defineNuxtConfig } from '@nuxt/bridge'

/** @type {import('@nuxt/types').NuxtConfig} **/
export default defineNuxtConfig({
    target: 'static',
    modern: true,
    ssr: false,
    build: {
        transpile: [
            // 'vscode-jsonrpc',
            // 'vscode-languageserver-protocol',
        ],
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
    plugins: [
        '~/plugins/vue-shortkey.client',
        '~/plugins/vue-shortkey.server',
    ],
    buildModules: [
        // Doc: https://github.com/nuxt-community/stylelint-module
        '@nuxtjs/stylelint-module',
        '@nuxtjs/vuetify',
    ],
    modules: [
    ],
    stylelint: {
        context: resolve(__dirname),
        lintDirtyModulesOnly: true,
    },
    vuetify: {
        customVariables: ['~/assets/variables.scss'],
    },
})
