<template>
  <v-treeview
    class="treeview"
    open-on-click
    dense
    hoverable
    :items="parsedLines"
    :search="selectedFilters"
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
</template>

<script>
export default {
  data () {
    return {
      iconTypes: {
        info: 'mdi-information-outline'
      },
      /** @type {boolean[]} */
      openItems: []
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
    /** @return {(item: import('~/utils').Message) => boolean} */
    filter () {
      return (item) => {
        return Boolean(this.enabledFilters.length === 0 || !item.filter || this.enabledFilters.includes(item.filter))
      }
    },
    /** @return {string} */
    selectedFilters () {
      return this.$store.state.selectedFilters.join()
    },
    /** @reutrn {string[]} */
    enabledFilters () {
      return this.$store.state.selectedFilters.map(/** @type {number} */index => this.$store.state.parsedFilters[index])
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
    }
  }
}
</script>

<style lang="scss">
.treeview {
  padding-bottom: 30vh
}

.v-treeview-node__children .v-treeview-node__label {
  font-family: monospace !important;
  font-size: small !important;
  white-space: pre-wrap !important;
}
</style>
