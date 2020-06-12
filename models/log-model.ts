import { ref } from '@vue/composition-api'
import { parsers, Parser, ParseResults, SelectedFilter, Message } from '~/utils'

const parsedFilters = ref<ParseResults['filters']>([])
const parsedLines = ref<ParseResults['lines']>([])
const selectedFilters = ref<SelectedFilter[]>([])

function setParseResults (data: ParseResults) {
  parsedFilters.value = data.filters
  parsedLines.value = data.lines
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
  parsedLines.value.push(message)

  if (message.filter && !parsedFilters.value.includes(message.filter)) {
    parsedFilters.value.push(message.filter)
    selectedFilters.value.push({
      name: message.filter,
      enabled: true
    })
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
    selectedFilters,
    setParseResults
  }
}
