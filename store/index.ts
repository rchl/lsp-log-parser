import { MutationTree } from 'vuex'
import { ParseResults } from '~/utils/parsers'

type State = {
  expandAll: boolean
  parsedFilters: ParseResults['filters']
  parsedLines: ParseResults['lines']
  selectedFilters: string[]
}

export const state: () => State = () => ({
  expandAll: false,
  parsedFilters: [],
  parsedLines: [],
  selectedFilters: []
})

export const mutations: MutationTree<State> = {
  toggleExpandAll (state) {
    state.expandAll = !state.expandAll
  },
  setParseResults (state, data) {
    state.parsedFilters = data.filters
    state.parsedLines = data.lines
  },
  setSelectedFilters (state, filters) {
    state.selectedFilters = filters
  }
}
