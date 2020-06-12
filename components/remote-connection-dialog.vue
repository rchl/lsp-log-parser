<template>
  <v-dialog v-model="state.open" max-width="500px" persistent>
    <v-card>
      <v-card-title class="headline">
        Remote mode
      </v-card-title>

      <v-card-text>
        <p>
          Attempting to connect to server at port 9981...
        </p>
        <v-alert
          v-if="remoteModel.errorText"
          border="left"
          dense
          colored-border
          type="error"
          elevation="2"
        >
          {{ remoteModel.errorText }}
        </v-alert>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn text @click="remoteModel.enabled = false">
          Cancel
        </v-btn>
        <v-spacer />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, reactive, watch } from '@vue/composition-api'
import { useRemoteModel } from '~/models/remote-model'

export default defineComponent({
  setup () {
    const state = reactive({
      open: false
    })

    const remoteModel = useRemoteModel()

    watch([remoteModel.enabled, remoteModel.connected], () => {
      state.open = remoteModel.enabled.value && !remoteModel.connected.value
    })

    return {
      remoteModel,
      state
    }
  }
})
</script>
