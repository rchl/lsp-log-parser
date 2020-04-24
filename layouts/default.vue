<template>
  <div>
    <nuxt />
  </div>
</template>

<script>
export default {
  mounted () {
    document.addEventListener('keyup', this.keyHandler)
  },
  destroyed () {
    document.removeEventListener('keyup', this.keyHandler)
  },
  methods: {
    keyHandler (event) {
      if (event.key === '/') {
        this.$store.commit('triggerSearchFocus')
      }
    }
  }
}
</script>
