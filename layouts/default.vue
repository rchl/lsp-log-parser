<template>
  <v-app dark>
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

      if (this.selectedLogType === 'VSCode') {
        lines = this.parseVscodeLog(inputLines)
      } else if (this.selectedLogType === 'Sublime LSP') {
        lines = this.parseSublimeLog(inputLines)
      }

      this.$store.commit('setParsedLog', lines)
    },
    parseVscodeLog (inputLines: string[]) {
      const lines = []
      let id = 1
      let message: Message = { id, name: '' }

      for (const line of inputLines) {
        const newHeaderMatch = line.match(/^\[(Trace|Info|Error)[^\]]+\] ((\w+).+)/)

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
      const lines = []
      let id = 1
      let message: Message = { id, name: '' }

      for (const line of inputLines) {
        const lspMatch = line.match(/^::\s+([^ ]+)\s+([^ ]+)\s+([^:\n]+):?\s*(.*)/)

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
