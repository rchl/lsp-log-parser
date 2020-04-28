<template>
  <div>
    <v-treeview
      class="treeview"
      open-on-click
      dense
      hoverable
      activatable
      :active.sync="selection"
      :items="parsedLines"
      :search="searchModel"
      :filter="filter"
      :open="openItems"
    >
      <template v-slot:prepend="{ item }">
        <v-icon v-if="iconTypes[item.type]">
          {{ iconTypes[item.type] }}
        </v-icon>
        <v-icon v-else>
          {{ item.directionIcon }}
        </v-icon>
      </template>
    </v-treeview>
    <v-bottom-sheet v-model="bottomSheetOpen" persistent scrollable hide-overlay>
      <v-card v-if="selectedItem" class="pt-3">
        <v-card-text class="bottom-sheet-text-container">
          <h3 class="pb-3">
            <v-icon v-if="iconTypes[selectedItem.type]">
              {{ iconTypes[selectedItem.type] }}
            </v-icon>
            <v-icon v-else>
              {{ selectedItem.directionIcon }}
            </v-icon>
            {{ selectedItem.name }}
            <v-spacer />
          </h3>
          <span v-if="selectedItem.children" class="payload">{{ selectedItem.children[0].name }}</span>
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
      /** @type {boolean[]} */
      openItems: [],
      /** @type {number[]} */
      selection: [],
      /** @type {import('~/utils').Message | null} */
      selectedItem: null,
      bottomSheetOpen: false
    }
  },
  computed: {
    /** @return {boolean} */
    expandAll () {
      return this.$store.state.expandAll
    },
    /** @return {import('~/utils').Message[]} */
    parsedLines () {
      return this.$store.state.parsedLines
    },
    /** @return {string} */
    queryText () {
      return this.$store.state.queryText
    },
    /** @return {(item: import('~/utils').Message) => boolean} */
    filter () {
      return (item, _search, textKey) => {
        const matchesFilter = this.parsedFilters.length === 0 || !item.filter || this.enabledFilters.includes(item.filter)
        if (!matchesFilter) {
          return false
        }

        const matchesSearch = (!this.queryText || item[textKey].toLowerCase().includes(this.queryText))

        return matchesSearch
      }
    },
    /** @return {number[]} */
    parsedFilters () {
      return this.$store.state.parsedFilters
    },
    /** @return {string} */
    searchModel () {
      return String(this.enabledFilters) + String(this.queryText)
    },
    /** @return {string[]} */
    enabledFilters () {
      return this.$store.state.selectedFilters.map(/** @type {number} */index => this.parsedFilters[index])
    }
  },
  watch: {
    expandAll (expanded) {
      if (!expanded) {
        this.openItems = []
      } else {
        const parsedLog = this.parsedLines
        this.openItems = parsedLog
          .filter(line => Boolean(line.children))
          .map(line => line.id)
      }
    },
    parsedLines () {
      this.openItems = []
      this.$store.commit('toggleExpandAll', false)
    },
    selection (selection) {
      if (selection.length) {
        const selectedId = selection[0]
        for (const parent of this.parsedLines) {
          if (parent.children) {
            for (const child of parent.children) {
              if (child.id === selectedId) {
                this.selectedItem = parent
                this.bottomSheetOpen = true
              }
            }
          }
        }
      } else {
        this.selectedItem = null
        this.bottomSheetOpen = false
      }
    }
  }
}
</script>

<style lang="scss">
.treeview {
  padding-bottom: 30vh
}

.v-treeview-node__children .v-treeview-node__label,
.payload {
  font-family: monospace !important;
  font-size: small !important;
  white-space: pre-wrap !important;
}

.bottom-sheet-text-container {
  font-family: monospace !important;
  font-size: small !important;
  height: 30vh;
}
</style>
