<template>
  <v-alert :type="alertType" :icon="alertType ? null : 'mdi-console-line'" rounded="0">
    <span class="pre-wrap">{{ payload.message }}</span>
  </v-alert>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@vue/composition-api'

export default defineComponent({
  props: {
    payload: {
      type: Object as PropType<any>,
      required: true
    }
  },
  setup (props) {
    const mapping: Record<number, string> = {
      1: 'error',
      2: 'warning',
      3: 'info',
      4: ''
    }
    return {
      alertType: mapping[props.payload.type]
    }
  }
})
</script>

<style lang="scss" scoped>
.pre-wrap {
  white-space: pre-wrap;
}
</style>
