<template>
  <v-app-bar app>
    <v-app-bar-nav-icon class="mr-2" @click.stop="$store.commit('setDrawerVisible', !drawer)" />
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
          class="mr-2"
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
    <v-chip-group v-if="parsedFilters.length" v-model="selectedFilters" class="mr-2" multiple>
      <v-chip v-for="server in parsedFilters" :key="server" filter outlined>
        {{ server }}
      </v-chip>
    </v-chip-group>
    <v-text-field
      ref="queryField"
      v-model="queryText"
      :disabled="!parsedLines.length"
      placeholder="Filter by text ('/' to focus)"
      solo-inverted
      hide-details
      clearable
      clear-icon="mdi-close-circle-outline"
    />
    <v-spacer />
    <v-toolbar-title v-text="title" />
  </v-app-bar>
</template>

<script>
import { parsers } from '~/utils'

export default {
  props: {
    /** @type {import('vue').PropOptions<boolean>} */
    drawer: {
      type: Boolean
    }
  },
  data () {
    return {
      dialog: false,
      errorDialog: false,
      parseErrorText: '',
      items: [],
      logContent: '',
      parserTypes: parsers.map(p => p.name),
      queryText: '',
      selectedParser: parsers[0].name,
      selectedParserHint: '',
      /** @type {number[]} */
      selectedFilters: [],
      title: 'LSP Log Parser'
    }
  },
  computed: {
    /** @return {string[]} */
    parsedFilters () {
      return this.$store.state.parsedFilters
    },
    /** @return {import('~/utils').Message[]} */
    parsedLines () {
      return this.$store.state.parsedLines
    },
    /** @return {boolean} */
    triggerSearchFocus () {
      return this.$store.state.triggerSearchFocus
    }
  },
  watch: {
    /** @type {import('vue').WatchHandler<string[]>} */
    parsedFilters (servers) {
      this.selectedFilters = []
      for (let i = 0; i < servers.length; i++) {
        this.selectedFilters.push(i)
      }
    },
    triggerSearchFocus () {
      this.$refs.queryField.focus()
      this.$store.commit('resetSearchFocus')
    },
    queryText (value) {
      this.$store.commit('setQueryText', value)
    },
    /** @type {import('vue').WatchHandler<string>} */
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
    /** @type {import('vue').WatchHandler<string[]>} */
    selectedFilters (filters) {
      this.$store.commit('setSelectedFilters', filters)
    },
    /** @param {boolean} show */
    dialog (show) {
      if (!show) {
        this.logContent = ''
      }
    }
  },
  methods: {
    parseLog () {
      this.dialog = false
      this.$store.commit('setDrawerVisible', false)
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