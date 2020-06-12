import { ref, watch } from '@vue/composition-api'
import { useLogModel } from '~/models/log-model'
import { Message } from '~/utils'

const connected = ref(false)
const enabled = ref(false)
const errorText = ref('s')
const id = ref(0)
const socket = ref<WebSocket | null>(null)

watch(enabled, (isEnabled) => {
  if (isEnabled) {
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

  socket.value = new WebSocket('ws://localhost:9981')
  socket.value.onopen = onOpen
  socket.value.onmessage = onMessage
  socket.value.onclose = onClose
  socket.value.onerror = onError
}

function closeConnection () {
  connected.value = false
  errorText.value = ''

  if (socket.value) {
    socket.value.close()
    socket.value = null
  }
}

function onOpen () {
  errorText.value = ''
  connected.value = true
}

function onError (event: Event) {
  console.info({ event })
}

function onClose (event: CloseEvent) {
  if (!event.wasClean) {
    connected.value = false
    socket.value = null
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
    return
  }

  const message: Message = {
    id: ++id.value,
    requestId: data.id,
    name: data.method,
    type: data.method,
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
    id,
    socket
  }
}
