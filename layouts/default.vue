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
            <v-textarea
              v-model="logContent"
              autofocus
              no-resize
              filled
              spellcheck="false"
              data-gramm_editor="false"
            />
            <v-select
              v-model="selectedParser"
              :items="parserTypes"
              label="Log type"
              :hint="selectedParserHint"
              persistent-hint
              solo
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
            :disabled="!parsedLines.length"
            v-on="on"
            @click.stop="$store.commit('toggleExpandAll')"
          >
            <v-icon>mdi-{{ `chevron-${$store.state.expandAll ? 'down' : 'right'}` }}</v-icon>
          </v-btn>
        </template>
        <span>Expand/Collapse all</span>
      </v-tooltip>
      <v-chip-group v-if="parsedFilters.length" v-model="selectedFilters" multiple>
        <v-chip v-for="server in parsedFilters" :key="server" filter outlined>
          {{ server }}
        </v-chip>
      </v-chip-group>
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
          v-for="(item, i) in parsedLines"
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
import parsers, { Message } from '~/utils/parsers'

export default {
  data () {
    return {
      dialog: false,
      errorDialog: false,
      parseErrorText: '',
      drawer: false,
      items: [],
      logContent: '',
      parserTypes: parsers.map(p => p.name),
      selectedParser: parsers[0].name,
      selectedParserHint: '',
      selectedFilters: [] as number[],
      title: 'LSP Log Parser'
    }
  },
  computed: {
    parsedFilters (): string[] {
      return this.$store.state.parsedFilters
    },
    parsedLines (): Message[] {
      return this.$store.state.parsedLines
    }
  },
  watch: {
    parsedFilters (servers) {
      this.selectedFilters = []
      for (let i = 0; i < servers.length; i++) {
        this.selectedFilters.push(i)
      }
    },
    logContent (newValue) {
      const previewChunk = newValue.substr(0, 200).split('\n')
      const parser = parsers.find(p => p.lineRegex.test(previewChunk[0]))
      if (parser) {
        this.selectedParser = parser.name
      }
      this.$nextTick(() => (this.selectedParserHint = parser ? 'auto-detected from log content' : ''))
    },
    selectedParser () {
      this.selectedParserHint = ''
    },
    selectedFilters (filters) {
      this.$store.commit('setSelectedFilters', filters)
    },
    dialog (show) {
      if (!show) {
        this.logContent = ''
      }
    }
  },
  methods: {
    parseLog () {
      this.dialog = false
      this.drawer = false
      this.selectedParserHint = ''

      const content = this.logContent
      const inputLines = content.split('\n').filter(line => Boolean(line))
      const parser = parsers.find(p => p.name === this.selectedParser)

      if (parser) {
        let lines

        try {
          lines = parser.parse(inputLines)
        } catch (error) {
          this.parseErrorText = error.message
          this.errorDialog = true
        }

        this.$store.commit('setParseResults', lines)
      }
    }
  }
}
</script>
