import { MutationTree } from 'vuex'
import { ParseResults } from '~/utils'

type State = {
  drawerVisible: boolean
  expandAll: boolean
  parsedFilters: ParseResults['filters']
  parsedLines: ParseResults['lines']
  selectedFilters: string[]
}

export const state: () => State = () => ({
  drawerVisible: false,
  expandAll: false,
  parsedFilters: [],
  parsedLines: [],
  selectedFilters: []
})

export const mutations: MutationTree<State> = {
  toggleExpandAll (state) {
    state.expandAll = !state.expandAll
  },
  setDrawerVisible (state, visible) {
    state.drawerVisible = visible
  },
  setParseResults (state, data) {
    state.parsedFilters = data.filters
    state.parsedLines = data.lines
  },
  setSelectedFilters (state, filters) {
    state.selectedFilters = filters
  }
}
