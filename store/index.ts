import { MutationTree } from 'vuex'

type State = {
  expandAll: boolean,
  parsedLog: object[]
}

export const state: () => State = () => ({
  expandAll: false,
  parsedLog: []
})

export const mutations: MutationTree<State> = {
  toggleExpandAll (state) {
    state.expandAll = !state.expandAll
  },
  setParsedLog (state, data) {
    state.parsedLog = data
  }
}
