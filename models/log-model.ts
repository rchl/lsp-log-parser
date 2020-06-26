import { ref } from '@vue/composition-api'

type MessageMapping = Record<string, Message>

export interface Message {
  id: number
  isExpanded?: boolean
  requestId?: number
  // A key that is equal for two related request-response calls.
  pairKey?: string
  name: string
  payload?: string
  payloadTabIndex: number
  toServer: boolean
  isError?: boolean
  time?: string
  timestamp?: number
  timeLatency?: number
  type?: string
  serverName?: string
}

export interface ParseResults {
  lines: Message[]
  filters: string[]
}

type SelectedFilter = {
  name: string,
  enabled: Boolean
}

const REMOTE_MESSAGE_COUNT_LIMIT = 220

const parsedFilters = ref<ParseResults['filters']>([])
const parsedLines = ref<ParseResults['lines']>([])
const selectedFilters = ref<SelectedFilter[]>([])
const messageMapping: MessageMapping = {}

function setParseResults (data: ParseResults) {
  clearMessages()
  parsedFilters.value = data.filters
  parsedLines.value = data.lines
  for (const line of parsedLines.value) {
    updateResponse(line)
  }
  selectedFilters.value = parsedFilters.value.map(filter => ({
    name: filter,
    enabled: true
  }))
}

function appendLogMessage (message: Message) {
  if (parsedLines.value.length > REMOTE_MESSAGE_COUNT_LIMIT) {
    parsedLines.value.splice(0, 20)
  }

  updateResponse(message)

  parsedLines.value.push(message)

  if (message.serverName && !parsedFilters.value.includes(message.serverName)) {
    parsedFilters.value.push(message.serverName)
    selectedFilters.value.push({
      name: message.serverName,
      enabled: true
    })
  }
}

function updateResponse (message: Message) {
  const { pairKey } = message
  if (pairKey) {
    const request = messageMapping[pairKey]
    if (request) {
      if (!message.name) {
        message.name = request.name
        if (message.timestamp && request.timestamp) {
          message.timeLatency = message.timestamp - request.timestamp
        }
      }
    } else {
      messageMapping[pairKey] = message
    }
  }
}

function clearMessages () {
  parsedFilters.value = []
  parsedLines.value = []
  selectedFilters.value = []
}

export function useLogModel () {
  return {
    appendLogMessage,
    clearMessages,
    parsedFilters,
    parsedLines,
    REMOTE_MESSAGE_COUNT_LIMIT,
    selectedFilters,
    setParseResults
  }
}
