<template>
    <v-dialog
        v-model="uiModel.logDialogVisible.value"
        max-width="600px"
    >
        <v-card>
            <v-card-title class="text-h5">
                Paste the log and press the button to parse
            </v-card-title>

            <v-card-text>
                <v-textarea
                    v-model="state.logContent"
                    autofocus
                    no-resize
                    spellcheck="false"
                    data-gramm_editor="false"
                />
                <v-select
                    v-model="state.selectedParser"
                    :items="state.parserTypes"
                    label="Log type"
                    :hint="state.selectedParserHint"
                    persistent-hint
                />
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn @click="uiModel.logDialogVisible.value = false">
                    Cancel
                </v-btn>
                <v-btn
                    color="primary"
                    @click="parseLog"
                >
                    Parse
                    <v-tooltip
                        activator="parent"
                        location="left"
                    >
                        Parse log text (cmdOrCtrl-ENTER)
                    </v-tooltip>
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { nextTick, reactive, toRef, watch, watchEffect } from 'vue'
import { useMagicKeys } from '@vueuse/core'
import { type ParseResults, useLogModel } from '~/models/log-model'
import { useParserModel } from '~/models/parser-model'
import { useUiModel } from '~/models/ui-model'
import { parsers } from '~/models/parsers'

useMagicKeys({
    passive: false,
    onEventFired(e) {
        if (e.metaKey && e.key === 'Enter' && e.type === 'keydown') {
            e.preventDefault()
            if (uiModel.logDialogVisible.value) {
                parseLog()
            }
        }
    },
})

const state = reactive({
    logContent: '',
    parserTypes: parsers.map(p => p.name),
    selectedParser: parsers[0].name,
    selectedParserHint: '',
})

const logModel = useLogModel()
const parserModel = useParserModel()
const uiModel = useUiModel()

function parseLog() {
    uiModel.logDialogVisible.value = false
    state.selectedParserHint = ''

    const content = state.logContent
    const inputLines = content.split('\n').filter(line => Boolean(line))
    const parser = parsers.find(p => p.name === state.selectedParser)

    if (parser) {
        let results: ParseResults = { lines: [], filters: [] }

        try {
            results = parser.parse(inputLines)
        } catch (error) {
            if (error instanceof Error) {
                uiModel.showError(error.message)
            }
        }

        logModel.setParseResults(results)
        uiModel.resetState()
    }
}

watchEffect(() => {
    const parser = parserModel.contentSniffParser(state.logContent.substr(0, 500).split('\n'))

    if (parser) {
        state.selectedParser = parser.name
    }

    nextTick(() => (state.selectedParserHint = parser ? 'auto-detected from log content' : '')).catch(() => {})
})

watch(toRef(state, 'selectedParser'), () => {
    state.selectedParserHint = ''
})

watchEffect(() => {
    if (!uiModel.logDialogVisible.value) {
        state.logContent = ''
    }
})
</script>
