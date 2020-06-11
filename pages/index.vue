<template>
  <v-app>
    <app-bar :drawer="drawerVisible" />

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
      <log-view />
    </v-content>
  </v-app>
</template>

<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import appBar from '~/components/app-bar.vue'
import logView from '~/components/log-view.vue'
import { Message } from '~/utils'

export default defineComponent({
  components: {
    appBar,
    logView
  },
  setup (_props, context) {
    const parsedLines = computed<Message[]>(() => context.root.$store.state.parsedLines)
    const drawerVisible = computed<Boolean>(() => context.root.$store.state.drawerVisible)

    return {
      drawerVisible,
      parsedLines
    }
    // return {
    //   iconTypes: {
    //     info: 'mdi-information-outline'
    //   }
    // }
  }
})
</script>
