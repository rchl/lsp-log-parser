import { ref, watch } from '@vue/composition-api'
import { Message, useLogModel, LogProvider } from '~/models/log-model'

const connected = ref(false)
const enabled = ref(false)
const hasConnectedAtLeastOnce = ref(false)
const errorText = ref('')
const logModel = useLogModel()

class RemoteLogProvider implements LogProvider {
  lastId: number = 0
  socket: WebSocket | null = null
  messageMapping: Record<string, Message> = {};

  constructor () {
    watch(enabled, (isEnabled) => {
      if (isEnabled) {
        hasConnectedAtLeastOnce.value = false
        this._initializeConnection()
      } else {
        this._closeConnection()
      }
    })
  }

  clear () {
    this.messageMapping = {}
    this.lastId = 0
  }

  _initializeConnection () {
    errorText.value = ''
    this._createWebSocket()
  }

  _createWebSocket () {
    if (!enabled.value) {
      console.info('Not enabled, not creating new connection')
      return
    }

    this.socket = new WebSocket('ws://localhost:9981')
    this.socket.onopen = () => this._onOpen()
    this.socket.onmessage = event => this._onMessage(event)
    this.socket.onclose = event => this._onClose(event)
    this.socket.onerror = event => this._onError(event)
  }

  _closeConnection () {
    console.info('Triggered manual close')
    connected.value = false
    errorText.value = ''

    if (this.socket) {
      this.socket.close()
      this.socket = null
    }
  }

  _onOpen () {
    console.info('Connection opened')
    errorText.value = ''
    connected.value = true
    hasConnectedAtLeastOnce.value = true
  }

  _onError (event: Event) {
    console.info('Got error event', event)
  }

  _onClose (event: CloseEvent) {
    if (!event.wasClean) {
      connected.value = false
      this.socket = null

      if (enabled.value) {
        const reason = event.reason ? event.reason : `code: ${event.code}`
        errorText.value = `Error connecting to remote (${reason})`
        console.info('Unclean shutdown, retrying...')
        setTimeout(this._createWebSocket, 2000)
      }
    }
  }

  _onMessage (event: MessageEvent) {
    let data
    try {
      data = JSON.parse(event.data)
    } catch (error) {
      console.error('Error parsing the message data', event.data)
      return
    }

    const isRequestOrResponse = typeof (data.id) === 'number'
    const isResponse = isRequestOrResponse && !data.method
    const toServer = data.direction === 1
    const initiatedByServer = (!isResponse && !toServer) || (isResponse && toServer)

    const message: Message = {
      id: ++this.lastId,
      isExpanded: false,
      requestId: data.id,
      pairKey: isRequestOrResponse ? `${data.server || ''}-${initiatedByServer ? 's' : 'c'}-${data.id}` : '',
      name: data.method,
      type: isRequestOrResponse ? 'reqres' : data.isError ? 'error' : 'notification',
      isError: data.isError,
      time: new Date(data.time).toLocaleTimeString(),
      timestamp: data.time,
      toServer,
      serverName: data.server
    }

    this._updateRelatedMessage(message)

    if (data.params) {
      message.payload = data.params
      if (!data.isError && message.name) {
        message.payloadSummary = this._createPayloadSummary(message.name, message.payload, !isResponse)
      }
    }

    logModel.appendLogMessage(message)
  }

  _updateRelatedMessage (message: Message) {
    const { pairKey } = message
    if (pairKey) {
      const request = this.messageMapping[pairKey]
      if (request) {
        if (!message.name) {
          message.name = request.name
          if (message.timestamp && request.timestamp) {
            message.timeLatency = message.timestamp - request.timestamp
          }
        }
      } else {
        this.messageMapping[pairKey] = message
      }
    }
  }

  _createPayloadSummary (method: string, payload: any, isRequest: boolean): string {
    let result = ''
    if (method.startsWith('textDocument')) {
      const textDocumentMethod = method.slice('textDocument'.length + 1)
      if (isRequest) {
        if (['hover', 'documentHighlight'].includes(textDocumentMethod)) {
          result += `[${payload.position.line}, ${payload.position.character} for `
        }
        if (['didOpen', 'didClose', 'didChange', 'codeAction', 'documentColor'].includes(textDocumentMethod)) {
          result += `uri: ${payload.textDocument.uri}`
        }
      }
      if (textDocumentMethod === 'publishDiagnostics') {
        result += `${payload.diagnostics.length} diagnostics for uri: ${payload.uri}`
      }
    }
    return result
  }
}

logModel.registerLogProvider(new RemoteLogProvider())

export function useRemoteModel () {
  return {
    connected,
    enabled,
    errorText,
    hasConnectedAtLeastOnce
  }
}
