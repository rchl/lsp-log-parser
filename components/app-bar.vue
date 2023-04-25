<template>
    <v-app-bar>
        <v-app-bar-nav-icon
            class="mr-2"
            @click.stop="uiModel.toggleDrawer()" />

        <v-btn
            class="mr-2"
            variant="elevated"
            :disabled="remoteModel.enabled.value"
            @click="openLogDialog"
        >
            Open log
            <v-tooltip
                activator="parent"
                location="bottom"
            >
                Open log text (cmdOrCtrl-O)
            </v-tooltip>
        </v-btn>
        <log-dialog />

        <v-btn
            :prepend-icon="remoteModel.connected.value ? 'mdi-lan-disconnect' : 'mdi-lan-connect'"
            class="mr-2"
            color="primary"
            :variant="remoteModel.connected.value ? 'elevated' : 'outlined'"
            @click="toggleRemoteConnection"
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

        <v-btn
            class="mr-2"
            :disabled="logModel.parsedLines.value.length === 0"
            location="bottom right"
            color="primary"
            variant="outlined"
            @click="clearLogMessages"
        >
            <v-icon>mdi-playlist-remove</v-icon>
            <v-tooltip
                activator="parent"
                location="bottom"
            >
                Clear log view (cmdOrCtrl-X);
            </v-tooltip>
        </v-btn>

        <v-spacer />

        <v-text-field
            ref="filterField"
            v-model="uiModel.queryText.value"
            class="mr-2"
            :disabled="!logModel.parsedLines.value.length"
            placeholder="Filter by text ('/' to focus)"
            persistent-placeholder
            density="compact"
            hide-details
            clearable
            prepend-inner-icon="mdi-magnify"
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
import { useMagicKeys } from '@vueuse/core'
import { useRemoteModel } from '~/models/remote-model'
import { useLogModel } from '~/models/log-model'
import { useUiModel } from '~/models/ui-model'

useMagicKeys({
    passive: false,
    onEventFired(e) {
        if (e.key === '/' && e.type === 'keydown') {
            if ((e.target as HTMLElement).tagName === 'INPUT') {
                return
            }
            e.preventDefault()
            focusSearchField()
        } else if (e.metaKey && ['x', 'd', 'o'].includes(e.key) && e.type === 'keydown') {
            e.preventDefault()
            if (e.key === 'x') {
                clearLogMessages()
            } else if (e.key === 'd') {
                toggleRemoteConnection()
            } else if (e.key === 'o') {
                openLogDialog()
            }
        }
    },
})

function openLogDialog() {
    uiModel.logDialogVisible.value = true
}

function clearLogMessages() {
    logModel.clearMessages()
}

function toggleRemoteConnection() {
    remoteModel.enabled.value = !remoteModel.enabled.value
}

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
