import { ref } from '@vue/composition-api'
import { Message } from '~/utils'

const bottomSheetOpen = ref(false)
const errorDialogVisible = ref(false)
const logDialogVisible = ref(false)
const drawerVisible = ref(false)
const queryText = ref('')
const parseErrorText = ref('')
const selectedLine = ref<Message | null>(null)

function setDrawerVisible (visible: boolean) {
  drawerVisible.value = visible
}

function setSelectedMessage (message: Message | null) {
  bottomSheetOpen.value = Boolean(message)
  selectedLine.value = message
}

function resetState () {
  bottomSheetOpen.value = false
  selectedLine.value = null
}

export function useUiModel () {
  return {
    bottomSheetOpen,
    drawerVisible,
    errorDialogVisible,
    logDialogVisible,
    parseErrorText,
    queryText,
    selectedLine,
    setDrawerVisible,
    setSelectedMessage,
    resetState
  }
}
