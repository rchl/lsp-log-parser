import { ref } from '@vue/composition-api'

const ICON_TYPES: Record<string, string> = {
  error: 'mdi-alert-circle',
  info: 'mdi-information-outline',
  notification: 'mdi-bullhorn',
  reqres: 'mdi-chat'
}

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
