import { MutationTree } from 'vuex'
import { ParseResults } from '~/utils'

type State = {
  drawerVisible: boolean
  expandAll: boolean
  parsedFilters: ParseResults['filters']
  parsedLines: ParseResults['lines']
  queryText: string,
  selectedFilters: string[]
  triggerSearchFocus: boolean
}

export const state: () => State = () => ({
  drawerVisible: false,
  expandAll: false,
  parsedFilters: [],
  parsedLines: [],
  queryText: '',
  selectedFilters: [],
  triggerSearchFocus: false
})

export const mutations: MutationTree<State> = {
  toggleExpandAll (state, expand) {
    state.expandAll = typeof expand === 'boolean' ? expand : !state.expandAll
  },
  setDrawerVisible (state, visible) {
    state.drawerVisible = visible
  },
  setParseResults (state, data) {
    state.parsedFilters = data.filters
    state.parsedLines = data.lines
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
