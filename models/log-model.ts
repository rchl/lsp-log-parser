import { ref } from '@vue/composition-api'

export interface Message {
  id: number
  isExpanded?: boolean
  requestId?: number
  // A key that is equal for two related request-response calls.
  pairKey?: string
  name: string
  payload?: string | Record<string, any>
  toServer: boolean
  isError?: boolean
  time?: string
  timestamp?: number
  timeLatency?: number
  type?: 'reqres' | 'notification' | 'error'
  serverName?: string
}

type MessageMapping = Record<string, Message>

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
let messageMapping: MessageMapping = {}

function setParseResults (data: ParseResults) {
  clearMessages()
  parsedFilters.value = data.filters
  parsedLines.value = data.lines
  for (const line of parsedLines.value) {
    updateRelatedMessage(line)
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

  updateRelatedMessage(message)

  // If an error, and previous was also an error, merge together.
  if (message.type === 'error') {
    const previousMessage = parsedLines.value[parsedLines.value.length - 1]
    if (previousMessage && previousMessage.type === message.type && previousMessage.serverName === message.serverName) {
      previousMessage.payload += '\n' + message.payload
      return
    }
  }

  parsedLines.value.push(message)

  if (message.serverName && !parsedFilters.value.includes(message.serverName)) {
    parsedFilters.value.push(message.serverName)
    selectedFilters.value.push({
      name: message.serverName,
      enabled: true
    })
  }
}

function updateRelatedMessage (message: Message) {
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
  messageMapping = {}
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
