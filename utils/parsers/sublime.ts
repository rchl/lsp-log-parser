import { Message, Parser } from './types'

const parser: Parser = {
  name: 'Sublime LSP',
  lineRegex: /^::\s+([^ ]+)\s+([^ ]+)\s+([^:\n]+):?\s*(.*)/,
  parse (inputLines) {
    const lines = []
    const filters: string[] = []
    let id = 1
    let message: Message = { id, name: '' }

    for (const line of inputLines) {
      const lspMatch = line.match(this.lineRegex)

      if (lspMatch) {
        const direction = lspMatch[1]
        const serverName = lspMatch[2]
        const type = lspMatch[3]
        const params = lspMatch[4]
        message = { id: ++id, name: `(${serverName}) ${type}`, type, filter: serverName }

        if (params) {
          message.children = [{
            id: ++id,
            name: params,
            filter: serverName
          }]
        }

        if (!filters.includes(serverName)) {
          filters.push(serverName)
        }

        if (direction.includes('>') || direction === 'received') {
          message.directionIcon = 'mdi-email-send-outline'
        } else if (direction.includes('<')) {
          message.directionIcon = 'mdi-email-receive'
        } else {
          message.directionIcon = 'mdi-sync-alert'
        }

        lines.push(message)
      } else {
        const infoMessageMatch = line.match(/^([^:]+)?: (.+)/)

        if (infoMessageMatch) {
          const serverName = infoMessageMatch[1]
          const text = infoMessageMatch[2]

          lines.push({
            id: ++id,
            name: `(${serverName}) ${text}`,
            type: 'info',
            filter: serverName
          })
        } else {
          lines.push({
            id: ++id,
            name: line,
            type: 'info'
          })
        }
      }
    }

    return {
      filters,
      lines
    }
  }
}

export default parser
