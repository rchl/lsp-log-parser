<template>
  <v-app-bar app>
    <!-- <v-app-bar-nav-icon class="mr-2" @click.stop="$store.commit('setDrawerVisible', !drawer)" /> -->
    <v-dialog
      v-model="state.openLogDialog"
      v-shortkey="[cmdOrCtrl, 'o']"
      max-width="600px"
      @shortkey.native="state.openLogDialog = true"
    >
      <template v-slot:activator="{ on }">
        <v-btn color="primary" class="mr-2" v-on="on">
          Open log
        </v-btn>
      </template>
      <v-card>
        <v-card-title class="headline">
          Paste the log and press the button to parse
        </v-card-title>

        <v-card-text>
          <v-textarea
            v-model="state.logContent"
            autofocus
            no-resize
            filled
            spellcheck="false"
            data-gramm_editor="false"
          />
          <v-select
            v-model="state.selectedParser"
            :items="state.parserTypes"
            label="Log type"
            :hint="state.selectedParserHint"
            persistent-hint
            solo
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            v-shortkey="[cmdOrCtrl, 'enter']"
            color="primary"
            @shortkey.native="state.openLogDialog ? parseLog() : null"
            @click="parseLog"
          >
            Parse
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-tooltip bottom>
      <template v-slot:activator="{ on }">
        <v-btn
          v-shortkey="[cmdOrCtrl, 'x']"
          class="mr-2"
          outlined
          :disabled="parsedLines.length === 0"
          color="primary"
          @shortkey.native="clearLog()"
          @click="clearLog()"
          v-on="on"
        >
          <v-icon>
            mdi-playlist-remove
          </v-icon>
        </v-btn>
      </template>
      <span>Clear log view ({{ cmdOrCtrl }}-x)</span>
    </v-tooltip>
    <v-dialog v-model="state.errorDialog" max-width="290">
      <v-card>
        <v-card-title class="headline">
          Parse error
        </v-card-title>

        <v-card-text>
          {{ state.parseErrorText }}
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn color="primary" text @click="state.errorDialog = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-chip
      v-for="filter in selectedFilters"
      :key="filter.name"
      class="mr-2"
      :input-value="filter.enabled"
      filter
      outlined
      @click="toggleFilter(filter)"
    >
      {{ filter.name }}
    </v-chip>
    <v-text-field
      ref="filterField"
      v-model="state.queryText"
      v-shortkey="['/']"
      :disabled="!parsedLines.length"
      placeholder="Filter by text ('/' to focus)"
      solo-inverted
      hide-details
      clearable
      clear-icon="mdi-close-circle-outline"
      @shortkey.native="focusSearchField()"
    />
    <v-spacer />
    <v-toolbar-title v-text="'LSP Log Parser'" />
  </v-app-bar>
</template>

<script lang="ts">
import { defineComponent, computed, reactive, ref, toRef, watch, watchEffect } from '@vue/composition-api'
import { Message, Parser, parsers, SelectedFilter } from '~/utils'

export default defineComponent({
  props: {
    drawer: {
      type: Boolean
    }
  },
  setup (_props, { root }) {
    const state = reactive({
      openLogDialog: false,
      errorDialog: false,
      parseErrorText: '',
      logContent: '',
      parserTypes: parsers.map(p => p.name),
      queryText: '',
      selectedParser: parsers[0].name,
      selectedParserHint: ''
    })

    const parsedLines = computed<Message[]>(() => root.$store.state.parsedLines)
    const selectedFilters = computed<SelectedFilter[]>(() => root.$store.state.selectedFilters)

    watchEffect(() => {
      root.$store.commit('setQueryText', state.queryText)
    })

    watchEffect(() => {
      const previewChunks = state.logContent.substr(0, 500).split('\n')
      let highestHits = 0
      let highestParserIndex = -1
      for (const [index, parser] of parsers.entries()) {
        const hits = previewChunks.filter(chunk => parser.lineRegex.test(chunk)).length
        if (hits > highestHits) {
          highestHits = hits
          highestParserIndex = index
        }
      }
      let parser: Parser | null = null
      if (highestParserIndex !== -1) {
        parser = parsers[highestParserIndex]
      }
      if (parser) {
        state.selectedParser = parser.name
      }
      root.$nextTick(() => (state.selectedParserHint = parser ? 'auto-detected from log content' : ''))
    })

    const filterField = ref<any | null>(null)

    function focusSearchField () {
      const filterComponent = filterField.value
      if (filterComponent) {
        filterComponent.focus()
      }
    }

    function toggleFilter (filter: SelectedFilter) {
      root.$store.commit('toggleFilter', filter)
    }

    watch(toRef(state, 'selectedParser'), () => {
      state.selectedParserHint = ''
    })

    watchEffect(() => {
      if (!state.openLogDialog) {
        state.logContent = ''
      }
    })

    function clearLog () {
      root.$store.commit('setParseResults', { filters: [], lines: [] })
    }

    function parseLog () {
      state.openLogDialog = false
      root.$store.commit('setDrawerVisible', false)
      state.selectedParserHint = ''

      const content = state.logContent
      const inputLines = content.split('\n').filter(line => Boolean(line))
      const parser = parsers.find(p => p.name === state.selectedParser)

      if (parser) {
        let lines

        try {
          lines = parser.parse(inputLines)
        } catch (error) {
          state.parseErrorText = error.message
          state.errorDialog = true
        }

        root.$store.commit('setParseResults', lines)
        root.$store.commit('resetState')
      }
    }

    return {
      clearLog,
      state,
      filterField,
      focusSearchField,
      parsedLines,
      parseLog,
      selectedFilters,
      toggleFilter
    }
  }
})
</script>
