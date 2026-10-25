import type lsp from 'vscode-languageserver-protocol'
import { computed, ref, watch } from 'vue'
import { type Message, useLogModel, type LogProvider } from '~/models/log-model'

const CONNECTION_STORAGE_KEY = 'remote-connection'
// Port of the always-running server of LSP versions that don't support token authentication.
const LEGACY_PORT = 9981

interface ConnectionParams {
    port: number;
    token: string;
}

const connectionParams = ref<ConnectionParams | null>(readConnectionParams())
const port = computed(() => connectionParams.value?.port ?? LEGACY_PORT)
const connected = ref(false)
const enabled = ref(false)
// When paused, incoming messages are dropped rather than buffered.
const paused = ref(false)
const hasConnectedAtLeastOnce = ref(false)
const errorText = ref('')
const logModel = useLogModel()

/**
 * Reads the connection parameters passed by Sublime Text in the URL fragment (it's not sent to the server hosting the
 * page). The parameters are stored in the session storage so that the connection still works after reloading the page
 * once the fragment is removed from the URL (see `isConnectionParamsInUrl`).
 */
function readConnectionParams(): ConnectionParams | null {
    const hashParams = new URLSearchParams(window.location.hash.slice(1))
    const port = hashParams.get('port')
    const token = hashParams.get('token')
    if (port && token) {
        const params: ConnectionParams = { port: Number(port), token }
        try {
            sessionStorage.setItem(CONNECTION_STORAGE_KEY, JSON.stringify(params))
        } catch {
            // Storage not available.
        }
        return params
    }
    try {
        const stored = sessionStorage.getItem(CONNECTION_STORAGE_KEY)
        if (stored) {
            return JSON.parse(stored) as ConnectionParams
        }
    } catch {
        // Storage not available or invalid data.
    }
    return null
}

enum Direction {
    Outgoing = 1,
    Incoming = 2
}

enum MessageType {
    IncomingNotification,
    OutgoingNotification,
    IncomingRequest,
    IncomingResponse,
    OutgoingRequest,
    OutgoingResponse,
    OutgoingErrorResponse,
    IncomingStderrMessage
}

function getMessageType(message: RemoteMessage): MessageType {
    if ('id' in message) {
        if ('method' in message) {
            if (message.direction === Direction.Incoming) {
                return MessageType.IncomingRequest
            } else {
                return MessageType.OutgoingRequest
            }
        } else {
            if (message.direction === Direction.Incoming) {
                return MessageType.IncomingResponse
            } else {
                if ('isError' in message) {
                    return MessageType.OutgoingErrorResponse
                }
                return MessageType.OutgoingResponse
            }
        }
    } else {
        if (message.direction === Direction.Incoming) {
            if ('isError' in message) {
                return MessageType.IncomingStderrMessage
            }
            return MessageType.IncomingNotification
        } else {
            return MessageType.OutgoingNotification
        }
    }
}

function isRequestOrResponse(message: BaseMessage<Direction.Outgoing | Direction.Incoming>): message is RequestOrResponse<Direction.Outgoing | Direction.Incoming> {
    return 'id' in message
}

function isIncoming(messageType: MessageType): messageType is MessageType.IncomingRequest | MessageType.IncomingResponse | MessageType.IncomingNotification {
    return [MessageType.IncomingRequest, MessageType.IncomingResponse, MessageType.IncomingNotification].includes(messageType)
}

function isOutgoing(messageType: MessageType): messageType is MessageType.OutgoingRequest | MessageType.OutgoingNotification {
    return [MessageType.OutgoingRequest, MessageType.OutgoingNotification].includes(messageType)
}

function isStderrMessage(message: RemoteMessage): message is IncomingStderrMessage {
    return 'method' in message && message.method === 'stderr'
}

interface BaseMessage<D extends Direction> {
    type: MessageType;
    direction: D;
    params: unknown;
    server: string;
    time: number;
}

interface IncomingStderrMessage extends BaseMessage<Direction.Incoming> {
    type: MessageType.IncomingStderrMessage;
    method: 'stderr';
    isError: true;
}

interface RequestOrResponse<D extends Direction> extends BaseMessage<D> {
    type: MessageType.IncomingRequest | MessageType.IncomingResponse | MessageType.OutgoingRequest | MessageType.OutgoingResponse | MessageType.OutgoingErrorResponse;
    id: string | number;
}

interface IncomingRequest extends RequestOrResponse<Direction.Incoming> {
    type: MessageType.IncomingRequest;
    method: string;
}

interface IncomingResponse extends RequestOrResponse<Direction.Incoming> {
    type: MessageType.IncomingResponse;
    isError: boolean;
}

interface OutgoingRequest extends RequestOrResponse<Direction.Outgoing> {
    type: MessageType.OutgoingRequest;
    method: string;
}

interface OutgoingResponse extends RequestOrResponse<Direction.Outgoing> {
    type: MessageType.OutgoingResponse;
}

interface OutgoingErrorResponse extends RequestOrResponse<Direction.Outgoing> {
    type: MessageType.OutgoingErrorResponse;
    isError: true;
}

interface Notification<D extends Direction> extends BaseMessage<D> {
    type: MessageType.IncomingNotification | MessageType.OutgoingNotification;
    method: string;
}

interface IncomingNotification extends Notification<Direction.Incoming> {
    type: MessageType.IncomingNotification;
    error?: 'Unhandled notification!';
}

interface OutgoingNotification extends Notification<Direction.Outgoing> {
    type: MessageType.OutgoingNotification;
}

type RemoteMessage = IncomingNotification | OutgoingNotification | IncomingRequest | IncomingResponse | OutgoingRequest | OutgoingResponse | OutgoingErrorResponse | IncomingStderrMessage

class RemoteLogProvider implements LogProvider {
    private lastId = 0
    private socket: WebSocket | null = null
    private messageMapping: Record<string, Message> = {}
    private semanticLegend: Record<string, lsp.SemanticTokensLegend | undefined> = {}

    constructor() {
        watch(enabled, (isEnabled) => {
            if (isEnabled) {
                hasConnectedAtLeastOnce.value = false
                this._initializeConnection()
            } else {
                paused.value = false
                this._closeConnection()
            }
        })
    }

    public clear() {
        this.messageMapping = {}
        this.lastId = 0
    }

    _initializeConnection() {
        errorText.value = ''
        this._createWebSocket()
    }

    _createWebSocket() {
        if (!enabled.value) {
            console.info('WebSocket: not enabled, not creating new connection')
            return
        }

        const params = connectionParams.value
        // Without connection parameters, fall back to the server of older LSP versions.
        const url = params
            ? `ws://127.0.0.1:${params.port}/?token=${encodeURIComponent(params.token)}`
            : `ws://127.0.0.1:${LEGACY_PORT}`
        this.socket = new WebSocket(url)
        this.socket.onopen = () => this._onOpen()
        this.socket.onmessage = (event: MessageEvent<string>) => this._onMessage(event)
        this.socket.onclose = event => this._onClose(event)
        this.socket.onerror = event => this._onError(event)
    }

    _closeConnection() {
        console.info('WebSocket: triggered manual close')
        connected.value = false
        errorText.value = ''

        if (this.socket) {
            this.socket.close()
            this.socket = null
        }
    }

    _onOpen() {
        console.info('WebSocket: connection opened')
        errorText.value = ''
        connected.value = true
        hasConnectedAtLeastOnce.value = true
    }

    _onError(_event: Event) {
        console.info('WebSocket: error event')
    }

    _onClose(event: CloseEvent) {
        console.info('WebSocket: connection closed')
        if (!event.wasClean) {
            connected.value = false
            this.socket = null

            if (enabled.value) {
                const reason = event.reason ? event.reason : `code: ${event.code}`
                errorText.value = `Error connecting to remote (${reason})`
                console.info('Unclean shutdown, retrying...')
                setTimeout(() => this._createWebSocket(), 2000)
            }
        }
    }

    _onMessage(event: MessageEvent<string>) {
        if (paused.value) {
            return
        }

        const data = this._parseMessage(event.data)
        if (!data) {
            return
        }

        const messageType = getMessageType(data)
        const message: Message<Record<string, any>> = {
            id: ++this.lastId,
            isExpanded: false,
            name: 'method' in data ? data.method : undefined,
            type: isRequestOrResponse(data) ? 'reqres' : isStderrMessage(data) ? 'error' : 'notification',
            isError: Boolean('isError' in data && data.isError || 'error' in data && data.error),
            timestamp: data.time,
            toServer: data.direction === Direction.Outgoing,
            serverName: data.server,
            payload: data.params || undefined,
        }

        if (isRequestOrResponse(data)) {
            message.requestId = data.id
            const isServerInitiatedRequest = messageType === MessageType.IncomingRequest || messageType === MessageType.OutgoingResponse
            message.pairKey = `${data.server}-${isServerInitiatedRequest ? 's' : 'c'}-${data.id}`
            this._updateRelatedMessage(message.pairKey, message)
        } else if (isOutgoing(messageType) && message.name === '$/cancelRequest' && message.payload && 'id' in message.payload) {
            message.pairKey = `${data.server}-c-${message.payload.id}`
            this._updateRelatedMessage(message.pairKey, message)
        }

        if (message.timestamp) {
            const date = new Date(message.timestamp)
            message.time = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()}`
        }

        if (message.payload && !message.isError && message.name) {
            message.payloadSummary = this._createPayloadSummary(message.name, message.payload, message, messageType)
        }

        logModel.appendLogMessage(message)
    }

    _parseMessage(data: string): RemoteMessage | null {
        try {
            return JSON.parse(data) as RemoteMessage
        } catch {
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

    _createPayloadSummary(method: string, payload: Record<string, any>, message: Message, messageType: MessageType): string {
        let result = ''
        if (isOutgoing(messageType)) {
            if (messageType === MessageType.OutgoingRequest) {
                if ('position' in payload) {
                    const { position } = payload as lsp.TextDocumentPositionParams
                    result += `at (${position.line}, ${position.character}) for `
                }
            }

            if ('textDocument' in payload) {
                if ('languageId' in payload.textDocument) {
                    result += `langugageId: ${(payload as lsp.DidOpenTextDocumentParams).textDocument.languageId}, `
                }
                if ('version' in payload.textDocument) {
                    result += `version: ${(payload.textDocument as lsp.VersionedTextDocumentIdentifier).version}, `
                }
                result += `uri: ${(payload.textDocument as lsp.TextDocumentIdentifier).uri}`
            }
        } else if (isIncoming(messageType)) {
            if (messageType === MessageType.IncomingNotification) {
                if (method === 'window/logMessage') {
                    const params = payload as lsp.LogMessageParams
                    result += `(${toMessageTypeText(params.type)}) ${params.message}`
                }

                if (method === 'textDocument/publishDiagnostics') {
                    const params = payload as lsp.PublishDiagnosticsParams
                    result += `${params.diagnostics.length} diagnostics for uri: ${params.uri}`
                }
            } else if (messageType === MessageType.IncomingResponse) {
                if (method === 'initialize') {
                    if (message.serverName) {
                        this.semanticLegend[message.serverName] = (payload as lsp.InitializeResult).capabilities.semanticTokensProvider?.legend
                    }
                } else if (method === 'textDocument/completion') {
                    const completions = payload as lsp.CompletionItem[] | lsp.CompletionList
                    if (Array.isArray(completions)) {
                        result += `${completions.length} completions`
                    } else {
                        result += `${completions.items.length} completions`
                        if (completions.isIncomplete) {
                            result += ' (incomplete)'
                        }
                    }
                } else if (method === 'textDocument/documentHighlight') {
                    result += `${(payload as lsp.DocumentHighlight[]).length} highlights`
                } else if (method === 'textDocument/codeAction') {
                    result += `${(payload as lsp.CodeAction[]).length} code actions`
                } else if (method === 'textDocument/semanticTokens/full' || method === 'textDocument/semanticTokens/range') {
                    if (message.serverName) {
                        message.extraData = this.semanticLegend[message.serverName]
                    }
                    result += `${(payload as lsp.SemanticTokens).data.length / 5} tokens`
                }
            }
        }

        return result
    }
}

function toMessageTypeText(type: lsp.MessageType): string {
    switch (type) {
        case 1:
            return 'Error'
        case 3:
            return 'Info'
        case 4:
            return 'Log'
    }
    return 'Unknown Type'
}

logModel.registerLogProvider(new RemoteLogProvider())

if (connectionParams.value) {
    enabled.value = true
}

/**
 * Whether the URL fragment contains the connection parameters and should be cleared so that the token doesn't stay in
 * the address bar and the browser history.
 */
function isConnectionParamsInUrl(hash: string): boolean {
    return new URLSearchParams(hash.slice(1)).has('token')
}

export function useRemoteModel() {
    return {
        isConnectionParamsInUrl,
        connectionParams,
        connected,
        enabled,
        errorText,
        hasConnectedAtLeastOnce,
        paused,
        port,
    }
}
