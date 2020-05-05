<template>
  <v-app>
    <app-bar :drawer="$store.state.drawerVisible" />

    <!-- <v-navigation-drawer v-model="$store.state.drawerVisible" absolute>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title class="title">
            Messages
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-divider />
      <v-list dense>
        <v-list-item
          v-for="(item, i) in parsedLines"
          :key="item.id"
          link
          @click="$vuetify.goTo(`.treeview > div:nth-child(${i})`)"
        >
          <v-list-item-icon>
            <v-icon v-if="iconTypes[item.type]">
              {{ iconTypes[item.type] }}
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

    <v-content>
      <log-tree-view />
    </v-content>
  </v-app>
</template>

<script>
import appBar from '~/components/app-bar.vue'
import logTreeView from '~/components/log-tree-view.vue'

export default {
  components: {
    appBar,
    logTreeView
  },
  data () {
    return {
      iconTypes: {
        info: 'mdi-information-outline'
      }
    }
  },
  computed: {
    /** @return {import('~/utils').Message[]} */
    parsedLines () {
      return this.$store.state.parsedLines
    }
  }
}
</script>
