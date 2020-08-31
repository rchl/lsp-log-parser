<template>
  <v-app>
    <app-bar />
    <app-drawer />
    <v-main>
      <h1 v-if="logModel.parsedLines.length === 0" class="base-title text-center">
        LSP Log Parser
      </h1>
      <log-view v-else class="height-100" />

      <v-dialog v-model="uiModel.errorDialogVisible" max-width="290">
        <v-card>
          <v-card-title class="headline">
            Error
          </v-card-title>

          <v-card-text>
            {{ uiModel.errorDialogText }}
          </v-card-text>

          <v-card-actions>
            <v-spacer />

            <v-btn color="primary" text @click="uiModel.errorDialogVisible = false">
              Close
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'
import appBar from '~/components/app-bar.vue'
import appDrawer from '~/components/app-drawer.vue'
import logView from '~/components/log-view.vue'
import { useLogModel } from '~/models/log-model'
import { useUiModel } from '~/models/ui-model'

export default defineComponent({
  components: {
    appBar,
    appDrawer,
    logView
  },
  setup () {
    return {
      logModel: reactive(useLogModel()),
      uiModel: reactive(useUiModel())
    }
  }
})
</script>

<style lang="scss">
.base-title {
  display: flex;
  flex-direction: column;
  font-size: 3rem;
  font-weight: 300;
  height: 100%;
  justify-content: center;
}

.height-100 {
  height: 100%;
}
</style>
