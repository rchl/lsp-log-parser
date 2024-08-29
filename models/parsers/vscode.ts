import type { Message } from '../log-model'
import type { Parser } from '../parser-model'

const parser: Parser = {
    name: 'VSCode or coc.nvim',
    lineRegex: /^\[(Trace|Info|Error)\s+-\s+([0-9:.APM ]+)\] (?:(Sending|Received) (\w+) |)(.+)/,
    parse(inputLines) {
        const lines: Message[] = []
        let id = 1
        let message: Message = {
            id,
            isExpanded: false,
            name: '',
            toServer: true,
        }

        const tempChildren: Record<number, string[]> = {}

        for (const [i, line] of inputLines.entries()) {
            const newHeaderMatch = line.match(this.lineRegex)

            if (newHeaderMatch) {
                // Process completed object first.
                if (message.name) {
                    const childParams = tempChildren[id]
                    if (childParams) {
                        tempChildren[id] = []
                        message.payload = childParams.join('\n')
                    }

                    lines.push(message)
                    message = {
                        id: ++id,
                        isExpanded: false,
                        name: '',
                        toServer: true,
                    }
                }

                const direction = newHeaderMatch[3] ? newHeaderMatch[3].toLowerCase() : null
                // const messageType = newHeaderMatch[4]
                const messageText = newHeaderMatch[5].trim().replace(/(^'|'\.?$)/g, '')
                message.name = messageText
                message.time = newHeaderMatch[2]
                message.type = newHeaderMatch[1].toLowerCase() as Message['type']
                message.toServer = direction === 'sending'
            } else {
                if (!message.name) {
                    throw new Error(`Message content with no parent (line ${i}.`)
                }

                if (!tempChildren[id]) {
                    tempChildren[id] = []
                }

                tempChildren[id].push(line)
            }
        }

        if (message.name) {
            const childParams = tempChildren[id]
            if (childParams) {
                message.payload = childParams.join('\n')
            }

            lines.push(message)
        }

        return {
            filters: [],
            lines,
        }
    },
}

export default parser
