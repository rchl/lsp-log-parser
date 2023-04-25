<template>
    <div class="pa-6">
        <v-container class="main">
            <v-alert
                v-if="remoteModel.connected.value"
                type="info"
                variant="outlined">
                Log view is limited to {{ logModel.REMOTE_MESSAGE_COUNT_LIMIT }} latest messages
            </v-alert>

            <div
                v-if="logModel.parsedLines.value.length"
                class="d-flex justify-space-between mb-6">
                <h2 class="text-h5">
                    Client
                </h2>
                <h2 class="text-h5">
                    Server
                </h2>
            </div>

            <div
                v-for="line in uiModel.filteredLines.value"
                :key="line.id"
                class="d-flex flex-column"
                :class="{ 'text-right': !line.toServer }"
                @mouseenter="setHovered(line)"
                @mouseleave="setHovered(null)"
            >
                <div
                    v-if="line.time || line.timeLatency !== undefined"
                    class="text-caption"
                >
                    {{ line.time }}<span v-if="line.timeLatency !== undefined"> (self: {{ line.timeLatency }} ms)</span>
                </div>
                <v-alert
                    :border="line.toServer ? 'start' : 'end'"
                    :class="getMessageClass(line)"
                    :color="getMessageColor(line)"
                    max-width="100%"
                    :min-width="line.isExpanded ? '100%' : '0'"
                    density="compact"
                    @click.native="toggleExpand(line)"
                >
                    <v-icon
                        v-if="line.type && line.toServer"
                        color="blue-darken-3"
                        class="mr-2"
                    >
                        {{ uiModel.ICON_TYPES[line.type] }}
                    </v-icon>
                    <v-chip
                        v-if="line.serverName && line.toServer"
                        color="blue-darken-3"
                        class="mr-2"
                        variant="elevated"
                        size="small"
                        label
                    >
                        {{ line.serverName }}
                    </v-chip>
                    <span>{{ line.name }}</span> <small v-if="line.requestId !== undefined">{{ `[${line.requestId}]` }}</small>
                    <v-chip
                        v-if="line.serverName && !line.toServer"
                        color="brown-darken-3"
                        class="ml-2 mr-2"
                        variant="elevated"
                        size="small"
                        label
                    >
                        {{ line.serverName }}
                    </v-chip>
                    <v-icon
                        v-if="line.type && !line.toServer"
                        class="h-reverse"
                        color="brown-darken-3"
                    >
                        {{ uiModel.ICON_TYPES[line.type] }}
                    </v-icon>
                    <v-expand-transition>
                        <div v-if="!line.isExpanded">
                            <div
                                class="text-caption text-truncate pa-1 mt-1 rounded"
                                :class="getPayloadSummaryColor(line)"
                            >
                                {{ line.payloadSummary || line.payload || '(empty)' }}
                            </div>
                        </div>
                    </v-expand-transition>
                    <v-expand-transition>
                        <div v-if="line.isExpanded">
                            <message-payload :message="line" />
                            <div
                                v-if="line.payload"
                                class="text-right">
                                <v-btn
                                    @click.stop="line && copyToClipboard(line.payload)">
                                    <v-icon>mdi-content-copy</v-icon>
                                    Copy payload
                                </v-btn>
                            </div>
                        </div>
                    </v-expand-transition>
                </v-alert>
            </div>

            <div id="log-bottom"></div>
        </v-container>
    </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useLogModel, Message } from '~/models/log-model'
import { useRemoteModel } from '~/models/remote-model'
import { useUiModel } from '~/models/ui-model'

const logModel = useLogModel()
const uiModel = useUiModel()
const remoteModel = useRemoteModel()

const state = {
    hoveredPairKey: ref(''),
}

async function copyToClipboard(data: unknown) {
    try {
        const text = typeof (data) === 'string' ? data : JSON.stringify(data, null, 2)
        await navigator.clipboard.writeText(text)
    } catch (error) {
        if (error instanceof Error) {
            uiModel.showError(error.message)
        }
    }
}

class ScrollTracker {
    // eslint-disable-next-line no-undef
    _timeout: NodeJS.Timeout | null
    // eslint-disable-next-line no-undef
    _onScrollBound: EventListener
    isScrolledToBottom: boolean

    constructor() {
        this._timeout = null
        this._onScrollBound = () => this.onScroll()
        this.isScrolledToBottom = false
    }

    start() {
        window.addEventListener('scroll', this._onScrollBound)
        this.updateIsScrolledToBottom()
    }

    stop() {
        window.removeEventListener('scroll', this._onScrollBound)
    }

    onScroll() {
        if (this._timeout) {
            clearTimeout(this._timeout)
        }

        this._timeout = setTimeout(() => this.updateIsScrolledToBottom(), 100)
    }

    updateIsScrolledToBottom() {
        this.isScrolledToBottom = (window.scrollY + window.innerHeight) === document.body.scrollHeight
    }
}

const scrollTracker = new ScrollTracker()

// Scroll to bottom if anchored to bottom.
watch(logModel.parsedLines, () => {
    if (scrollTracker.isScrolledToBottom) {
        const logBottomElement = document.querySelector('#log-bottom') as HTMLElement
        logBottomElement.scrollIntoView({ block: 'start', behavior: 'smooth' })
    }
})

onMounted(() => {
    scrollTracker.start()
})

onUnmounted(() => {
    scrollTracker.stop()
})

function setHovered(message: Message | null) {
    if (message && message.pairKey) {
        state.hoveredPairKey.value = message.pairKey
    } else {
        state.hoveredPairKey.value = ''
    }
}

function toggleExpand(message: Message) {
    message.isExpanded = !message.isExpanded && message.payload !== undefined
}

function getMessageClass(message: Message) {
    return ['message', 'd-inline-block', `l-${message.id}`, message.toServer ? 'mr-auto' : 'ml-auto text-right']
}

function getMessageColor(message: Message) {
    let color
    if (state.hoveredPairKey.value && state.hoveredPairKey.value === message.pairKey) {
        color = 'orange'
    } else if (message.isError) {
        color = 'red-lighten-2'
    } else {
        color = message.toServer ? 'blue' : 'brown'
    }
    return color
}

function getPayloadSummaryColor(message: Message) {
    let color = ''
    if (message.isError) {
        color = 'bg-red-lighten-3'
    } else {
        color = message.toServer ? 'bg-blue-lighten-3' : 'bg-brown-lighten-3'
    }

    return `${color} text-grey-darken-3`
}
</script>

<style lang="scss" scoped>
.main {
  max-width: 800px !important;
  scroll-padding: 80px 0 0 0;
}

.message {
  cursor: pointer;
}

.h-reverse {
  transform: scaleX(-1);
}

.overflow-hidden {
  overflow: hidden;
}

.payload-container {
  background: #fff;
  color: #000;
  cursor: initial;
  text-align: left;
}

#log-bottom {
  height: 1px;
}
</style>

<style>
/* stylelint-disable selector-class-pattern */

.vjs-tree {
  font-family: Menlo, Monaco, Consolas, 'Bitstream Vera Sans Mono', monospace;
  font-size: 12px;
}

.vjs-value__string {
  color: #298613 !important;
  white-space: pre-wrap !important;
}
</style>
