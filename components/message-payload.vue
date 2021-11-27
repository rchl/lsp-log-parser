<template>
    <div
        class="mt-2 mb-1 payload-container rounded"
        @click.stop>
        <div class="rounded overflow-hidden">
            <div
                v-if="!message.payload"
                class="grey lighten-1 text-center">
                &lt;empty&gt;
            </div>
            <template v-else>
                <v-tabs
                    v-model="selectedTabIndex"
                    light>
                    <v-tab
                        v-for="tab in messageTabs"
                        :key="tab">
                        {{ tab }}
                    </v-tab>
                </v-tabs>
                <v-tabs-items v-model="selectedTabIndex">
                    <v-tab-item
                        v-for="tab in messageTabs"
                        :key="tab">
                        <div
                            :is="renderedComponent"
                            v-if="tab === 'rendered'"
                            :payload="message.payload" />
                        <div
                            v-else
                            class="pa-2">
                            <span
                                v-if="typeof(message.payload) === 'string'"
                                class="payload payload--text">
                                {{ message.payload }}
                            </span>
                            <vue-json-pretty
                                v-else
                                :data="message.payload"
                                :show-line="false"
                                :show-double-quotes="false"
                                :highlight-mouseover-node="false"
                                class="payload"
                            />
                        </div>
                    </v-tab-item>
                </v-tabs-items>
            </template>
        </div>
    </div>
</template>

<script lang="ts">
// @ts-ignore
import VueJsonPretty from 'vue-json-pretty'
import { defineComponent } from '@vue/composition-api'
import type { PropType } from '@vue/composition-api'
import { Message } from '~/models/log-model'
import RenderedLogMessage from '~/components/rendered-payloads/log-message.vue'
import TextDocumentFormattingMessage from '~/components/rendered-payloads/text-document-formatting.vue'

export default defineComponent({
    components: {
        VueJsonPretty,
    },
    props: {
        message: {
            type: Object as PropType<Message>,
            required: true,
        },
    },
    setup(props) {
        const { message } = props

        let renderedComponent
        const messageTabs = []

        if (message.payload) {
            if (typeof (message.payload) !== 'string') {
                if (!message.toServer) {
                    if (message.name === 'window/logMessage' || message.name === 'window/showMessage') {
                        renderedComponent = RenderedLogMessage
                    } else if (message.name === 'textDocument/formatting') {
                        renderedComponent = TextDocumentFormattingMessage
                    }
                }
            }

            if (renderedComponent) {
                messageTabs.push('rendered')
            }
            messageTabs.push('raw')
        }

        return {
            selectedTabIndex: 0,
            renderedComponent,
            messageTabs,
        }
    },
})
</script>

<style lang="scss" scoped>
.payload {
  max-height: 80vh;
  overflow: auto;

  &--text {
    display: block;
    font-family: monospace !important;
    font-size: small !important;
    white-space: pre-wrap;
  }
}
</style>

<style lang="scss">
@import 'vue-json-pretty/lib/styles.css';

// Hack to max payload not overflow.
.message {
  cursor: pointer;

  .v-alert__content {
    max-width: 100%;
  }
}
</style>
