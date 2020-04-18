import { Message, Parser } from './types'

const parser: Parser = {
  name: 'VSCode',
  lineRegex: /^\[(Trace|Info|Error) - ([0-9:APM ]+)\] (Sending|Received) (\w+) (.+)/,
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
            message.children = [{ id: ++id, name: message.tempChildren.join('\n') }]
          }

          lines.push(message)
          message = { id: ++id, name: '' }
        }

        message.name = `[${newHeaderMatch[2]}] ${newHeaderMatch[5]} (${newHeaderMatch[4]})`
        message.type = newHeaderMatch[1].toLowerCase()
        const direction = newHeaderMatch[3].toLowerCase()
        if (direction === 'sending' || direction === 'received') {
          message.directionIcon = direction === 'sending' ? 'mdi-email-send-outline' : 'mdi-email-receive'
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
        message.children = [{ id: ++id, name: message.tempChildren.join('\n') }]
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
