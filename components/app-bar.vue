<template>
  <v-app-bar app>
    <v-app-bar-nav-icon class="mr-2" @click.stop="uiModel.toggleDrawer()" />

    <v-tooltip bottom>
      <template v-slot:activator="{ on }">
        <v-btn
          v-shortkey="[cmdOrCtrl, 'o']"
          color="primary"
          class="mr-2"
          :disabled="remoteModel.enabled"
          @click="uiModel.logDialogVisible = true"
          @shortkey.native="uiModel.logDialogVisible = true"
          v-on="on"
        >
          Open log
        </v-btn>
      </template>
      <span>Open log text ({{ cmdOrCtrl }}-O)</span>
    </v-tooltip>
    <open-log-dialog />

    <v-tooltip bottom>
      <template v-slot:activator="{ on }">
        <v-btn
          v-shortkey="[cmdOrCtrl, 'd']"
          class="mr-2"
          :color="remoteModel.connected ? 'error' : 'primary'"
          :outlined="!remoteModel.connected"
          @shortkey.native="remoteModel.enabled = !remoteModel.enabled"
          @click="remoteModel.enabled = !remoteModel.enabled"
          v-on="on"
        >
          <v-icon>
            {{ remoteModel.connected ? 'mdi-lan-disconnect' : 'mdi-lan-connect' }}
          </v-icon>
        </v-btn>
      </template>
      <span>{{ remoteModel.connected ? 'Disconnect from remote' : 'Connect to remote websocket server' }} ({{ cmdOrCtrl }}-D)</span>
    </v-tooltip>
    <remote-connection-dialog />

    <v-spacer />

    <v-text-field
      ref="filterField"
      v-model="uiModel.queryText"
      v-shortkey="['/']"
      class="mr-2"
      :disabled="!logModel.parsedLines.length"
      placeholder="Filter by text ('/' to focus)"
      dense
      solo
      hide-details
      clearable
      prepend-inner-icon="mdi-magnify"
      @shortkey.native="focusSearchField()"
    />

    <v-tooltip bottom>
      <template v-slot:activator="{ on }">
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
      <template v-slot:activator="{ on }">
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
import { defineComponent, ref, reactive } from '@vue/composition-api'
import { useRemoteModel } from '~/models/remote-model'
import { useLogModel } from '~/models/log-model'
import { useUiModel } from '~/models/ui-model'
import RemoteConnectionDialog from '~/components/remote-connection-dialog.vue'
import OpenLogDialog from '~/components/open-log-dialog.vue'

export default defineComponent({
  components: {
    RemoteConnectionDialog,
    OpenLogDialog
  },
  setup () {
    const filterField = ref<any | null>(null)

    function focusSearchField () {
      const filterComponent = filterField.value
      if (filterComponent) {
        filterComponent.focus()
      }
    }

    return {
      filterField,
      focusSearchField,
      logModel: reactive(useLogModel()),
      remoteModel: reactive(useRemoteModel()),
      uiModel: reactive(useUiModel())
    }
  }
})
</script>
