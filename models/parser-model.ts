import { ParseResults } from '~/models/log-model'
import parsers from '~/models/parsers'

export interface Parser {
    name: string;
    lineRegex: RegExp;
    parse(inputLines: string[]): ParseResults;
}

function contentSniffParser(lines: string[]): Parser | null {
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

export function useParserModel() {
    return {
        contentSniffParser,
    }
}
