import * as lsp from 'vscode-languageserver-protocol'
import { ref, watch } from '@vue/composition-api'
import { Message, useLogModel, LogProvider } from '~/models/log-model'

const connected = ref(false)
const enabled = ref(false)
const hasConnectedAtLeastOnce = ref(false)
const errorText = ref('')
const logModel = useLogModel()

type Outgoing = 1
type Incoming = 2
type Direction = Outgoing | Incoming

function isRequestOrResponse(message: Base<Outgoing | Incoming>): message is RequestOrResponse<Outgoing | Incoming> {
    return 'id' in message
}

function isRequest(message: RemoteMessage): message is OutgoingRequest | IncomingRequest {
    return 'method' in message
}

function isIncoming(message: RequestOrResponse<Outgoing | Incoming> | Notification<Outgoing | Incoming>): message is RequestOrResponse<Incoming> | Notification<Incoming> {
    return message.direction === 1
}

function isStderrMessage(message: RemoteMessage): message is IncomingStderrMessage {
    return 'method' in message && message.method === 'stderr'
}

interface Base<Dir extends Direction> {
    direction: Dir;
    params: any;
    server: string;
    time: number;
}

interface IncomingStderrMessage extends Base<Incoming> {
    method: 'stderr';
    isError: true;
}

interface RequestOrResponse<Dir extends Direction> extends Base<Dir> {
    id: any;
}

interface Notification<Dir extends Direction> extends Base<Dir> {
    method: string;
}

interface IncomingNotification extends Notification<Outgoing> {
    error?: 'Unhandled notification!';
}

interface OutgoingNotification extends Notification<Outgoing> {}

interface IncomingRequest extends RequestOrResponse<Incoming> {
    method: string;
}

interface IncomingResponse extends RequestOrResponse<Incoming> {
    isError: boolean;
}

interface OutgoingRequest extends RequestOrResponse<Outgoing> {
    method: string;
}

interface OutgoingResponse extends RequestOrResponse<Outgoing> {}

interface OutgoingErrorResponse extends RequestOrResponse<Outgoing> {
    isError: true;
}

type RemoteMessage = IncomingNotification | OutgoingNotification | IncomingRequest | IncomingResponse | OutgoingRequest | OutgoingResponse | OutgoingErrorResponse | IncomingStderrMessage

class RemoteLogProvider implements LogProvider {
    lastId = 0
    socket: WebSocket | null = null
    messageMapping: Record<string, Message> = {}

    constructor() {
        watch(enabled, (isEnabled) => {
            if (isEnabled) {
                hasConnectedAtLeastOnce.value = false
                this._initializeConnection()
            } else {
                this._closeConnection()
            }
        })
    }

    clear() {
        this.messageMapping = {}
        this.lastId = 0
    }

    _initializeConnection() {
        errorText.value = ''
        this._createWebSocket()
    }

    _createWebSocket() {
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

    _closeConnection() {
        console.info('Triggered manual close')
        connected.value = false
        errorText.value = ''

        if (this.socket) {
            this.socket.close()
            this.socket = null
        }
    }

    _onOpen() {
        console.info('Connection opened')
        errorText.value = ''
        connected.value = true
        hasConnectedAtLeastOnce.value = true
    }

    _onError(event: Event) {
        console.info('Got error event', event)
    }

    _onClose(event: CloseEvent) {
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

    _onMessage(event: MessageEvent) {
        const data = this._parseMessage(event.data)
        if (!data) {
            return
        }

        const message: Message = {
            id: ++this.lastId,
            isExpanded: false,
            name: 'method' in data ? data.method : undefined,
            type: isRequestOrResponse(data) ? 'reqres' : isStderrMessage(data) ? 'error' : 'notification',
            isError: Boolean('isError' in data && data.isError || 'error' in data && data.error),
            timestamp: data.time,
            toServer: data.direction === 1,
            serverName: data.server,
        }

        if (isRequestOrResponse(data)) {
            message.requestId = data.id
            message.pairKey = `${data.server}-${isRequest(data) && isIncoming(data) || !isRequest(data) && !isIncoming(data) ? 's' : 'c'}-${data.id}`
            this._updateRelatedMessage(message.pairKey, message)
        }

        if (message.timestamp) {
            const date = new Date(message.timestamp)
            message.time = `${date.toLocaleTimeString()}.${date.getMilliseconds()}`
        }

        if (data.params) {
            message.payload = data.params
            if (!message.isError && message.name) {
                message.payloadSummary = this._createPayloadSummary(message.name, message.payload, isRequestOrResponse(data) && isRequest(data))
            }
        }

        logModel.appendLogMessage(message)
    }

    _parseMessage(data: any): RemoteMessage | null {
        try {
            return JSON.parse(data)
        } catch (error) {
            console.error('Error parsing the message data', data)
            return null
        }
    }

    _updateRelatedMessage(pairKey: string, message: Message) {
        const pairMessage = this.messageMapping[pairKey]
        if (pairMessage) {
            if (!message.name) {
                message.name = pairMessage.name
                if (message.timestamp && pairMessage.timestamp) {
                    message.timeLatency = message.timestamp - pairMessage.timestamp
                }
            }
        } else {
            this.messageMapping[pairKey] = message
        }
    }

    _createPayloadSummary(method: string, payload: any, isRequest: boolean): string {
        let result = ''
        if (method.startsWith('textDocument')) {
            const textDocumentMethod = method.slice('textDocument'.length + 1)
            if (isRequest) {
                if (['completion', 'hover', 'documentHighlight', 'signatureHelp'].includes(textDocumentMethod)) {
                    result += `at (${payload.position.line}, ${payload.position.character}) for `
                }
                if (textDocumentMethod === 'didOpen') {
                    result += `langugageId: ${(payload as lsp.DidOpenTextDocumentParams).textDocument.languageId}, `
                }
                if (['didOpen', 'didClose', 'didChange', 'didSave', 'codeAction', 'completion', 'documentColor', 'documentHighlight', 'hover', 'signatureHelp'].includes(textDocumentMethod)) {
                    result += `uri: ${(payload as lsp.DidOpenTextDocumentParams).textDocument.uri}`
                }
            } else {
                if (textDocumentMethod === 'completion') {
                    const completions: lsp.CompletionItem[] | lsp.CompletionList = payload
                    if (Array.isArray(completions)) {
                        result += `${completions.length} completions`
                    } else {
                        result += `${completions.items.length} completions`
                        if (completions.isIncomplete) {
                            result += ' (incomplete)'
                        }
                    }
                } else if (textDocumentMethod === 'documentHighlight') {
                    result += `${(payload as lsp.DocumentHighlight[]).length} highlights`
                } else if (textDocumentMethod === 'codeAction') {
                    result += `${(payload as lsp.CodeAction[]).length} code actions`
                }
            }
            if (textDocumentMethod === 'publishDiagnostics') {
                const params: lsp.PublishDiagnosticsParams = payload
                result += `${params.diagnostics.length} diagnostics for uri: ${params.uri}`
            }
        } else if (method === 'window/logMessage') {
            const params = payload as lsp.LogMessageParams
            result += `(${toMessageTypeText(params.type)}) ${params.message}`
        }
        return result
    }
}

function toMessageTypeText(type: lsp.MessageType): string {
    switch (type) {
        case lsp.MessageType.Error:
            return 'Error'
        case lsp.MessageType.Info:
            return 'Info'
        case lsp.MessageType.Log:
            return 'Log'
    }
    return 'Unknown Type'
}

logModel.registerLogProvider(new RemoteLogProvider())

export function useRemoteModel() {
    return {
        connected,
        enabled,
        errorText,
        hasConnectedAtLeastOnce,
    }
}
