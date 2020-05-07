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
          :class="[line.toServer ? 'mr-auto' : 'ml-auto text-right', 'd-inline-block', { 'selected': line === selectedItem }]"
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

    <v-bottom-sheet v-model="bottomSheetOpen" scrollable>
      <v-card v-if="selectedItem" class="pt-3">
        <v-card-text class="bottom-sheet-text-container">
          <h3 class="pb-3">
            <v-icon v-if="iconTypes[selectedItem.type]">
              {{ iconTypes[selectedItem.type] }}
            </v-icon>
            {{ selectedItem.name }}
            <v-spacer />
          </h3>
          <span v-if="selectedItem.child" class="payload">{{ selectedItem.child.name }}</span>
        </v-card-text>
      </v-card>
    </v-bottom-sheet>
  </div>
</template>

<script>
export default {
  data () {
    return {
      iconTypes: {
        info: 'mdi-information-outline'
      },
      /** @type {import('~/utils').Message | null} */
      selectedItem: null,
      bottomSheetOpen: false
    }
  },
  computed: {
    /** @return {import('~/utils').Message[]} */
    parsedLines () {
      return this.$store.state.parsedLines
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
    parsedLines () {
      this.openItems = []
      this.bottomSheetOpen = false
      this.selectedItem = null
    }
  },
  methods: {
    /** @param {Message} */
    selectItem (line) {
      this.selectedItem = line
      this.bottomSheetOpen = true
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
  height: 30vh;
}
</style>
