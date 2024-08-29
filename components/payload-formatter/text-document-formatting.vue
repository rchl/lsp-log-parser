<template>
    <div v-if="typeof payload !== 'string'">
        <v-expansion-panels>
            <v-expansion-panel
                v-for="(change, index) in payload"
                :key="index"
            >
                <v-expansion-panel-title>
                    <div>start: line {{ change.range.start.line }}, character {{ change.range.start.character }}</div>
                    <div>end: line {{ change.range.end.line }}, character {{ change.range.end.character }}</div>
                </v-expansion-panel-title>
                <v-expansion-panel-text class="change-body">
                    <pre class="change-text">{{ change.newText }}</pre>
                </v-expansion-panel-text>
            </v-expansion-panel>
        </v-expansion-panels>
    </div>
</template>

<script setup lang="ts">
import { type Message } from '~/models/log-model'

defineProps<{
    payload: NonNullable<Message['payload']>
}>()
</script>

<style lang="scss" scoped>
.change-body {
  max-height: 70vh;
  overflow: auto;
  white-space: pre;
}

.change-text {
  display: inline-block;
}
</style>
