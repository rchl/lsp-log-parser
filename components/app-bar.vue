<template>
    <v-app-bar>
        <v-app-bar-nav-icon
            class="mr-2"
            @click.stop="uiModel.toggleDrawer()" />

        <v-btn
            vshortkey="[cmdOrCtrl, 'o']"
            class="mr-2"
            variant="elevated"
            :disabled="remoteModel.enabled.value"
            @click="uiModel.logDialogVisible.value = true"
            @shortkey.native="uiModel.logDialogVisible.value = true"
        >
            Open log
            <v-tooltip
                activator="parent"
                location="bottom"
            >
                Open log text (cmdOrCtrl-O)
            </v-tooltip>
        </v-btn>
        <open-log-dialog />

        <v-btn
            vshortkey="[cmdOrCtrl, 'd']"
            :prepend-icon="remoteModel.connected.value ? 'mdi-lan-disconnect' : 'mdi-lan-connect'"
            class="mr-2"
            color="primary"
            :variant="remoteModel.connected.value ? 'elevated' : 'outlined'"
            @shortkey.native="remoteModel.enabled.value = !remoteModel.enabled.value"
            @click="remoteModel.enabled.value = !remoteModel.enabled.value"
        >
            Remote
            <v-tooltip
                activator="parent"
                location="bottom"
            >
                {{ remoteModel.connected.value ? 'Disconnect from remote' : 'Connect to remote websocket server' }} (cmdOrCtrl-D)
            </v-tooltip>
        </v-btn>
        <remote-connection-dialog />

        <v-spacer />

        <v-text-field
            ref="filterField"
            v-model="uiModel.queryText.value"
            vshortkey="['/']"
            class="mr-2"
            :disabled="!logModel.parsedLines.value.length"
            placeholder="Filter by text ('/' to focus)"
            persistent-placeholder
            density="compact"
            hide-details
            clearable
            prepend-inner-icon="mdi-magnify"
            @shortkey.native="focusSearchField()"
        />

        <v-btn
            class="ml-2"
            ripple
            color="black"
            icon
            href="https://microsoft.github.io/language-server-protocol/specification"
            target="_blank"
        >
            <v-icon>
                mdi-file-document-outline
            </v-icon>
            <v-tooltip
                activator="parent"
                location="bottom"
            >
                LSP specification
            </v-tooltip>
        </v-btn>
        <v-btn
            class="ml-2"
            ripple
            color="black"
            icon
            href="https://github.com/rchl/lsp-log-parser"
            target="_blank"
        >
            <v-icon>
                mdi-github
            </v-icon>
            <v-tooltip
                activator="parent"
                location="bottom">
                Check out the source code
            </v-tooltip>
        </v-btn>
    </v-app-bar>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRemoteModel } from '~/models/remote-model'
import { useLogModel } from '~/models/log-model'
import { useUiModel } from '~/models/ui-model'
import RemoteConnectionDialog from '~/components/remote-connection-dialog.vue'
import OpenLogDialog from '~/components/open-log-dialog.vue'

const filterField = ref<HTMLElement | null>(null)

function focusSearchField() {
    const filterComponent = filterField.value
    if (filterComponent) {
        filterComponent.focus()
    }
}

const logModel = useLogModel()
const remoteModel = useRemoteModel()
const uiModel = useUiModel()
</script>
