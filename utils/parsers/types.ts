export interface Message {
  id: number
  isExpanded?: boolean
  requestId?: number
  name: string
  child?: Message
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
