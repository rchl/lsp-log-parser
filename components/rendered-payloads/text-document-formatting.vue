<template>
  <div v-if="typeof payload !== 'string'">
    <v-expansion-panels hover>
      <v-expansion-panel v-for="(change, index) in payload" :key="index">
        <v-expansion-panel-header>
          <div>start: line {{ change.range.start.line }}, character {{ change.range.start.character }}</div>
          <div>end: line {{ change.range.end.line }}, character {{ change.range.end.character }}</div>
        </v-expansion-panel-header>
        <v-expansion-panel-content class="change-body">
          <pre class="change-text">{{ change.newText }}</pre>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script lang="ts">
import type { PropType } from '@vue/composition-api'
import { defineComponent } from '@vue/composition-api'
import { Message } from '~/models/log-model'

export default defineComponent({
  props: {
    payload: {
      type: Array as PropType<NonNullable<Message['payload']>>,
      required: true
    }
  },
  setup () {
    return {}
  }
})
</script>

<style lang="scss" scoped>
.change-body {
  max-height: 70vh;
  overflow: auto;
  white-space: pre;
}

.change-text {
  display: inline-block;
}
</style>
