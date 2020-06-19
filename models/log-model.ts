import { ref } from '@vue/composition-api'
import { parsers, Parser, ParseResults, SelectedFilter, Message } from '~/utils'

type MessageMapping = Record<NonNullable<Message['requestId']>, Message>

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
    if (line.requestId) {
      updateResponse(line)
    }
  }
  selectedFilters.value = parsedFilters.value.map(filter => ({
    name: filter,
    enabled: true
  }))
}

function contentSniffParser (lines: string[]): Parser | null {
  let highestHits = 0
  let highestParserIndex = -1

  for (const [index, parser] of parsers.entries()) {
    const hits = lines.filter(chunk => parser.lineRegex.test(chunk)).length
    if (hits > highestHits) {
      highestHits = hits
      highestParserIndex = index
    }
  }

  let parser = null

  if (highestParserIndex !== -1) {
    parser = parsers[highestParserIndex]
  }

  return parser
}

function appendLogMessage (message: Message) {
  if (parsedLines.value.length > REMOTE_MESSAGE_COUNT_LIMIT) {
    parsedLines.value.splice(0, 20)
  }

  if (message.requestId) {
    updateResponse(message)
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

function updateResponse (message: Message) {
  const { requestId } = message
  if (requestId) {
    const request = messageMapping[requestId]
    if (request) {
      message.name = request.name
      if (message.timestamp && request.timestamp) {
        message.timeLatency = message.timestamp - request.timestamp
      }
    } else {
      messageMapping[requestId] = message
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
    contentSniffParser,
    parsedFilters,
    parsedLines,
    REMOTE_MESSAGE_COUNT_LIMIT,
    selectedFilters,
    setParseResults
  }
}
