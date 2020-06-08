<template>
  <div class="pa-6">
    <v-container class="log-container d-flex flex-column">
      <div v-if="parsedLines.length" class="d-flex justify-space-between mb-6">
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
          :key="line.id + 't'"
          class="caption"
          :class="{ 'text-right': !line.toServer }"
        >
          {{ line.time }}
        </div>
        <v-alert
          :key="line.id"
          :border="line.toServer ? 'left' : 'right'"
          :class="[line.toServer ? 'mr-auto' : 'ml-auto text-right', 'd-inline-block', { 'selected': line === selectedLine }]"
          :color="line.toServer ? 'blue lighten-1' : 'brown'"
          :icon="iconTypes[line.type]"
          dark
          dense
          max-width="70%"
          @click.native="selectItem(line)"
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

    <v-bottom-sheet :value="bottomSheetOpen" scrollable>
      <v-card v-if="selectedLine" class="pt-3">
        <v-card-text class="bottom-sheet-text-container">
          <h3 class="pb-3">
            <v-icon v-if="iconTypes[selectedLine.type]">
              {{ iconTypes[selectedLine.type] }}
            </v-icon>
            {{ selectedLine.name }}
            <v-spacer />
          </h3>
          <span v-if="selectedLine.child" class="payload">{{ selectedLine.child.name }}</span>
        </v-card-text>
      </v-card>
    </v-bottom-sheet>
  </div>
</template>

<script>
export default {
  data () {
    return {
      sheetInternalOpen: false,
      iconTypes: {
        info: 'mdi-information-outline'
      }
    }
  },
  computed: {
    /** @return {import('~/utils').Message[]} */
    parsedLines () {
      return this.$store.state.parsedLines
    },
    /** @return {import('~/utils').Message | null} */
    selectedLine () {
      return this.$store.state.selectedLine
    },
    /** @return {boolean} */
    bottomSheetOpen () {
      return this.$store.state.bottomSheetOpen
    },
    filteredLines () {
      return this.parsedLines.filter((line) => {
        const matchesFilter = this.parsedFilters.length === 0 || !line.filter || this.enabledFilters.includes(line.filter)
        if (!matchesFilter) {
          return false
        }

        return !this.queryText || line.name.toLowerCase().includes(this.queryText.toLowerCase())
      })
    },
    /** @return {string} */
    queryText () {
      return this.$store.state.queryText
    },
    /** @return {number[]} */
    parsedFilters () {
      return this.$store.state.parsedFilters
    },
    /** @return {string[]} */
    enabledFilters () {
      return this.$store.state.selectedFilters.map(/** @type {number} */index => this.parsedFilters[index])
    }
  },
  watch: {
    sheetInternalOpen (open) {
      if (!open) {
        this.$store.commit('setSelectedLine', null)
      }
    }
  },
  methods: {
    /** @param {Message} */
    selectItem (line) {
      this.$store.commit('setSelectedLine', line)
    }
  }
}
</script>

<style lang="scss">
.log-container {
  max-width: 900px;
}

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
