import { ref, watch } from '@vue/composition-api'
import { useLogModel } from '~/models/log-model'
import { Message } from '~/utils'

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
    return
  }

  socket = new WebSocket('ws://localhost:9981')
  socket.onopen = onOpen
  socket.onmessage = onMessage
  socket.onclose = onClose
  socket.onerror = onError
}

function closeConnection () {
  connected.value = false
  errorText.value = ''

  if (socket) {
    socket.close()
    socket = null
  }
}

function onOpen () {
  errorText.value = ''
  connected.value = true
  hasConnectedAtLeastOnce.value = true
}

function onError (event: Event) {
  console.info({ event })
}

function onClose (event: CloseEvent) {
  if (!event.wasClean) {
    connected.value = false
    socket = null
    const reason = event.reason ? event.reason : `code: ${event.code}`
    errorText.value = `Error connecting to remote (${reason})`

    setTimeout(createWebSocket, 2000)
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

  const message: Message = {
    id: ++lastId,
    isExpanded: false,
    requestId: data.id,
    name: data.method,
    type: data.method,
    isError: data.isError,
    time: new Date(data.time).toLocaleTimeString(),
    toServer: data.direction === 1,
    filter: data.server
  }

  if (data.params) {
    // @ts-ignore
    message.child = { name: data.params }
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
