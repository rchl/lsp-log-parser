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

<script lang="ts">
import { Message } from '~/utils/parsers'

export default {
  data () {
    return {
      iconTypes: {
        info: 'mdi-information-outline'
      },
      openItems: [] as boolean[]
    }
  },
  computed: {
    expandAll () {
      return this.$store.state.expandAll
    },
    parsedLines (): Message[] {
      return this.$store.state.parsedLines
    },
    filter (): (item: Message) => boolean {
      return (item) => {
        return Boolean(this.enabledFilters.length === 0 || !item.filter || this.enabledFilters.includes(item.filter))
      }
    },
    selectedFilters () {
      return this.$store.state.selectedFilters.join()
    },
    enabledFilters () {
      return this.$store.state.selectedFilters.map((index: number) => this.$store.state.parsedFilters[index])
    }
  },
  watch: {
    expandAll (expanded) {
      if (!expanded) {
        this.openItems = []
      } else {
        const parsedLog: Message[] = this.parsedLines
        this.openItems = parsedLog.map(line => Boolean(line.children && line.id))
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
