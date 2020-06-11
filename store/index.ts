import { MutationTree } from 'vuex'
import { Message, ParseResults, SelectedFilter } from '~/utils'

type State = {
  bottomSheetOpen: boolean
  drawerVisible: boolean
  parsedFilters: ParseResults['filters']
  parsedLines: ParseResults['lines']
  queryText: string,
  selectedLine: Message | null
  selectedFilters: SelectedFilter[]
}

export const state: () => State = () => ({
  bottomSheetOpen: false,
  drawerVisible: false,
  parsedFilters: [],
  parsedLines: [],
  queryText: '',
  selectedLine: null,
  selectedFilters: []
})

export const mutations: MutationTree<State> = {
  resetState (state) {
    state.bottomSheetOpen = false
    state.selectedLine = null
  },
  setSelectedLine (state, message) {
    state.selectedLine = message
    state.bottomSheetOpen = Boolean(message)
  },
  setDrawerVisible (state, visible) {
    state.drawerVisible = visible
  },
  setParseResults (state, data) {
    state.parsedFilters = data.filters
    state.parsedLines = data.lines
    state.selectedFilters = state.parsedFilters.map(filter => ({
      name: filter,
      enabled: true
    }))
  },
  setParsedFilters (state, filters) {
    state.parsedFilters = filters
  },
  toggleFilter (_state, filter) {
    filter.enabled = !filter.enabled
  },
  appendParsedMessage (state, message) {
    state.parsedLines.push(message)
  },
  setQueryText (state, value) {
    state.queryText = value
  }
}
