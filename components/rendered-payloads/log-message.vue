<template>
  <v-alert :type="alertType" :icon="alertType ? null : 'mdi-console-line'" rounded="0" class="ma-0">
    <span class="pre-wrap">{{ typeof payload === 'string' ? payload : payload.message }}</span>
  </v-alert>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@vue/composition-api'
import { Message } from '~/models/log-model'

export default defineComponent({
  props: {
    payload: {
      type: Object as PropType<NonNullable<Message['payload']>>,
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
    const messageType = typeof props.payload === 'string' ? '' : props.payload.type
    return {
      alertType: mapping[messageType]
    }
  }
})
</script>

<style lang="scss" scoped>
.pre-wrap {
  white-space: pre-wrap;
}
</style>
