import { computed, ref } from 'vue'
import { type Message, useLogModel } from '~/models/log-model'

export type CategoryType = 'general' | 'window' | 'client' | 'workspace' | 'text-synchronization' | 'diagnostics' | 'language-features'

type Category = {
    name: string;
    type: CategoryType;
}

const CATEGORIES: Category[] = [
    { name: 'Client', type: 'client' },
    { name: 'Diagnostics', type: 'diagnostics' },
    { name: 'General', type: 'general' },
    { name: 'Language features', type: 'language-features' },
    { name: 'Text synchronization', type: 'text-synchronization' },
    { name: 'Window', type: 'window' },
    { name: 'Workspace', type: 'workspace' },
]

const MESSAGE_TO_CATEGORIES: Record<CategoryType, string[]> = {
    general: ['initialize', 'initialized', 'shutdown', 'exit', '$/cancelRequest'],
    window: ['window/showMessage', 'window/showMessageRequest', 'window/logMessage'],
    client: ['client/registerCapability', 'client/unregisterCapability'],
    workspace: [
        'workspace/applyEdit',
        'workspace/configuration',
        'workspace/didChangeConfiguration',
        'workspace/didChangeWatchedFiles',
        'workspace/didChangeWorkspaceFolders',
        'workspace/executeCommand',
        'workspace/symbol',
        'workspace/workspaceFolders',
    ],
    'text-synchronization': [
        'textDocument/didChange',
        'textDocument/didClose',
        'textDocument/didOpen',
        'textDocument/didSave',
        'textDocument/willSave',
        'textDocument/willSaveWaitUntil',
    ],
    diagnostics: [
        'textDocument/publishDiagnostics',
        'textDocument/diagnostic',
        'workspace/diagnostic',
        'workspace/diagnostic/refresh',
    ],
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
        'textDocument/typeDefinition',
    ],
}

const ICON_TYPES: Record<string, string> = {
    error: 'mdi-alert-circle',
    info: 'mdi-information-outline',
    notification: 'mdi-bullhorn',
    reqres: 'mdi-chat',
}

const drawerVisible = ref(true)
const errorDialogText = ref('')
const errorDialogVisible = ref(false)
const logDialogVisible = ref(false)
const queryText = ref('')
const categoriesFilter = reactive({
    enabled: false,
    getCategories() {
        return CATEGORIES
    },
    selectAllCategories,
    selectedCategories: [] as CategoryType[],
})

function selectAllCategories() {
    categoriesFilter.enabled = false
    categoriesFilter.selectedCategories = CATEGORIES.map(c => c.type)
}

function toggleDrawer() {
    drawerVisible.value = !drawerVisible.value
}

function showError(message: string) {
    errorDialogText.value = message
    errorDialogVisible.value = true
}

function resetState() {
    queryText.value = ''
    selectAllCategories()
}

function messageMatchesSessionFilter(message: Message) {
    return logModel.parsedFilters.value.length === 0 || !message.serverName || enabledFilters.value.includes(message.serverName)
}

function messageMatchesCategoryFilter(message: Message) {
    if (!message.name || !categoriesFilter.enabled) {
        return true
    }
    for (const category of categoriesFilter.selectedCategories) {
        const categories = MESSAGE_TO_CATEGORIES[category]
        if (categories.includes(message.name)) {
            return true
        }
    }
    return false
}

const logModel = useLogModel()

const enabledFilters = computed<string[]>(
    () => logModel.selectedFilters.value.filter(filter => filter.enabled).map(filter => filter.name))

const filteredLines = computed(() => {
    return logModel.parsedLines.value.filter((line) => {
        if (!messageMatchesSessionFilter(line) || !messageMatchesCategoryFilter(line)) {
            return false
        }

        return !queryText.value || line.name?.toLowerCase().includes(queryText.value.toLowerCase())
    })
})

export function useUiModel() {
    return {
        categoriesFilter,
        drawerVisible,
        errorDialogText,
        errorDialogVisible,
        filteredLines,
        ICON_TYPES,
        logDialogVisible,
        queryText,
        resetState,
        showError,
        toggleDrawer,
    }
}
