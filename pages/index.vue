<template>
    <v-app>
        <app-drawer />
        <app-bar />
        <v-main>
            <div
                v-if="logModel.parsedLines.length === 0"
                class="base-title text-center pa-8">
                <h2 class="text-h2">LSP Log Parser</h2>
                <h3 class="text-subtitle-1 mt-4">To establish connection to the local Sublime Text LSP instance, enable the <code>"log_server": ["panel", "remote"]</code> LSP setting, restart ST and press the Connect button.</h3>
            </div>
            <log-view
                v-else
                class="height-100" />

            <v-dialog
                v-model="uiModel.errorDialogVisible"
                max-width="290">
                <v-card>
                    <v-card-title class="text-h5">Error</v-card-title>

                    <v-card-text>{{ uiModel.errorDialogText }}</v-card-text>

                    <v-card-actions>
                        <v-spacer />

                        <v-btn
                            color="primary"
                            variant="text"
                            @click="uiModel.errorDialogVisible = false"
                        >
                            Close
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-main>
    </v-app>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import appBar from '~/components/app-bar.vue'
import appDrawer from '~/components/app-drawer.vue'
import logView from '~/components/log-view.vue'
import { useLogModel } from '~/models/log-model'
import { useUiModel } from '~/models/ui-model'

const logModel = reactive(useLogModel())
const uiModel = reactive(useUiModel())
</script>

<style lang="scss">
.base-title {
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
}

.height-100 {
  height: 100%;
}
</style>
