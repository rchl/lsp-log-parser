<template>
    <div>
        <v-alert
            type="info"
            rounded="0"
            class="ma-0"
        >
            Offsets are 1-based
        </v-alert>
        <v-table density="compact">
            <thead>
                <tr><th>Line</th><th>Column </th><th>Token Type</th><th>Token Modifiers</th></tr>
            </thead>
            <tbody>
                <tr
                    v-for="(token, i) in formattedTokens"
                    :key="i"
                >
                    <td>{{ token.line + 1 }}</td>
                    <td>{{ token.col + 1 }}-{{ token.end + 1 }}</td>
                    <td>{{ token.type }}</td>
                    <td>{{ token.modifiers }}</td>
                </tr>
            </tbody>
        </v-table>
    </div>
</template>

<script setup lang="ts">
import type lsp from 'vscode-languageserver-protocol'
import type { Message } from '~/models/log-model'

const props = defineProps<{
    tokenLegend?: lsp.SemanticTokensLegend
    payload: NonNullable<Message['payload']>
}>()

const tokens = (props.payload as lsp.SemanticTokens).data.slice()
const formattedTokens: {line: number; col: number; end: number; type: number | string; modifiers: string}[] = []
let prevLine = 0
let prevCol = 0
while (tokens.length) {
    const [deltaLine, deltaCol, length, type, encodedModifiers] = tokens.splice(0, 5)
    const line = prevLine + deltaLine
    const col = prevLine === line ? prevCol + deltaCol : deltaCol
    prevLine = line
    prevCol = col

    let decodedModifiers: string = encodedModifiers.toString(2)
    if (props.tokenLegend?.tokenModifiers) {
        decodedModifiers = Array.from(decodedModifiers)
            .reverse()
            .map((modifier, i) => {
                if (modifier === '1') {
                    return props.tokenLegend?.tokenModifiers[i] ?? modifier
                } else {
                    return null
                }
            })
            .filter(v => v !== null)
            .join(', ')
    }

    formattedTokens.push({
        line,
        col,
        end: col + length,
        type: props.tokenLegend?.tokenTypes[type] ?? type,
        modifiers: decodedModifiers,
    })
}
</script>
