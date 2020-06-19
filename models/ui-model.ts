import { ref } from '@vue/composition-api'

const ICON_TYPES: Record<string, string> = { info: 'mdi-information-outline' }

const errorDialogText = ref('')
const errorDialogVisible = ref(false)
const logDialogVisible = ref(false)
const drawerVisible = ref(true)
const queryText = ref('')

function setDrawerVisible (visible: boolean) {
  drawerVisible.value = visible
}

function showError (message: string) {
  errorDialogText.value = message
  errorDialogVisible.value = true
}

function resetState () {
}

export function useUiModel () {
  return {
    drawerVisible,
    errorDialogText,
    errorDialogVisible,
    ICON_TYPES,
    logDialogVisible,
    queryText,
    setDrawerVisible,
    showError,
    resetState
  }
}
