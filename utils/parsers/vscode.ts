import { Message, Parser } from './types'

const parser: Parser = {
  name: 'VSCode',
  lineRegex: /^\[(Trace|Info|Error)\s+-\s+([0-9:APM ]+)\] (?:(Sending|Received) (\w+) |)(.+)/,
  parse (inputLines) {
    const lines = []
    let id = 1
    let message: Message = {
      id,
      name: '',
      toServer: true
    }

    for (const [i, line] of inputLines.entries()) {
      const newHeaderMatch = line.match(this.lineRegex)

      if (newHeaderMatch) {
        // Process completed object first.
        if (message.name) {
          if (message.tempChildren) {
            message.child = {
              id: ++id,
              name: message.tempChildren.join('\n'),
              toServer: message.toServer
            }
          }

          lines.push(message)
          message = {
            id: ++id,
            isExpanded: false,
            name: '',
            toServer: true
          }
        }

        const direction = newHeaderMatch[3] ? newHeaderMatch[3].toLowerCase() : null
        // const messageType = newHeaderMatch[4]
        const messageText = newHeaderMatch[5].trim().replace(/(^'|'\.?$)/g, '')
        message.name = messageText
        message.time = newHeaderMatch[2]
        message.type = newHeaderMatch[1].toLowerCase()
        message.toServer = direction === 'sending'
      } else {
        if (!message.tempChildren) {
          message.tempChildren = []
        }

        if (!message.name) {
          throw new Error(`Message content with no parent (line ${i}.`)
        }

        message.tempChildren.push(line)
      }
    }

    if (message.name) {
      if (message.tempChildren) {
        message.child = {
          id: ++id,
          isExpanded: false,
          name: message.tempChildren.join('\n'),
          toServer: message.toServer
        }
      }

      lines.push(message)
    }

    return {
      filters: [],
      lines
    }
  }
}

export default parser
