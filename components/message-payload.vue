<template>
    <div
        class="mt-2 mb-1 payload-container rounded"
        @click.stop>
        <div class="rounded overflow-hidden">
            <div
                v-if="!message.payload"
                class="bg-grey-lighten-1 text-center">
                &lt;empty&gt;
            </div>
            <template v-else>
                <v-tabs v-model="selectedTabIndex">
                    <v-tab
                        v-for="tab in messageTabs"
                        :key="tab">
                        {{ tab }}
                    </v-tab>
                </v-tabs>
                <v-window v-model="selectedTabIndex">
                    <v-window-item
                        v-for="tab in messageTabs"
                        :key="tab"
                    >
                        <template v-if="tab === 'rendered'">
                            <payload-formatter-log-message
                                v-if="payloadFormatter === 'payload-formatter-log-message'"
                                :payload="message.payload" />
                            <payload-formatter-text-document-formatting-message
                                v-if="payloadFormatter === 'payload-formatter-text-document-formatting-message'"
                                :payload="message.payload" />
                            <payload-formatter-semantic-tokens
                                v-if="payloadFormatter === 'payload-formatter-semantic-tokens'"
                                :payload="message.payload"
                                :token-legend="message.extraData" />
                        </template>
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
                                show-icon
                                :show-line="false"
                                :show-double-quotes="false"
                                :highlight-mouseover-node="false"
                                class="payload"
                            />
                        </div>
                    </v-window-item>
                </v-window>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import VueJsonPretty from 'vue-json-pretty'
import { type Message } from '~/models/log-model'

const props = defineProps<{
    message: Message
}>()

const payloadFormatter = computed((): string | undefined => {
    const message = props.message
    if (!message.payload || typeof (message.payload) === 'string') {
        return
    }
    if (message.toServer) {
        return
    }
    if (message.name === 'window/logMessage' || message.name === 'window/showMessage') {
        return 'payload-formatter-log-message'
    }
    if (message.name === 'textDocument/formatting') {
        return 'payload-formatter-text-document-formatting-message'
    }
    if (message.name === 'textDocument/semanticTokens/full' || message.name === 'textDocument/semanticTokens/range') {
        return 'payload-formatter-semantic-tokens'
    }
    return undefined
})
const selectedTabIndex = ref(0)
const messageTabs = computed(() => {
    if (payloadFormatter.value) {
        return ['rendered', 'raw']
    }
    return ['raw']
})
</script>

<script lang="ts">
import { defineComponent } from 'vue'
import PayloadFormatterLogMessage from '~/components/payload-formatter/log-message.vue'
import PayloadFormatterTextDocumentFormattingMessage from '~/components/payload-formatter/text-document-formatting.vue'
import PayloadFormatterSemanticTokens from '~/components/payload-formatter/semantic-tokens.vue'

export default defineComponent({
    components: {
        PayloadFormatterLogMessage,
        PayloadFormatterTextDocumentFormattingMessage,
        PayloadFormatterSemanticTokens,
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
@import url('vue-json-pretty/lib/styles.css');

// Hack to max payload not overflow.
.message {
  cursor: pointer;

  /* stylelint-disable-next-line selector-class-pattern */
  .v-alert__content {
    max-width: 100%;
  }
}
</style>
