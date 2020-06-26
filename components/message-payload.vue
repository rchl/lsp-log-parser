<template>
  <div class="mt-2 mb-1 payload-container rounded" @click.stop>
    <div class="rounded overflow-hidden">
      <v-tabs v-model="message.payloadTabIndex" light>
        <v-tab v-for="tab in messageTabs" :key="tab">
          {{ tab }}
        </v-tab>
      </v-tabs>
      <v-tabs-items v-model="message.payloadTabIndex">
        <v-tab-item v-for="tab in messageTabs" :key="tab">
          <div :is="renderedComponent" v-if="tab === 'rendered'" :payload="message.payload" />
          <template v-else>
            <span v-if="typeof(message.payload) === 'string'" class="pa-2 payload payload--text">{{ message.payload }}</span>
            <json-tree v-else :data="message.payload" class="payload" />
          </template>
        </v-tab-item>
      </v-tabs-items>
    </div>
  </div>
</template>

<script lang="ts">
// @ts-ignore
import JsonTree from 'vue-json-tree'
import { defineComponent, PropType } from '@vue/composition-api'
import { Message } from '~/models/log-model'
import RenderedLogMessage from '~/components/rendered-payloads/log-message.vue'

export default defineComponent({
  components: {
    JsonTree
  },
  props: {
    message: {
      type: Object as PropType<Message>,
      required: true
    }
  },
  setup (props) {
    const { message } = props

    let renderedComponent
    const messageTabs = []

    if (message.payload) {
      if (typeof (message.payload) !== 'string') {
        if (!message.toServer) {
          if (message.name === 'window/logMessage' || message.name === 'window/showMessage') {
            renderedComponent = RenderedLogMessage
          }
        }
      }

      if (renderedComponent) {
        messageTabs.push('rendered')
      }
      messageTabs.push('raw')
    }

    return {
      renderedComponent,
      messageTabs
    }
  }
})
</script>

<style lang="scss" scoped>
.payload {
  max-height: 80vh;
  overflow: auto;

  &--text {
    background: #fff;
    color: #000;
    display: block;
    font-family: monospace !important;
    font-size: small !important;
    white-space: pre-wrap;
  }
}
</style>

<style lang="scss">
// Hack to max payload not overflow.
.message {
  cursor: pointer;

  .v-alert__content {
    max-width: 100%;
  }
}
</style>
