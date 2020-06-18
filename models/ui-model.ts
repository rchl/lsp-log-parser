import { ref } from '@vue/composition-api'
import { Message } from '~/utils'

const bottomSheetOpen = ref(false)
const errorDialogText = ref('')
const errorDialogVisible = ref(false)
const logDialogVisible = ref(false)
const drawerVisible = ref(false)
const queryText = ref('')
const selectedLine = ref<Message | null>(null)

function setDrawerVisible (visible: boolean) {
  drawerVisible.value = visible
}

function setSelectedMessage (message: Message | null) {
  bottomSheetOpen.value = Boolean(message)
  selectedLine.value = message
}

function showError (message: string) {
  errorDialogText.value = message
  errorDialogVisible.value = true
}

function resetState () {
  bottomSheetOpen.value = false
  selectedLine.value = null
}

export function useUiModel () {
  return {
    bottomSheetOpen,
    drawerVisible,
    errorDialogText,
    errorDialogVisible,
    logDialogVisible,
    queryText,
    selectedLine,
    setDrawerVisible,
    setSelectedMessage,
    showError,
    resetState
  }
}
