import type { Message } from '../log-model'
import type { Parser } from '../parser-model'

const parser: Parser = {
    name: 'Sublime LSP',
    lineRegex: /^::\s+(?:\[(?<time>[0-9:.]+)\])\s+(?<direction>[^ ]+)\s+(?<serverName>[^ ]+)(?<type>\s+[a-zA-Z0-9/$]+)?(?:\s+\((?<requestId>\d+)\))?(?:\s+\(duration: (?:(?<duration>\d+)ms|-)\))?:\s*(?<params>.*)/,
    parse(inputLines) {
        const messageMapping: Record<string, Message> = {}

        function updatePairing(serverName: string, isRequest: boolean, toServer: boolean, requestId: number, message: Message) {
            const pairKey = `${serverName}-${toServer ? 'c' : 's'}-${requestId}`
            if (isRequest) {
                message.pairKey = pairKey
                messageMapping[pairKey] = message
            } else {
                const matchingPairKey = `${serverName}-${!toServer ? 'c' : 's'}-${requestId}`
                const pairMessage = messageMapping[matchingPairKey]
                if (pairMessage) {
                    if (!message.name) {
                        message.name = pairMessage.name
                        if (message.timestamp && pairMessage.timestamp) {
                            message.timeLatency = message.timestamp - pairMessage.timestamp
                        }
                    }
                    message.pairKey = matchingPairKey
                }
            }
        }

        const lines = []
        const filters: string[] = []
        let id = 1

        for (const line of inputLines) {
            const match = line.match(this.lineRegex)

            if (match) {
                const time = match.groups?.time as string
                const direction = match.groups?.direction as string
                const toServer = direction.includes('>')
                const isRequest = direction === '-->' || direction === '<--'
                const serverName = match.groups?.serverName as string
                const requestId = match.groups?.requestId as number | undefined
                const duration = match.groups?.duration as number | undefined
                const type = match.groups?.type as string
                const params = match.groups?.params
                const message: Message = {
                    id: ++id,
                    isExpanded: false,
                    name: type,
                    type: requestId ? 'reqres' : 'notification',
                    serverName,
                    toServer,
                    time,
                    requestId,
                    timeLatency: duration,
                }

                if (params) {
                    message.payload = params
                }

                if (!filters.includes(serverName)) {
                    filters.push(serverName)
                }

                if (requestId !== undefined) {
                    updatePairing(serverName, isRequest, toServer, requestId, message)
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
                        type: 'info' as Message['type'],
                        serverName,
                    })
                } else {
                    lines.push({
                        id: ++id,
                        isExpanded: false,
                        name: line,
                        toServer: false,
                        type: 'info' as Message['type'],
                    })
                }
            }
        }

        return {
            filters,
            lines,
        }
    },
}

export default parser
