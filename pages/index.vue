<template>
  <v-treeview
    class="treeview"
    open-on-click
    dense
    hoverable
    :items="$store.state.parsedLog || []"
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
export default {
  data () {
    return {
      iconTypes: {
        info: 'mdi-information-outline'
      },
      openItems: []
    }
  },
  computed: {
    expandAll () {
      return this.$store.state.expandAll
    }
  },
  watch: {
    expandAll (expanded) {
      if (!expanded) {
        this.openItems = []
      } else {
        this.openItems = this.$store.state.parsedLog.map(line => line.children && line.id)
      }
    }
  }
}
</script>

<style lang="scss">
.treeview {
  padding-bottom: 90vh
}

.v-treeview-node__children .v-treeview-node__label {
  font-family: monospace !important;
  font-size: small !important;
  white-space: pre-wrap !important;
}
</style>
