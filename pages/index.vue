<template>
  <v-app>
    <app-bar :drawer="uiModel.drawerVisible" />

    <!-- <v-navigation-drawer v-model="uiModel.drawerVisible" absolute>
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
          v-for="(item, i) in logModel.parsedLines"
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
      <h1 v-if="logModel.parsedLines.length === 0" class="base-title text-center">
        LSP Log Parser
      </h1>
      <log-view />
    </v-content>
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import appBar from '~/components/app-bar.vue'
import logView from '~/components/log-view.vue'
import { useLogModel } from '~/models/log-model'
import { useUiModel } from '~/models/ui-model'

export default defineComponent({
  components: {
    appBar,
    logView
  },
  setup () {
    const logModel = useLogModel()
    const uiModel = useUiModel()

    return {
      logModel,
      uiModel
    }
    // return {
    //   iconTypes: {
    //     info: 'mdi-information-outline'
    //   }
    // }
  }
})
</script>

<style lang="scss">
.base-title {
  font-size: 3rem;
  font-weight: 300;
  margin-top: auto;
}
</style>
