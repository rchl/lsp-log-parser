<template>
    <v-app>
        <app-drawer />
        <app-bar />
        <v-main>
            <div
                v-if="logModel.parsedLines.length === 0"
                class="base-title text-center pa-8"
            >
                <h2 class="text-display-large">
                    LSP Log Parser
                </h2>
                <h3
                    v-if="remoteModel.connected"
                    class="text-body-large mt-4"
                >
                    Connected to Sublime Text. Waiting for messages...
                </h3>
                <h3
                    v-else
                    class="text-body-large mt-4"
                >
                    To establish connection to the local Sublime Text LSP instance, run <em>LSP: Open Remote Log Viewer</em> from the Command Palette or choose <em>Open Remote Log Viewer</em> from the context menu of the LSP Log Panel in Sublime Text.
                </h3>
                <h3
                    v-if="!remoteModel.connected"
                    class="text-body-large mt-2"
                >
                    With older LSP versions, enable the <code>"log_server": ["panel", "remote"]</code> LSP setting, restart ST and press the Remote button.
                </h3>
            </div>
            <log-view
                v-else
                class="height-100"
            />

            <v-dialog
                v-model="uiModel.errorDialogVisible"
                max-width="290"
            >
                <v-card>
                    <v-card-title class="text-headline-small">
                        Error
                    </v-card-title>

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
import { useRemoteModel } from '~/models/remote-model'
import { useUiModel } from '~/models/ui-model'

const logModel = reactive(useLogModel())
const remoteModel = reactive(useRemoteModel())
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
