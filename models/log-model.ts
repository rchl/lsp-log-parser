import { ref } from '@vue/composition-api'

export interface LogProvider {
    clear(): void;
}

export interface Message {
    id: number;
    isExpanded?: boolean;
    requestId?: number;
    // A key that is equal for two related request-response calls.
    pairKey?: string;
    name?: string;
    payload?: string | Record<string, any>;
    payloadSummary?: string;
    toServer: boolean;
    isError?: boolean;
    time?: string;
    timestamp?: number;
    timeLatency?: number;
    type?: 'reqres' | 'notification' | 'error' | 'info';
    serverName?: string;
}

export interface ParseResults {
    lines: Message[];
    filters: string[];
}

type SelectedFilter = {
    name: string;
    enabled: boolean;
}

const REMOTE_MESSAGE_COUNT_LIMIT = 220

const logProviders: LogProvider[] = []
const parsedFilters = ref<ParseResults['filters']>([])
const parsedLines = ref<ParseResults['lines']>([])
const selectedFilters = ref<SelectedFilter[]>([])

function registerLogProvider(logProvider: LogProvider): void {
    console.assert(!logProviders.includes(logProvider), 'LogProvider already registered')
    logProviders.push(logProvider)
}

function setParseResults(data: ParseResults) {
    clearMessages()
    parsedFilters.value = data.filters
    parsedLines.value = data.lines
    selectedFilters.value = parsedFilters.value.map(filter => ({
        name: filter,
        enabled: true,
    }))
}

function appendLogMessage(message: Message) {
    if (parsedLines.value.length > REMOTE_MESSAGE_COUNT_LIMIT) {
        console.warn(`Trimming messages due to reaching the limit of ${REMOTE_MESSAGE_COUNT_LIMIT}`)
        parsedLines.value.splice(0, 20)
    }

    // If an error, and previous was also an error, merge together.
    if (message.type === 'error') {
        const previousMessage = parsedLines.value[parsedLines.value.length - 1]
        if (previousMessage && previousMessage.type === message.type && previousMessage.serverName === message.serverName) {
            previousMessage.payload += `\n${message.payload}`
            return
        }
    }

    parsedLines.value.push(message)

    if (message.serverName && !parsedFilters.value.includes(message.serverName)) {
        parsedFilters.value.push(message.serverName)
        selectedFilters.value.push({
            name: message.serverName,
            enabled: true,
        })
    }
}

function clearMessages() {
    parsedFilters.value = []
    parsedLines.value = []
    selectedFilters.value = []
    for (const logProvider of logProviders) {
        logProvider.clear()
    }
}

export function useLogModel() {
    return {
        appendLogMessage,
        clearMessages,
        parsedFilters,
        parsedLines,
        registerLogProvider,
        REMOTE_MESSAGE_COUNT_LIMIT,
        selectedFilters,
        setParseResults,
    }
}
