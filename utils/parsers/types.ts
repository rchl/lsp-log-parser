export interface Message {
  id: number
  isExpanded?: boolean
  requestId?: number
  // A key that is equal for two related request-response calls.
  pairKey?: string
  name: string
  payload?: string
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

export interface Parser {
  name: string;
  lineRegex: RegExp;
  parse(inputLines: string[]): ParseResults;
}

export interface SelectedFilter {
  name: string,
  enabled: Boolean
}
