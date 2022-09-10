import { resolve } from 'path'
import type { NuxtConfig } from '@nuxt/types'

export default <NuxtConfig> {
    target: 'static',
    modern: true,
    ssr: false,
    generate: {
        fallback: true,
    },
    build: {
        transpile: [
            'vscode-jsonrpc',
            'vscode-languageserver-protocol',
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
        '@nuxt/typescript-build',
        '@nuxt/postcss8',
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
}