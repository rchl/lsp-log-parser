<template>
  <div class="pa-6">
    <v-container class="d-flex flex-column">
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
          v-if="line.time"
          :key="`${line.id}t`"
          class="caption"
          :class="{ 'text-right': !line.toServer }"
        >
          {{ line.time }}
        </div>
        <v-alert
          :key="line.id"
          :border="line.toServer ? 'left' : 'right'"
          :class="[line.toServer ? 'mr-auto' : 'ml-auto text-right', 'd-inline-block', { 'selected': line === uiModel.selectedLine }]"
          :color="line.isError ? 'red' : (line.toServer ? 'blue lighten-1' : 'brown')"
          :icon="getIconForLineType(line.type)"
          dark
          dense
          max-width="70%"
          @click.native="uiModel.setSelectedMessage(line)"
        >
          <v-chip v-if="line.filter && line.toServer" color="blue darken-3 mr-2">
            {{ line.filter }}
          </v-chip>
          <span class="font-weight-medium">{{ line.name }}</span>
          <span v-if="line.requestId">({{ line.requestId }})</span>
          <v-chip v-if="line.filter && !line.toServer" color="brown darken-3 ml-2">
            {{ line.filter }}
          </v-chip>
          <div
            v-if="line.child"
            class="text-no-wrap inline-payload my-2"
          >
            {{ line.child.name }}
          </div>
        </v-alert>
      </template>
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
          <h3 class="pb-3">
            <v-icon v-if="getIconForLineType(uiModel.selectedLine.type)">
              {{ getIconForLineType(uiModel.selectedLine.type) }}
            </v-icon>
            {{ uiModel.selectedLine.name }}
            <v-spacer />
          </h3>
          <span v-if="uiModel.selectedLine.child" class="payload">{{ uiModel.selectedLine.child.name }}</span>
        </v-card-text>
      </v-card>
    </v-bottom-sheet>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, reactive, toRef, watch, watchEffect } from '@vue/composition-api'
import { useLogModel } from '~/models/log-model'
import { useUiModel } from '~/models/ui-model'

export default defineComponent({
  setup () {
    const state = reactive({
      sheetInternalOpen: false
    })

    const logModel = useLogModel()
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

        return !uiModel.queryText.value || line.name.toLowerCase().includes(uiModel.queryText.value.toLowerCase())
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

    const iconTypes = computed<Record<string, string>>(() => ({ info: 'mdi-information-outline' }))

    function getIconForLineType (type: string | undefined): string | undefined {
      if (type && type in iconTypes.value) {
        return iconTypes.value[type]
      }
    }

    return {
      enabledFilters,
      filteredLines,
      getIconForLineType,
      iconTypes,
      logModel,
      state,
      uiModel
    }
  }
})
</script>

<style lang="scss">
.v-alert {
  cursor: pointer;

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
