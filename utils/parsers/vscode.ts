import { Message, Parser } from './types'

const parser: Parser = {
  name: 'VSCode',
  lineRegex: /^\[(Trace|Info|Error)\s+-\s+([0-9:APM ]+)\] (?:(Sending|Received) (\w+) |)(.+)/,
  parse (inputLines) {
    const lines = []
    let id = 1
    let message: Message = { id, name: '' }

    for (const [i, line] of inputLines.entries()) {
      const newHeaderMatch = line.match(this.lineRegex)

      if (newHeaderMatch) {
        // Process completed object first.
        if (message.name) {
          if (message.tempChildren) {
            message.children = [{
              id: ++id,
              isChild: true,
              name: message.tempChildren.join('\n')
            }]
          }

          lines.push(message)
          message = { id: ++id, name: '' }
        }

        const direction = newHeaderMatch[3] ? newHeaderMatch[3].toLowerCase() : null
        const messageType = newHeaderMatch[4]
        const remainder = newHeaderMatch[5]
        const messageText = direction ? `${remainder} (${messageType})` : remainder
        message.name = `[${newHeaderMatch[2]}] ${messageText}`
        message.type = newHeaderMatch[1].toLowerCase()
        if (direction === 'sending' || direction === 'received') {
          message.directionIcon = direction === 'sending' ? 'mdi-email-send-outline' : 'mdi-email-receive'
        } else {
          message.directionIcon = 'mdi-information-outline'
        }
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
        message.children = [{
          id: ++id,
          isChild: true,
          name: message.tempChildren.join('\n')
        }]
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
