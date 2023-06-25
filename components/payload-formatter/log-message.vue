<template>
    <v-alert
        :type="alertType"
        :icon="alertType ? null : 'mdi-console-line'"
        rounded="0"
        class="ma-0"
    >
        <span class="pre-wrap">{{ typeof payload === 'string' ? payload : payload.message }}</span>
    </v-alert>
</template>

<script setup lang="ts">
import { Message } from '~/models/log-model'

const props = defineProps<{
    payload: NonNullable<Message['payload']>
}>()

const mapping: Record<number, 'error' | 'warning' | 'info' | undefined> = {
    1: 'error',
    2: 'warning',
    3: 'info',
    4: undefined,
}
const messageType = typeof props.payload === 'string' ? '' : props.payload.type
const alertType = mapping[messageType]
</script>

<style lang="scss" scoped>
.pre-wrap {
  white-space: pre-wrap;
}
</style>
