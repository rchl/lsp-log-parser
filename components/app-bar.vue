<template>
    <v-app-bar app>
        <v-app-bar-nav-icon
            class="mr-2"
            @click.stop="uiModel.toggleDrawer()" />

        <v-tooltip bottom>
            <template #activator="{ on }">
                <v-btn
                    v-shortkey="[cmdOrCtrl, 'o']"
                    color="primary"
                    class="mr-2"
                    :disabled="remoteModel.enabled.value"
                    @click="uiModel.logDialogVisible.value = true"
                    @shortkey.native="uiModel.logDialogVisible.value = true"
                    v-on="on"
                >
                    Open log
                </v-btn>
            </template>
            <span>Open log text ({{ cmdOrCtrl }}-O)</span>
        </v-tooltip>
        <open-log-dialog />

        <v-tooltip bottom>
            <template #activator="{ on }">
                <v-btn
                    v-shortkey="[cmdOrCtrl, 'd']"
                    class="mr-2"
                    :color="remoteModel.connected.value ? 'error' : 'primary'"
                    :outlined="!remoteModel.connected.value"
                    @shortkey.native="remoteModel.enabled.value = !remoteModel.enabled.value"
                    @click="remoteModel.enabled.value = !remoteModel.enabled.value"
                    v-on="on"
                >
                    <v-icon>
                        {{ remoteModel.connected.value ? 'mdi-lan-disconnect' : 'mdi-lan-connect' }}
                    </v-icon>
                </v-btn>
            </template>
            <span>{{ remoteModel.connected.value ? 'Disconnect from remote' : 'Connect to remote websocket server' }} ({{ cmdOrCtrl }}-D)</span>
        </v-tooltip>
        <remote-connection-dialog />

        <v-spacer />

        <v-text-field
            ref="filterField"
            v-model="uiModel.queryText.value"
            v-shortkey="['/']"
            class="mr-2"
            :disabled="!logModel.parsedLines.value.length"
            placeholder="Filter by text ('/' to focus)"
            dense
            solo
            hide-details
            clearable
            prepend-inner-icon="mdi-magnify"
            @shortkey.native="focusSearchField()"
        />

        <v-tooltip bottom>
            <template #activator="{ on }">
                <v-btn
                    class="ml-2"
                    ripple
                    color="black"
                    icon
                    href="https://microsoft.github.io/language-server-protocol/specification"
                    target="_blank"
                    v-on="on"
                >
                    <v-icon>
                        mdi-file-document-outline
                    </v-icon>
                </v-btn>
            </template>
            <span>LSP specification</span>
        </v-tooltip>
        <v-tooltip bottom>
            <template #activator="{ on }">
                <v-btn
                    class="ml-2"
                    ripple
                    color="black"
                    icon
                    href="https://github.com/rchl/lsp-log-parser"
                    target="_blank"
                    v-on="on"
                >
                    <v-icon>
                        mdi-github
                    </v-icon>
                </v-btn>
            </template>
            <span>Check out the source code</span>
        </v-tooltip>
    </v-app-bar>
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'
import { useRemoteModel } from '~/models/remote-model'
import { useLogModel } from '~/models/log-model'
import { useUiModel } from '~/models/ui-model'
import RemoteConnectionDialog from '~/components/remote-connection-dialog.vue'
import OpenLogDialog from '~/components/open-log-dialog.vue'

export default defineComponent({
    components: {
        RemoteConnectionDialog,
        OpenLogDialog,
    },
    setup() {
        const filterField = ref<HTMLElement | null>(null)

        function focusSearchField() {
            const filterComponent = filterField.value
            if (filterComponent) {
                filterComponent.focus()
            }
        }

        return {
            filterField,
            focusSearchField,
            logModel: useLogModel(),
            remoteModel: useRemoteModel(),
            uiModel: useUiModel(),
        }
    },
})
</script>
