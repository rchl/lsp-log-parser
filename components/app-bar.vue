<template>
  <v-app-bar app>
    <!-- <v-app-bar-nav-icon class="mr-2" @click.stop="$store.commit('setDrawerVisible', !drawer)" /> -->
    <v-dialog
      v-model="dialog"
      v-shortkey="[cmdOrCtrl, 'o']"
      max-width="600px"
      @shortkey.native="dialog = true"
    >
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
          <v-btn
            v-shortkey="[cmdOrCtrl, 'enter']"
            color="primary"
            @shortkey.native="dialog ? parseLog() : null"
            @click="parseLog"
          >
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
    <v-chip-group v-model="selectedFilters" class="mr-2" multiple>
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
    async parsedFilters (servers) {
      // This is required as we need to update v-model of v-chip-group after it does it itself
      // after creating new chips.
      await this.$nextTick()
      this.selectedFilters = servers.map((_server, index) => index)
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
      const previewChunks = newValue.substr(0, 500).split('\n')
      let highestHits = 0
      let highestParserIndex = -1
      for (const [index, parser] of parsers.entries()) {
        const hits = previewChunks.filter(chunk => parser.lineRegex.test(chunk)).length
        if (hits > highestHits) {
          highestHits = hits
          highestParserIndex = index
        }
      }
      let parser = null
      if (highestParserIndex !== -1) {
        parser = parsers[highestParserIndex]
      }
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
      this.$store.commit('setSelectedFilters', Array.from(filters))
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
        this.$store.commit('resetState')
      }
    }
  }
}
</script>
