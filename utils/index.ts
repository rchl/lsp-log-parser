import SublimeParser from './parsers/sublime'
import VSCodeParser from './parsers/vscode'

export * from './parsers/types'
export const parsers = [SublimeParser, VSCodeParser]
