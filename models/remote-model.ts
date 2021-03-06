import { ref, watch } from '@vue/composition-api'
import { Message, useLogModel } from '~/models/log-model'

let lastId = 0
let socket: WebSocket | null = null
const connected = ref(false)
const enabled = ref(false)
const hasConnectedAtLeastOnce = ref(false)
const errorText = ref('')

watch(enabled, (isEnabled) => {
  if (isEnabled) {
    hasConnectedAtLeastOnce.value = false
    initializeConnection()
  } else {
    closeConnection()
  }
})

const logModel = useLogModel()

function initializeConnection () {
  errorText.value = ''
  createWebSocket()
}

function createWebSocket () {
  if (!enabled.value) {
    console.info('Not enabled, not creating new connection')
    return
  }

  socket = new WebSocket('ws://localhost:9981')
  socket.onopen = onOpen
  socket.onmessage = onMessage
  socket.onclose = onClose
  socket.onerror = onError
}

function closeConnection () {
  console.info('Triggered manual close')
  connected.value = false
  errorText.value = ''

  if (socket) {
    socket.close()
    socket = null
  }
}

function onOpen () {
  console.info('Connection opened')
  errorText.value = ''
  connected.value = true
  hasConnectedAtLeastOnce.value = true
}

function onError (event: Event) {
  console.info('Got error event', event)
}

function onClose (event: CloseEvent) {
  console.info('onClose', event)
  if (!event.wasClean) {
    connected.value = false
    socket = null

    if (enabled.value) {
      const reason = event.reason ? event.reason : `code: ${event.code}`
      errorText.value = `Error connecting to remote (${reason})`
      console.info('Unclean shutdown, retrying...')
      setTimeout(createWebSocket, 2000)
    }
  }
}

function onMessage (event: MessageEvent) {
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
    id: ++lastId,
    isExpanded: false,
    requestId: data.id,
    pairKey: isRequestOrResponse ? `${data.server || ''}-${initiatedByServer ? 's' : 'c'}-${data.id}` : '',
    name: data.method,
    type: isRequestOrResponse ? 'reqres' : data.isError ? 'error' : 'notification',
    isError: data.isError,
    time: new Date(data.time).toLocaleTimeString(),
    timestamp: data.time,
    toServer,
    serverName: data.server,
    payloadTabIndex: 0
  }

  if (data.params) {
    message.payload = data.params
  }

  logModel.appendLogMessage(message)
}

export function useRemoteModel () {
  return {
    connected,
    enabled,
    errorText,
    hasConnectedAtLeastOnce
  }
}
