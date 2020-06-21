<template>
  <div class="pa-6">
    <v-container class="main">
      <v-alert v-if="remoteModel.connected" type="info" outlined>
        Log view is limited to {{ logModel.REMOTE_MESSAGE_COUNT_LIMIT }} latest messages
      </v-alert>

      <div v-if="logModel.parsedLines.length" class="d-flex justify-space-between mb-6">
        <h2 class="headline">
          Client
        </h2>
        <h2 class="headline">
          Server
        </h2>
      </div>

      <template v-for="line in uiModel.filteredLines">
        <div
          :key="line.id"
          class="d-flex flex-column"
          :class="{ 'text-right': !line.toServer }"
          @mouseenter="setHovered(line)"
          @mouseleave="setHovered(null)"
        >
          <div v-if="line.time || line.timeLatency !== undefined" class="caption">
            <span v-if="line.timeLatency !== undefined">{{ line.timeLatency }} ms</span>
            <span v-else>{{ line.time }}</span>
          </div>
          <v-alert
            :border="line.toServer ? 'left' : 'right'"
            :class="getMessageClass(line)"
            :color="getMessageColor(line)"
            max-width="100%"
            dark
            dense
            @click.native="line.isExpanded = !line.isExpanded"
          >
            <v-icon v-if="line.type && line.toServer" color="blue darken-3">
              {{ uiModel.ICON_TYPES[line.type] }}
            </v-icon>
            <v-chip v-if="line.serverName && line.toServer" color="blue darken-3" class="mr-2" label small>
              {{ line.serverName }}
            </v-chip>
            <span>{{ line.name }}</span>
            <v-chip v-if="line.serverName && !line.toServer" color="brown darken-3" class="ml-2" label small>
              {{ line.serverName }}
            </v-chip>
            <v-icon v-if="line.type && !line.toServer" class="h-reverse" color="brown darken-3">
              {{ uiModel.ICON_TYPES[line.type] }}
            </v-icon>
            <v-expand-transition>
              <div v-if="line.isExpanded && line.payload">
                <div class="mt-2 mb-1 payload-container rounded" @click.stop>
                  <span v-if="typeof(line.payload) === 'string'" class="pa-2 rounded payload payload--text">{{ line.payload }}</span>
                  <json-tree v-else :data="line.payload" class="payload" />
                </div>
                <div class="text-right">
                  <v-tooltip left>
                    <template v-slot:activator="{ on }">
                      <v-btn icon dark @click.stop="line && line.payload && copyToClipboard(line.payload)" v-on="on">
                        <v-icon>mdi-content-copy</v-icon>
                      </v-btn>
                    </template>
                    <span>Copy payload to clipboard</span>
                  </v-tooltip>
                </div>
              </div>
            </v-expand-transition>
          </v-alert>
        </div>
      </template>

      <div id="log-bottom" />
    </v-container>

    <v-tooltip left>
      <template v-slot:activator="{ on }">
        <v-btn
          v-shortkey="[cmdOrCtrl, 'x']"
          fixed
          :disabled="logModel.parsedLines.length === 0"
          fab
          bottom
          right
          color="primary"
          @click="logModel.clearMessages()"
          @shortkey.native="logModel.clearMessages()"
          v-on="on"
        >
          <v-icon>mdi-playlist-remove</v-icon>
        </v-btn>
      </template>
      <span>Clear log view ({{ cmdOrCtrl }}-X)</span>
    </v-tooltip>
  </div>
</template>

<script lang="ts">
// @ts-ignore
import JsonTree from 'vue-json-tree'
import { defineComponent, onMounted, onUnmounted, ref, watch } from '@vue/composition-api'
import { useLogModel, Message } from '~/models/log-model'
import { useRemoteModel } from '~/models/remote-model'
import { useUiModel } from '~/models/ui-model'

export default defineComponent({
  components: {
    JsonTree
  },
  setup () {
    const logModel = useLogModel()
    const remoteModel = useRemoteModel()
    const uiModel = useUiModel()

    async function copyToClipboard (data: any) {
      try {
        const text = typeof (data) === 'string' ? data : JSON.stringify(data, null, 2)
        await navigator.clipboard.writeText(text)
      } catch (error) {
        uiModel.showError(error.message)
      }
    }

    class ScrollTracker {
      _timeout: NodeJS.Timeout | null
      _onScrollBound: EventListener
      isScrolledToBottom: boolean

      constructor () {
        this._timeout = null
        this._onScrollBound = () => this.onScroll()
        this.isScrolledToBottom = false
      }

      start () {
        window.addEventListener('scroll', this._onScrollBound)
        this.updateIsScrolledToBottom()
      }

      stop () {
        window.removeEventListener('scroll', this._onScrollBound)
      }

      onScroll () {
        if (this._timeout) {
          clearTimeout(this._timeout)
        }

        this._timeout = setTimeout(() => this.updateIsScrolledToBottom(), 100)
      }

      updateIsScrolledToBottom () {
        this.isScrolledToBottom = (window.scrollY + window.innerHeight) === document.body.scrollHeight
      }
    }

    const scrollTracker = new ScrollTracker()

    // Scroll to bottom if anchored to bottom.
    watch(logModel.parsedLines, () => {
      if (scrollTracker.isScrolledToBottom) {
        const logBottomElement = document.querySelector('#log-bottom') as HTMLElement
        logBottomElement.scrollIntoView()
      }
    })

    onMounted(() => {
      scrollTracker.start()
    })

    onUnmounted(() => {
      scrollTracker.stop()
    })

    const state = {
      hoveredPairKey: ref('')
    }

    function setHovered (message: Message | null) {
      if (message && message.pairKey) {
        state.hoveredPairKey.value = message.pairKey
      } else {
        state.hoveredPairKey.value = ''
      }
    }

    function getMessageClass (message: Message) {
      const classes = ['message', 'd-inline-block']

      if (message.toServer) {
        classes.push('mr-auto')
      } else {
        classes.push('ml-auto text-right')
      }

      return classes
    }

    function getMessageColor (message: Message) {
      if (state.hoveredPairKey.value && state.hoveredPairKey.value === message.pairKey) {
        return 'orange darken-2'
      }

      if (message.isError) {
        return 'red'
      }

      return message.toServer ? 'blue lighten-1' : 'brown'
    }

    return {
      copyToClipboard,
      logModel,
      getMessageClass,
      getMessageColor,
      remoteModel,
      setHovered,
      uiModel
    }
  }
})
</script>

<style lang="scss" scoped>
.main {
  max-width: 800px !important;
}

.message {
  cursor: pointer;
}

.h-reverse {
  transform: scaleX(-1);
}

.payload-container {
  cursor: initial;
  text-align: left;
}

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

#log-bottom {
  height: 1px;
}
</style>

<style>
.json-tree-sign {
  color: lightgrey;
}

.json-tree-value {
  white-space: pre-wrap !important;
}
</style>
