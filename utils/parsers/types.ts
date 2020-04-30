export interface Message {
  id: number
  isChild?: boolean
  name: string
  directionIcon?: string
  children?: Message[]
  tempChildren?: string[]
  type?: string
  filter?: string
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
