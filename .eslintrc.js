module.exports = {
  root: true,
  extends: [
    '@nuxtjs/eslint-config-typescript',
    'plugin:nuxt/recommended'
  ],
  // add your custom rules here
  rules: {
    'no-console': [
      'error', {
        allow: ['assert', 'warn', 'error', 'info']
      }
    ]
  }
}
