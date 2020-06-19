import { Message, Parser } from './types'

const parser: Parser = {
  name: 'Sublime LSP',
  lineRegex: /^::\s+([^ ]+)\s+([^ ]+)\s+([^:\n]+):?\s*(.*)/,
  parse (inputLines) {
    const lines = []
    const filters: string[] = []
    let id = 1
    let message: Message = {
      id,
      name: '',
      toServer: false
    }

    for (const line of inputLines) {
      const lspMatch = line.match(this.lineRegex)

      if (lspMatch) {
        const direction = lspMatch[1]
        const toServer = direction.includes('>')
        const serverName = lspMatch[2]
        const type = lspMatch[3]
        const params = lspMatch[4]
        message = {
          id: ++id,
          isExpanded: false,
          name: type,
          type,
          filter: serverName,
          toServer
        }

        if (params) {
          message.child = {
            id: ++id,
            isExpanded: false,
            isChild: true,
            name: params,
            filter: serverName,
            toServer
          }
        }

        if (!filters.includes(serverName)) {
          filters.push(serverName)
        }

        lines.push(message)
      } else {
        const infoMessageMatch = line.match(/^([^:]+)?: (.+)/)

        if (infoMessageMatch) {
          const serverName = infoMessageMatch[1]
          const text = infoMessageMatch[2]

          lines.push({
            id: ++id,
            isExpanded: false,
            name: `(${serverName}) ${text}`,
            toServer: false,
            type: 'info',
            filter: serverName
          })
        } else {
          lines.push({
            id: ++id,
            isExpanded: false,
            name: line,
            toServer: false,
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
