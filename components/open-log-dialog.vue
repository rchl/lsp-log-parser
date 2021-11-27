<template>
    <v-dialog
        v-model="uiModel.logDialogVisible.value"
        max-width="600px">
        <v-card>
            <v-card-title class="headline">
                Paste the log and press the button to parse
            </v-card-title>

            <v-card-text>
                <v-textarea
                    v-model="state.logContent"
                    autofocus
                    no-resize
                    filled
                    spellcheck="false"
                    data-gramm_editor="false"
                />
                <v-select
                    v-model="state.selectedParser"
                    :items="state.parserTypes"
                    label="Log type"
                    :hint="state.selectedParserHint"
                    persistent-hint
                    solo
                />
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-tooltip left>
                    <template #activator="{ on }">
                        <v-btn
                            v-shortkey="[cmdOrCtrl, 'enter']"
                            color="primary"
                            @shortkey.native="uiModel.logDialogVisible.value ? parseLog() : null"
                            @click="parseLog"
                            v-on="on"
                        >
                            Parse
                        </v-btn>
                    </template>
                    <span>Parse log text ({{ cmdOrCtrl }}-ENTER)</span>
                </v-tooltip>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script lang="ts">
import { defineComponent, reactive, toRef, watch, watchEffect } from '@vue/composition-api'
import { ParseResults, useLogModel } from '~/models/log-model'
import { useParserModel } from '~/models/parser-model'
import { useUiModel } from '~/models/ui-model'
import parsers from '~/models/parsers'

export default defineComponent({
    setup(_, { root }) {
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

            root.$nextTick(() => (state.selectedParserHint = parser ? 'auto-detected from log content' : ''))
        })

        watch(toRef(state, 'selectedParser'), () => {
            state.selectedParserHint = ''
        })

        watchEffect(() => {
            if (!uiModel.logDialogVisible.value) {
                state.logContent = ''
            }
        })

        return {
            parseLog,
            state,
            uiModel,
        }
    },
})
</script>
