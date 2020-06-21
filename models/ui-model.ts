import { computed, ref } from '@vue/composition-api'
import { Message, useLogModel } from '~/models/log-model'

type CategoryType = 'all' | 'general' | 'window' | 'telemetry' | 'client' | 'workspace' | 'text-synchronization' | 'diagnostics' | 'language-features'

type Category = {
  name: string,
  type: CategoryType
}

const CATEGORIES: Category[] = [
  { name: 'All', type: 'all' },
  { name: 'General', type: 'general' },
  { name: 'Window', type: 'window' },
  { name: 'Telemetry', type: 'telemetry' },
  { name: 'Client', type: 'client' },
  { name: 'Workspace', type: 'workspace' },
  { name: 'Text synchronization', type: 'text-synchronization' },
  { name: 'Diagnostics', type: 'diagnostics' },
  { name: 'Language features', type: 'language-features' }
]

const MESSAGE_TO_CATEGORY: { [key in CategoryType]: string[] } = {
  all: [],
  general: ['initialize', 'initialized', 'shutdown', 'exit', '$/cancelRequest'],
  window: ['window/showMessage', 'window/showMessageRequest', 'window/logMessage'],
  telemetry: ['telemetry/event'],
  client: ['client/registerCapability', 'client/unregisterCapability'],
  workspace: [
    'workspace/applyEdit',
    'workspace/configuration',
    'workspace/didChangeConfiguration',
    'workspace/didChangeWatchedFiles',
    'workspace/didChangeWorkspaceFolders',
    'workspace/executeCommand',
    'workspace/symbol',
    'workspace/workspaceFolders'
  ],
  'text-synchronization': [
    'textDocument/didChange',
    'textDocument/didClose',
    'textDocument/didOpen',
    'textDocument/didSave',
    'textDocument/willSave',
    'textDocument/willSaveWaitUntil'
  ],
  diagnostics: ['textDocument/publishDiagnostics'],
  'language-features': [
    'codeLens/resolve',
    'completionItem/resolve',
    'documentLink/resolve',
    'textDocument/codeAction',
    'textDocument/codeLens',
    'textDocument/colorPresentation',
    'textDocument/completion',
    'textDocument/definition',
    'textDocument/documentColor',
    'textDocument/documentHighlight',
    'textDocument/documentLink',
    'textDocument/documentSymbol',
    'textDocument/formatting',
    'textDocument/hover',
    'textDocument/implementation',
    'textDocument/onTypeFormatting',
    'textDocument/rangeFormatting',
    'textDocument/references',
    'textDocument/rename',
    'textDocument/signatureHelp',
    'textDocument/typeDefinition'
  ]
}

const ICON_TYPES: Record<string, string> = {
  error: 'mdi-alert-circle',
  info: 'mdi-information-outline',
  notification: 'mdi-bullhorn',
  reqres: 'mdi-chat'
}

const drawerVisible = ref(true)
const errorDialogText = ref('')
const errorDialogVisible = ref(false)
const logDialogVisible = ref(false)
const queryText = ref('')
const selectedCategoryType = ref<CategoryType>('all')

function toggleDrawer () {
  drawerVisible.value = !drawerVisible.value
}

function showError (message: string) {
  errorDialogText.value = message
  errorDialogVisible.value = true
}

function resetState () {
  queryText.value = ''
  selectedCategoryType.value = 'all'
}

function messageMatchesSessionFilter (message: Message) {
  return logModel.parsedFilters.value.length === 0 || !message.serverName || enabledFilters.value.includes(message.serverName)
}

function messageMatchesCategoryFilter (message: Message) {
  if (selectedCategoryType.value === 'all') {
    return true
  }

  return MESSAGE_TO_CATEGORY[selectedCategoryType.value].includes(message.name)
}

const logModel = useLogModel()

const enabledFilters = computed<string[]>(
  () => logModel.selectedFilters.value.filter(filter => filter.enabled).map(filter => filter.name))

const filteredLines = computed(() => {
  return logModel.parsedLines.value.filter((line) => {
    if (!messageMatchesSessionFilter(line) || !messageMatchesCategoryFilter(line)) {
      return false
    }

    return !queryText.value || (line.name && line.name.toLowerCase().includes(queryText.value.toLowerCase()))
  })
})

export function useUiModel () {
  return {
    CATEGORIES,
    drawerVisible,
    errorDialogText,
    errorDialogVisible,
    filteredLines,
    ICON_TYPES,
    logDialogVisible,
    queryText,
    resetState,
    selectedCategoryType,
    showError,
    toggleDrawer
  }
}
