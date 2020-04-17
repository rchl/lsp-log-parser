<template>
  <v-app>
    <v-app-bar app>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-dialog v-model="dialog" max-width="600px">
        <template v-slot:activator="{ on }">
          <v-btn color="primary mr-2" v-on="on">
            Open log
          </v-btn>
        </template>

        <v-card>
          <v-card-title class="headline">
            Paste the log and press the button to parse
          </v-card-title>

          <v-card-text>
            <v-select
              v-model="selectedLogType"
              :items="logTypes"
              label="Log type"
              solo
            />
            <v-textarea
              v-model="logContent"
              autofocus
              no-resize
              filled
              spellcheck="false"
              data-gramm_editor="false"
            />
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn color="primary" @click="parseLog">
              Parse
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog v-model="errorDialog" max-width="290">
        <v-card>
          <v-card-title class="headline">
            Parse error
          </v-card-title>

          <v-card-text>
            {{ parseErrorText }}
          </v-card-text>

          <v-card-actions>
            <v-spacer />

            <v-btn color="primary" text @click="errorDialog = false">
              Close
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn
            icon
            :disabled="!$store.state.parsedLog.length"
            v-on="on"
            @click.stop="$store.commit('toggleExpandAll')"
          >
            <v-icon>mdi-{{ `chevron-${$store.state.expandAll ? 'down' : 'right'}` }}</v-icon>
          </v-btn>
        </template>
        <span>Expand/Collapse all</span>
      </v-tooltip>
      <v-spacer />
      <v-toolbar-title v-text="title" />
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" absolute>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title class="title">
            Messages
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-divider />
      <v-list>
        <v-list-item
          v-for="(item, i) in $store.state.parsedLog"
          :key="item.id"
          link
          @click="$vuetify.goTo(`.treeview > div:nth-child(${i})`)"
        >
          <v-list-item-icon>
            <v-icon dense>
              {{ item.directionIcon }}
            </v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title v-text="item.name" />
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-content>
      <nuxt />
    </v-content>
  </v-app>
</template>

<script lang="ts">
// @ts-nocheck

const LOG_TYPES = ['VSCode', 'Sublime LSP']

type Message = {
  id: number,
  name: string,
  directionIcon?: string,
  children?: Message[]
  tempChildren?: string[]
  type?: string
}

export default {
  data () {
    return {
      dialog: false,
      errorDialog: false,
      parseErrorText: '',
      drawer: true,
      items: [],
      logContent: '',
      logTypes: LOG_TYPES,
      selectedLogType: LOG_TYPES[0],
      title: 'LSP Log Parser'
    }
  },
  methods: {
    parseLog () {
      this.dialog = false
      this.drawer = false
      const content = this.logContent
      this.logContent = ''

      const inputLines = content.split('\n').filter(line => Boolean(line))
      let lines: Message[] = []

      try {
        if (this.selectedLogType === 'VSCode') {
          lines = this.parseVscodeLog(inputLines)
        } else if (this.selectedLogType === 'Sublime LSP') {
          lines = this.parseSublimeLog(inputLines)
        }
      } catch (error) {
        this.parseErrorText = error.message
        this.errorDialog = true
      }

      this.$store.commit('setParsedLog', lines)
    },
    parseVscodeLog (inputLines: string[]) {
      const LINE_REGEX = /^\[(Trace|Info|Error)[^\]]+\] ((\w+).+)/
      const lines = []
      let id = 1
      let message: Message = { id, name: '' }

      for (const [i, line] of inputLines.entries()) {
        const newHeaderMatch = line.match(LINE_REGEX)

        if (newHeaderMatch) {
          // Process completed object first.
          if (message.name) {
            if (message.tempChildren) {
              message.children = [{ id: ++id, name: message.tempChildren.join('\n') }]
            }

            lines.push(message)
            message = { id: ++id, name: '' }
          }

          message.name = newHeaderMatch[2]
          message.type = newHeaderMatch[1].toLowerCase()
          const direction = newHeaderMatch[3].toLowerCase()
          if (direction === 'sending' || direction === 'received') {
            message.directionIcon = direction === 'sending' ? 'mdi-email-send-outline' : 'mdi-email-receive'
          }
        } else {
          if (!message.tempChildren) {
            message.tempChildren = []
          }

          if (!message.name) {
            throw new Error(`Message content with no parent (line ${i}.`)
          }

          message.tempChildren.push(line)
        }
      }

      if (message.name) {
        if (message.tempChildren) {
          message.children = [{ id: ++id, name: message.tempChildren.join('\n') }]
        }

        lines.push(message)
      }

      return lines
    },
    parseSublimeLog (inputLines: string[]) {
      const LINE_REGEX = /^::\s+([^ ]+)\s+([^ ]+)\s+([^:\n]+):?\s*(.*)/
      const lines = []
      let id = 1
      let message: Message = { id, name: '' }

      for (const line of inputLines) {
        const lspMatch = line.match(LINE_REGEX)

        if (lspMatch) {
          message = { id: ++id, name: `(${lspMatch[2]}) ${lspMatch[3]}`, type: lspMatch[1] }

          if (lspMatch[4]) {
            message.children = [{
              id: ++id,
              name: lspMatch[4]
            }]
          }

          const direction = lspMatch[1]
          if (direction.includes('>') || direction === 'received') {
            message.directionIcon = 'mdi-email-send-outline'
          } else if (direction.includes('<')) {
            message.directionIcon = 'mdi-email-receive'
          } else {
            message.directionIcon = 'mdi-sync-alert'
          }

          lines.push(message)
        } else {
          lines.push({ id: ++id, name: line, type: 'info' })
        }
      }

      return lines
    }
  }
}
</script>
