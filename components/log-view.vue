<template>
  <div class="pa-6">
    <v-container class="main">
      <!-- <v-navigation-drawer v-model="uiModel.drawerVisible" permanent absolute>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title class="title">
              Servers
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-divider />
        <v-list dense>
          <v-list-item
            v-for="(item, i) in logModel.parsedLines"
            :key="item.id"
            link
            @click="$vuetify.goTo(`.treeview > div:nth-child(${i})`)"
          >
            <v-list-item-icon>
              <v-icon v-if="item.type && uiModel.ICON_TYPES[item.type]">
                {{ uiModel.ICON_TYPES[item.type] }}
              </v-icon>
            <v-icon v-else>
              {{ item.directionIcon }}
            </v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title v-text="item.name" />
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-navigation-drawer> -->

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

      <template v-for="line in filteredLines">
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
            dark
            dense
            @click.native="line.isExpanded = !line.isExpanded"
          >
            <v-icon v-if="line.type && line.toServer" color="blue darken-3">
              {{ uiModel.ICON_TYPES[line.type] }}
            </v-icon>
            <v-chip v-if="line.serverName && line.toServer" color="blue darken-3" class="mr-2" label>
              {{ line.serverName }}
            </v-chip>
            <span>{{ line.name }}</span>
            <v-chip v-if="line.serverName && !line.toServer" color="brown darken-3" class="ml-2" label>
              {{ line.serverName }}
            </v-chip>
            <v-icon v-if="line.type && !line.toServer" class="h-reverse" color="brown darken-3">
              {{ uiModel.ICON_TYPES[line.type] }}
            </v-icon>
            <v-expand-transition>
              <div v-if="line.isExpanded && line.payload">
                <div class="pa-2 mt-2 mb-1 payload-container rounded white black--text" @click.stop>
                  <span class="payload">{{ line.payload }}</span>
                  <div class="text-right">
                    <v-btn icon light @click.stop="line && line.payload && copyToClipboard(line.payload)">
                      <v-icon>mdi-content-copy</v-icon>
                    </v-btn>
                  </div>
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
import { defineComponent, computed, onMounted, onUnmounted, ref, watch } from '@vue/composition-api'
import { useLogModel } from '~/models/log-model'
import { useRemoteModel } from '~/models/remote-model'
import { useUiModel } from '~/models/ui-model'
import { Message } from '~/utils'

export default defineComponent({
  setup () {
    const logModel = useLogModel()
    const remoteModel = useRemoteModel()
    const uiModel = useUiModel()

    const enabledFilters = computed<string[]>(() => {
      return logModel.selectedFilters.value
        .filter(filter => filter.enabled)
        .map(filter => filter.name)
    })

    const filteredLines = computed(() => {
      return logModel.parsedLines.value.filter((line) => {
        const matchesFilter = logModel.parsedFilters.value.length === 0 || !line.serverName || enabledFilters.value.includes(line.serverName)
        if (!matchesFilter) {
          return false
        }

        return !uiModel.queryText.value || (line.name && line.name.toLowerCase().includes(uiModel.queryText.value.toLowerCase()))
      })
    })

    async function copyToClipboard (data: any) {
      try {
        const text = JSON.stringify(data, null, 2)
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
      if (message.isError) {
        return 'red'
      }

      if (state.hoveredPairKey.value && state.hoveredPairKey.value === message.pairKey) {
        return 'orange darken-2'
      }

      return message.toServer ? 'blue lighten-1' : 'brown'
    }

    return {
      copyToClipboard,
      filteredLines,
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
  display: block;
  font-family: monospace !important;
  font-size: small !important;
  max-height: 80vh;
  overflow: auto;
  white-space: pre-wrap;
}

#log-bottom {
  height: 1px;
}
</style>
