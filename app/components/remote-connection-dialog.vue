<template>
    <v-dialog
        v-model="state.open"
        max-width="500px"
        persistent
    >
        <v-card>
            <v-card-title class="text-headline-small">
                Remote mode
            </v-card-title>

            <v-card-text>
                <p>
                    Attempting to connect to server on port {{ remoteModel.connectionParams.value?.port }}...
                </p>
                <p class="mt-2">
                    If the connection doesn't succeed, choose <em>Open Remote Log Viewer</em> from the context menu of the LSP Log Panel in Sublime Text again.
                </p>
                <v-alert
                    v-if="remoteModel.hasConnectedAtLeastOnce.value && remoteModel.errorText.value"
                    class="mt-2"
                    type="error"
                    elevation="2"
                >
                    {{ remoteModel.errorText.value }}
                </v-alert>
            </v-card-text>

            <v-card-actions>
                <v-spacer />
                <v-btn
                    variant="text"
                    @click="remoteModel.enabled.value = false"
                >
                    Cancel
                </v-btn>
                <v-spacer />
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import { useRemoteModel } from '~/models/remote-model'

const state = reactive({
    open: false,
})

const remoteModel = useRemoteModel()

watch([remoteModel.enabled, remoteModel.connected], () => {
    state.open = remoteModel.enabled.value && !remoteModel.connected.value
})
</script>
