import { MutationTree } from 'vuex'
import { Message, ParseResults } from '~/utils'

type State = {
  bottomSheetOpen: boolean
  drawerVisible: boolean
  parsedFilters: ParseResults['filters']
  parsedLines: ParseResults['lines']
  queryText: string,
  selectedLine: Message | null
  selectedFilters: string[]
  triggerSearchFocus: boolean
}

export const state: () => State = () => ({
  bottomSheetOpen: false,
  drawerVisible: false,
  parsedFilters: [],
  parsedLines: [],
  queryText: '',
  selectedLine: null,
  selectedFilters: [],
  triggerSearchFocus: false
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
  },
  setParsedFilters (state, filters) {
    state.parsedFilters = filters
  },
  appendParsedMessage (state, message) {
    state.parsedLines.push(message)
  },
  setQueryText (state, value) {
    state.queryText = value
  },
  setSelectedFilters (state, filters) {
    state.selectedFilters = filters
  },
  triggerSearchFocus (state) {
    state.triggerSearchFocus = true
  },
  resetSearchFocus (state) {
    state.triggerSearchFocus = false
  }
}
