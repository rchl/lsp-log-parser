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

      <v-scale-transition
        appear
        group
        tag="div"
        class="d-flex flex-column"
      >
        <template v-for="line in filteredLines">
          <div
            v-if="line.time"
            :key="`${line.id}t`"
            class="caption"
            :class="{ 'text-right': !line.toServer }"
          >
            {{ line.time }}
          </div>
          <v-alert
            :key="`${line.id}p`"
            :border="line.toServer ? 'left' : 'right'"
            :class="[line.toServer ? 'mr-auto' : 'ml-auto text-right', 'd-inline-block', { 'selected': line === uiModel.selectedLine }]"
            :color="line.isError ? 'red' : (line.toServer ? 'blue lighten-1' : 'brown')"
            :icon="line.type && uiModel.ICON_TYPES[line.type]"
            dark
            dense
            max-width="70%"
            @click.native="uiModel.setSelectedMessage(line)"
          >
            <v-chip v-if="line.filter && line.toServer" color="blue darken-3 mr-2" label>
              {{ line.filter }}
            </v-chip>
            <span class="font-weight-medium">{{ line.name }}</span>
            <span v-if="line.requestId">({{ line.requestId }})</span>
            <v-chip v-if="line.filter && !line.toServer" color="brown darken-3 ml-2" label>
              {{ line.filter }}
            </v-chip>
            <div
              v-if="line.summary"
              class="text-no-wrap inline-payload my-2"
            >
              {{ line.summary }}
            </div>
          </v-alert>
        </template>
      </v-scale-transition>
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

    <v-bottom-sheet v-model="state.sheetInternalOpen" scrollable>
      <v-card v-if="uiModel.selectedLine" class="pt-3">
        <v-card-text class="bottom-sheet-text-container">
          <div class="d-flex">
            <h3 class="pb-3 flex-grow-1">
              <v-icon v-if="uiModel.selectedLine.type && uiModel.ICON_TYPES[uiModel.selectedLine.type]">
                {{ uiModel.ICON_TYPES[uiModel.selectedLine.type] }}
              </v-icon>
              {{ uiModel.selectedLine.name }}
              <v-spacer />
            </h3>
            <v-btn @click="uiModel.selectedLine && uiModel.selectedLine.child && copyoClipboard(uiModel.selectedLine.child.name)">
              Copy to clipboard
            </v-btn>
          </div>
          <span v-if="uiModel.selectedLine.child" class="payload">{{ uiModel.selectedLine.child.name }}</span>
        </v-card-text>
      </v-card>
    </v-bottom-sheet>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, reactive, toRef, watch, watchEffect } from '@vue/composition-api'
import { useLogModel } from '~/models/log-model'
import { useRemoteModel } from '~/models/remote-model'
import { useUiModel } from '~/models/ui-model'

export default defineComponent({
  setup () {
    const state = reactive({
      sheetInternalOpen: false
    })

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
        const matchesFilter = logModel.parsedFilters.value.length === 0 || !line.filter || enabledFilters.value.includes(line.filter)
        if (!matchesFilter) {
          return false
        }

        return !uiModel.queryText.value || (line.name && line.name.toLowerCase().includes(uiModel.queryText.value.toLowerCase()))
      })
    })

    watchEffect(() => {
      state.sheetInternalOpen = uiModel.bottomSheetOpen.value
    })
    watch(toRef(state, 'sheetInternalOpen'), (open) => {
      if (!open) {
        uiModel.setSelectedMessage(null)
      }
    })

    async function copyoClipboard (data: any) {
      try {
        const text = JSON.stringify(data, null, 2)
        await navigator.clipboard.writeText(text)
      } catch (error) {
        uiModel.showError(error.message)
      }
    }

    return {
      copyoClipboard,
      filteredLines,
      logModel,
      remoteModel,
      state,
      uiModel
    }
  }
})
</script>

<style lang="scss" scoped>
.main {
  max-width: 800px !important;
}
</style>

<style lang="scss">
.v-alert {
  cursor: pointer;
  will-change: transform;

  &:hover {
    transform: scale(1.05);
  }

  * {
    overflow: hidden;
  }
}

.inline-payload {
  font-family: monospace;
  font-size: smaller;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.payload {
  white-space: pre-wrap;
}

.bottom-sheet-text-container {
  font-family: monospace !important;
  font-size: small !important;
  height: 50vh;
}
</style>
